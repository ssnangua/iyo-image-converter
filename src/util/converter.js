import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import { fileTypeFromFile } from "file-type";
import BMP from "sharp-bmp";
import ICO from "sharp-ico";
import GIF from "sharp-gif2";
import APNG from "sharp-apng";
import UPNG from "upng-js";
import { formatsMap } from "@/preset/formats";
import { comparePaths, formatDate, isUndefined } from "./util";
import { openAcceptRule } from "./imageFiles";

sharp.cache(false);
// console.log(sharp.format);

// `to-data-view` (for `decode-ico`) will check if input buffer is an instance of ArrayBuffer,
// but NW.js has a different context, causing the check to fail,
// so convert to Uint8Array here.
export function framesFromIco(input, options, resolveWithObject = true) {
  const buffer = fs.readFileSync(input);
  const arrayBuffer = new Uint8Array(buffer).buffer;
  const icons = ICO.sharpsFromIco(arrayBuffer, options, resolveWithObject);
  icons.sort((a, b) => b.width - a.width);
  return icons;
}

// Decode APNG image and return the first frame
function getApngFirstFrame(input) {
  const buffer = typeof input === "string" ? fs.readFileSync(input) : input;
  const decoder = UPNG.decode(buffer);
  const frames = UPNG.toRGBA8(decoder);
  return sharp(Buffer.from(frames[0]), {
    raw: {
      width: decoder.width,
      height: decoder.height,
      channels: 4,
    },
  });
}

export async function isAnimated(input, ext) {
  return (
    ext === "apng" ||
    ((ext === "gif" || ext === "webp") &&
      (await sharp(input).metadata()).pages > 1)
  );
}

export function isSharp(input) {
  return (
    input !== null &&
    typeof input === "object" &&
    typeof input.metadata === "function"
  );
}

export async function getSharp(task, options) {
  if (typeof task === "string") task = { input: task };
  let { input, ext, animated, toAnimated } = task;
  if (!ext) ext = (await fileTypeFromFile(input)).ext;
  animated = animated && toAnimated;

  if (ext === "bmp") {
    // @see https://github.com/lovell/sharp/issues/806#issuecomment-419661745
    return BMP.sharpFromBmp(input);
  }
  if (ext === "ico") {
    // @see https://github.com/lovell/sharp/issues/1118#issuecomment-1205599759
    return framesFromIco(input, options, false)[0];
  }
  if (ext === "apng") {
    return animated
      ? APNG.sharpFromApng(input, {
          ...options,
          format: options?.transparent ? "rgba444" : "rgb565",
        })
      : getApngFirstFrame(input);
  }
  if ((ext === "gif" || ext === "webp") && !animated) {
    // const reader = GIF.readGif(sharp(input, options));
    // const frames = await reader.toFrames();
    // return frames[0];
    return sharp(input, { animated: false, pages: 1, page: 0, ...options });
  }
  return sharp(input, { animated, ...options });
}

function getOutputFolder(task) {
  const { outputFolder } = task.general;
  if (outputFolder) {
    fs.ensureDirSync(outputFolder);
    return outputFolder;
  } else {
    return path.dirname(task.input);
  }
}

function getOutputPath(
  task,
  folder = "",
  suffix = "",
  overwriteOutputFile = task.general.overwriteOutputFile
) {
  const { general, format, filename } = task;
  const { appendFilename } = general;
  const outputFolder = folder || getOutputFolder(task);
  const ext = format.ext || `.${task.ext === "apng" ? "png" : task.ext}`;
  let name = path.parse(filename).name + suffix + appendFilename;
  let output = path.join(outputFolder, name + ext);
  if (!overwriteOutputFile) {
    let temp = name;
    while (fs.existsSync(output)) {
      const index = Number((/~(\d+)$/.test(temp) && RegExp.$1) || 0) + 1;
      temp = `${name}~${index}`;
      output = path.join(outputFolder, temp + ext);
    }
  }
  return output;
}

export async function rotateImage(image, task, angle, background) {
  const transparent = typeof background === "object";
  // Sharp rotate is not supporte for multi-page images
  if (task.animated && task.toAnimated) {
    const { delay } = await image.metadata();
    const reader = GIF.readGif(image);
    const frames = await reader.toFrames();
    reader.frames = await Promise.all(
      frames.map(async (frame) => {
        frame.png().rotate(angle, { background });
        return sharp(await frame.toBuffer());
      })
    );
    const gif = await reader.toGif({
      transparent,
      format: transparent ? "rgba4444" : "rgb565",
      delay,
    });
    image = await gif.toSharp();
  } else {
    const { type } = task.format;
    if (transparent) {
      // Ensure alpha channel
      if (type === "apng") {
        image.png();
      } else if (!/raw|tiny|bmp|ico/.test(type)) {
        image.toFormat(type);
      }
    }
    if (type === "jpeg") background = "#FFFFFF";
    image.rotate(angle, { background });
  }
  return image;
}

async function setModifier(image, task) {
  const background = task.modifier.background || { r: 0, g: 0, b: 0, alpha: 0 };

  // rotate
  const { enableRotate, angle, flop, flip } = task.modifier;
  if (enableRotate) {
    if (angle !== 0) image = await rotateImage(image, task, angle, background);
    if (flop) image.flop();
    if (flip) image.flip();
  }

  // resize
  const { enableResize, resizeType, width, height, fit, kernel } =
    task.modifier;
  if (enableResize && width > 0 && height > 0) {
    // apply rotate
    if (enableRotate && (angle !== 0 || flop || flip)) {
      image = sharp(await image.toBuffer(), {
        animated: task.animated && task.toAnimated,
      });
    }
    const metadata = await image.metadata();
    image.resize({
      fit,
      width:
        resizeType === "pixels"
          ? width
          : Math.round((metadata.width * width) / 100),
      height:
        resizeType === "pixels"
          ? height
          : Math.round((metadata.height * height) / 100),
      kernel,
      background,
    });
  }

  return image;
}

async function setWatermark(image, task) {
  const { enable, image: input } = task.watermark;
  if (!enable || !input || !fs.existsSync(input)) return;

  const ext = (await fileTypeFromFile(input)).ext;
  if (!openAcceptRule.test("." + ext)) return;

  const { position, marginX, marginY } = task.watermark;
  const animated = task.animated && task.toAnimated;
  let { width, height, pageHeight } = await image.metadata();
  height = pageHeight || height;

  // watermark
  const watermark = await getSharp({ ext, input });
  const meta = await watermark.metadata();
  const boundWidth = width - marginX;
  const boundHeight = height - marginY;
  const alignTop = /top/.test(position);
  const alignBottom = /bottom/.test(position);
  const alignLeft = /left/.test(position);
  const alignRight = /right/.test(position);
  const wLeft = alignLeft ? 0 : Math.max(0, meta.width - boundWidth);
  const wTop = alignTop ? 0 : Math.max(0, meta.height - boundHeight);
  const wWidth = Math.min(boundWidth, meta.width);
  const wHeight = Math.min(boundHeight, meta.height);
  watermark.extract({
    left: wLeft,
    top: wTop,
    width: wWidth,
    height: wHeight,
  });

  // composite watermark
  const autoX = width - wWidth - marginX;
  const autoY = height - wHeight - marginY;
  if (animated) {
    watermark.extend({
      top: alignTop ? marginY : autoY,
      left: alignLeft ? marginX : autoX,
      bottom: alignBottom ? marginY : autoY,
      right: alignRight ? marginX : autoX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }
  image.composite([
    {
      input: await watermark.toBuffer(),
      tile: animated,
      top: alignTop ? marginY : autoY,
      left: alignLeft ? marginX : autoX,
    },
  ]);
}

export const ext2type = { jpg: "jpeg" };

/**
 * convert image
 */
async function convert(setting, task, fileOut, input) {
  const { type } = task.format;

  const inputOptions =
    task.inputOptions || setting[ext2type[task.ext] || task.ext];

  if (type === "ico" && task.ext === "ico" && task.rawOrTiny) {
    const images = framesFromIco(task.input, inputOptions, false);
    return ICO.sharpsToIco(images, fileOut);
  }

  let image = input || (await getSharp(task, inputOptions));

  // modifier
  image = await setModifier(image, task);

  // density
  const { forceDensity, density } = task.modifier;
  if (forceDensity) {
    image.withMetadata({ density });
  }

  // watermark
  if (task.ext !== "ico" && type !== "ico") {
    await setWatermark(image, task);
  }

  if (type === "bmp") {
    return BMP.sharpToBmp(image, fileOut);
  }

  if (type === "ico") {
    const { includeSizes: sizes, kernel } = task.options;
    return ICO.sharpsToIco(
      [image],
      fileOut,
      sizes.length > 0 ? { sizes, resizeOptions: { kernel } } : undefined
    );
  }

  if (type === "apng") {
    const { lossless, cnum } = task.options;
    return APNG.sharpToApng(image, fileOut, lossless ? undefined : { cnum });
  }

  if (type === "jpeg") {
    image.ensureAlpha().flatten({ background: "#FFFFFF" });
  }

  image.toFormat(type, {
    ...setting[type],
    ...task.options,
  });

  // Create a copy to ensure the input file can be overwritten
  if (comparePaths(fileOut, task.input)) {
    image = sharp(await image.toBuffer(), {
      animated: task.animated && task.toAnimated,
    });
  }

  return image.toFile(fileOut);
}

/**
 * Raw/Tiny
 */
async function toInputFormat(setting, task, output) {
  const type = ext2type[task.ext] || task.ext;
  const format = formatsMap[type];
  const options = { ...setting[type], ...task.options[type] };
  const rawOrTiny = task.format.type === "raw" || task.format.type === "tiny";
  return convert(setting, { ...task, format, options, rawOrTiny }, output);
}

/**
 * Create a new folder for extract frames from ICO and animated GIF/WebP
 */
function ensureFramesFolder(task) {
  const folder = path.join(getOutputFolder(task), path.parse(task.input).name);
  fs.ensureDirSync(folder);
  return folder;
}

/**
 * GIF/WebP to frames
 */
async function toFrames(setting, task) {
  const { extractFrames, newFolder } = task.general;
  const frames =
    task.ext === "apng"
      ? APNG.framesFromApng(task.input)
      : await GIF.readGif(sharp(task.input, { animated: true })).toFrames();
  let output, info;
  if (extractFrames === "firstFrame") {
    output = getOutputPath(task);
    info = await convert(setting, task, output, frames[0]);
  } else {
    const folder = newFolder ? ensureFramesFolder(task) : undefined;
    for (let i = 0; i < frames.length; i++) {
      output = getOutputPath(task, folder, "-" + i);
      info = await convert(setting, task, output, frames[i]);
    }
  }
  return { output, ...info };
}

/**
 * ICO to icons
 */
async function toIcons(setting, task) {
  const { extractFrames, extractSizes, newFolder, kernel } =
    task.inputOptions || setting.ico;
  let info, output;
  const frames = framesFromIco(task.input, {}, true);
  if (extractFrames === "largestFrame") {
    const { image, width, height } = frames[0];
    output = getOutputPath(task, null, `-${width}x${height}`);
    info = await convert(setting, task, output, image);
  } else if (extractFrames === "allFrames") {
    const folder = newFolder ? ensureFramesFolder(task) : "";
    for (let frame of frames) {
      const { image, width, height } = frame;
      output = getOutputPath(task, folder, `-${width}x${height}`, false);
      info = await convert(setting, task, output, image);
    }
  } else {
    const folder = newFolder ? ensureFramesFolder(task) : "";
    for (let size of extractSizes) {
      const closestFrame =
        frames.findLast((frame) => frame.width >= size) || frames[0];
      const image =
        closestFrame.width === size
          ? closestFrame.image.clone()
          : closestFrame.image.clone().resize({
              width: size,
              height: size,
              fit: "contain",
              kernel,
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            });
      output = getOutputPath(task, folder, `-${size}x${size}`);
      info = await convert(setting, task, output, image);
    }
  }
  return { output, ...info };
}

let processing = false;

export default {
  async start(setting, tasks, progress, vue) {
    processing = true;

    for (let i = 0, length = tasks.length; i < length; i++) {
      if (processing === false) return;
      const task = tasks[i];

      if (task.state === "waiting") {
        task.state = "processing";
        progress(i, length, task);

        if (!fs.existsSync(task.input)) {
          task.error = vue.$t("message.notExist", { path: task.input });
          task.state = "failed";
          progress(i, length, task);
          continue;
        }

        if (isUndefined(task.ext)) {
          task.ext = (await fileTypeFromFile(task.input)).ext;
        }

        if (isUndefined(task.animated)) {
          task.animated = await isAnimated(task.input, task.ext);
        }

        const { type } = task.format;
        task.toAnimated =
          task.animated &&
          task.general.outputAnimated &&
          /apng|gif|webp|raw|tiny/.test(type);

        const output = getOutputPath(task);
        let converter;

        if (task.animated && !task.toAnimated) {
          converter = toFrames(setting, task);
        } else if (type === "raw" || type === "tiny" || type === task.ext) {
          converter = toInputFormat(setting, task, output);
        } else if (task.ext === "ico") {
          converter = toIcons(setting, task, output);
        } else {
          converter = convert(setting, task, output);
        }

        await converter
          .then((info) => {
            task.state = "completed";
            task.output = info.output || output;
            task.outputSize = info.size || fs.statSync(task.output).size;
            progress(i, length, task);
          })
          .catch((err) => {
            console.warn(err);
            task.error = err;
            task.state = "failed";
            progress(i, length, task);
          });
      }
    }
  },

  stop() {
    processing = false;
  },
};

export async function getImageInfo(filePath) {
  const { ext } = await fileTypeFromFile(filePath);
  const stat = fs.statSync(filePath);
  let metadata, pages;
  if (ext === "bmp") {
    const buffer = await fs.promises.readFile(filePath);
    metadata = BMP.decode(buffer);
  } else if (ext === "ico") {
    const icons = framesFromIco(filePath, {}, true);
    const { width, height } = icons[0];
    metadata = { pages: icons.length, width, height };
  } else {
    metadata = await sharp(filePath, { animated: false, pages: 1, page: 0 })
      .toFormat("png")
      .metadata();
  }
  if (ext === "apng") {
    pages = APNG.framesFromApng(filePath).length;
  }
  const { dir, base, name } = path.parse(filePath);
  return {
    location: filePath,
    dirname: dir,
    filename: base,
    name,
    ext,
    type: ext.toUpperCase(),
    size: stat.size,
    date: formatDate(stat.mtime),
    width: metadata.width,
    height: metadata.height,
    density: metadata.density,
    pages: pages || metadata.pages,
  };
}

/**
 * Get frames from GIF/WebP/APNG/ICO
 * @returns {Object}
 *  @param {String}   ext
 *  @param {sharp[]}  frames
 *  @param {Number}   width
 *  @param {Number}   height
 *  @param {Number[]} delay
 *  @param {Array<{ width: Number, height: Number }>}  sizes (ICO only)
 */
export async function getFrames(input, options, progress) {
  const { ext } = await fileTypeFromFile(input);
  const defDelay = 100;
  if (ext === "gif" || ext === "webp") {
    const image = sharp(input, { animated: true });
    const { width, height, pageHeight, delay } = await image.metadata();
    const frames = await GIF.readGif(image).toFrames(progress);
    return { ext, frames, width, height: pageHeight || height, delay };
  } else if (ext === "apng") {
    const apng = APNG.framesFromApng(input, true);
    apng.ext = ext;
    return apng;
  } else if (ext === "ico") {
    const icons = framesFromIco(input, options, true);
    const sizes = icons.map(({ width, height }) => ({ width, height }));
    const width = Math.max(...icons.map((icon) => icon.width));
    const height = Math.max(...icons.map((icon) => icon.height));
    const delay = new Array(icons.length).fill(defDelay);
    const frames = icons.map((icon) => icon.image);
    return { ext, frames, width, height, delay, sizes };
  } else if (ext === "bmp") {
    const bmp = BMP.sharpFromBmp(input, options, true);
    bmp.ext = ext;
    bmp.frames = [bmp.image];
    bmp.delay = [defDelay];
    return bmp;
  } else {
    const image = sharp(input);
    const { width, height } = await image.metadata();
    return { ext, frames: [image], width, height, delay: [defDelay] };
  }
}

let tempId = 0;
/**
 * Write image file
 * @param {Object} imageData
 *  @param {sharp} image
 *  @param {sharp[]} frames for animated GIF/WebP/APNG or multi size ICO
 * @param {String} output
 * @param {Object} options
 *  @param {Object} sharpOptions
 * @returns
 */
export async function sharpToFile(
  imageData,
  fileOut,
  options = {},
  progress = () => {}
) {
  let { frames = [] } = imageData;
  frames = frames.map((frame) => frame.clone());
  const { transparent, extendBackground } = options;
  if (transparent === false && extendBackground) {
    frames.forEach((frame) => {
      frame.ensureAlpha().flatten({ background: extendBackground });
    });
  }
  let image = imageData.image || frames[0].clone();

  if (!image) return Promise.reject("SharpToFile Error: No image.");

  if (/\.bmp$/i.test(fileOut)) {
    return BMP.sharpToBmp(image, fileOut);
  }

  if (/\.ico$/i.test(fileOut)) {
    return ICO.sharpsToIco(
      frames || [image],
      fileOut,
      frames ? undefined : options
    );
  }

  if (/\.(gif|webp)$/i.test(fileOut)) {
    const { height, pageHeight } = await image.metadata();
    if (
      (pageHeight && height !== pageHeight) ||
      (height === pageHeight && frames.length < 2)
    ) {
      return image.gif(options.sharpOptions).toFile(fileOut);
    } else {
      const gif = await GIF.createGif({
        ...options,
        format: transparent ? "rgba4444" : "rgb565",
      })
        .addFrame(frames)
        .toSharp(progress);
      return gif.gif(options.sharpOptions).toFile(fileOut);
    }
  }

  if (/\.png$/i.test(fileOut)) {
    const { height, pageHeight } = await image.metadata();
    if (pageHeight && height !== pageHeight && frames.length < 2) {
      frames = await GIF.readGif(image).toFrames();
    }
    if (frames.length > 1) {
      return APNG.framesToApng(frames, fileOut, options);
    }
  }

  if (/\.(jpg|jpeg)$/i.test(fileOut)) {
    image.ensureAlpha().flatten({ background: "#FFFFFF" });
  }

  if (fs.existsSync(fileOut)) {
    // Create a copy to ensure the input file can be overwritten (something is wrong)
    // image = sharp(await image.toBuffer());

    // Remove the existing file (fileOut may fail to write)
    // await fs.remove(fileOut);

    // Write to a temp path, then move it to fileOut
    const temp = path.join(nw.App.dataPath, ++tempId + path.extname(fileOut));
    return image
      .toFile(temp)
      .then(() => fs.move(temp, fileOut, { overwrite: true }));
  }

  return image.toFile(fileOut);
}

export async function sharpToBase64(image, resolveWithObject = false) {
  const buffer = await image.png().toBuffer();
  const base64 = `data:image/png;base64,${buffer.toString("base64")}`;
  return resolveWithObject ? { buffer, base64 } : base64;
}
