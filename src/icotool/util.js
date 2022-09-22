import path from "path";
import fs from "fs";
import { fileTypeFromFile } from "file-type";
import sharp from "sharp";
import ICO from "sharp-ico";
import { framesFromIco, sharpToBase64 } from "@/util/converter";
import { showError } from "@/util/message";
import { iconSizes } from "@/contextmenu/icoTool";

export const defaultSetting = {
  imageZoom: 0,
  iconMargin: 0,
  borderRadius: 0,
  offsetX: 0,
  offsetY: 0,
  fit: "contain",
  kernel: "lanczos3",
};

export function getIconSize(width, height) {
  const size =
    iconSizes.findLast(({ value }) => width >= value || height >= value) ||
    iconSizes[0];
  return size.value;
}

export const exeRule = /\.(exe|dll|ocx|cpl)$/i;
export const lnkRule = /\.lnk/i;
export const icoRule = /\.ico$/i;
export async function isValidSourceFile(file) {
  return (
    fs.existsSync(file) && fs.statSync(file).isFile() && exeRule.test(file)
  );
}
export async function isValidFolder(folder) {
  return fs.existsSync(folder) && fs.statSync(folder).isDirectory();
}
export async function isValidIcoFile(file) {
  return (
    fs.existsSync(file) &&
    fs.statSync(file).isFile() &&
    icoRule.test(file) &&
    (await fileTypeFromFile(file)).ext === "ico"
  );
}

export async function getIcons(icoPath, vue) {
  if (!(await isValidIcoFile(icoPath))) {
    showError(`${icoPath} ${vue.$t("icoTool.notValidIcoFile")}`);
    return null;
  }
  const { name } = path.parse(icoPath);
  let images = [];
  let icons = [];
  try {
    icons = framesFromIco(icoPath, {}, true);
  } catch (e) {
    showError(vue.$t("message.error"), e);
    return null;
  }
  icons.sort((a, b) => b.width - a.width);
  icons = await Promise.all(
    icons.map(async ({ image, width, height }) => {
      images.push(image);
      const size = getIconSize(width, height);
      const base64 = await sharpToBase64(image);
      return { ...defaultSetting, name, width, height, size, base64 };
    })
  ).catch(() => []);
  return { icons, images };
}

export async function processIcon(icon, image) {
  let {
    width,
    height,
    size,
    imageZoom,
    iconMargin,
    borderRadius,
    offsetX,
    offsetY,
    fit,
    kernel,
  } = icon;
  let result = image.clone();

  if (offsetX || offsetY) {
    const x = ((width * offsetX) / 100) << 0;
    const y = ((height * offsetY) / 100) << 0;
    result
      .extract({
        left: -Math.min(0, x),
        top: -Math.min(0, y),
        width: width - Math.abs(x),
        height: height - Math.abs(y),
      })
      .extend({
        left: Math.max(0, x),
        top: Math.max(0, y),
        right: -Math.min(0, x),
        bottom: -Math.min(0, y),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
    result = sharp(await result.toBuffer());
  }

  if (imageZoom) {
    let value = (((Math.min(width, height) / 2) * imageZoom) / 100) << 0;
    if (imageZoom > 0) {
      result.extract({
        left: value,
        top: value,
        width: width - value * 2,
        height: height - value * 2,
      });
    } else {
      value *= -1;
      result.extend({
        left: value,
        top: value,
        right: value,
        bottom: value,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
    }
    width -= value * 2;
    height -= value * 2;
  }

  if (width !== size || height !== size) {
    result.resize({
      width: size,
      height: size,
      fit,
      kernel,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  if (borderRadius) {
    const radius = ((size / 2) * borderRadius) / 100;
    const rect = Buffer.from(
      `<svg><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></svg>`
    );
    result.composite([{ input: rect, blend: "dest-in" }]);
    result = sharp(await result.toBuffer());
  }

  if (iconMargin) {
    const newSize = Math.max(1, size - iconMargin * 2);
    result
      .resize({
        width: newSize,
        height: newSize,
      })
      .extend({
        top: iconMargin,
        bottom: iconMargin,
        left: iconMargin,
        right: iconMargin,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
  }

  return result;
}

export async function sharpsToIco(imageList, fileOut) {
  const bufferList = await Promise.all(
    imageList.map((image) => {
      return image.toFormat("png").toBuffer({ resolveWithObject: true });
    })
  );
  try {
    const icoBuffer = ICO.encode(bufferList.map((buffer) => buffer.data));
    fs.writeFileSync(fileOut, icoBuffer);
    return {
      width: Math.max(...bufferList.map((buffer) => buffer.info.width)),
      height: Math.max(...bufferList.map((buffer) => buffer.info.height)),
      size: icoBuffer.length,
    };
  } catch (err) {
    return Promise.reject(err);
  }
}
