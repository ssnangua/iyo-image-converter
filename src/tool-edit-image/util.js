import path from "path";
import sharp from "sharp";
import { getSharp, rotateImage, sharpToFile, ext2type } from "@/util/converter";

export async function applyEditor(imageInfo, fileOut, editor) {
  const { location: input, ext, pages } = imageInfo;
  const { zoom, crop, rotateType, rotate, flip, flop, background } = editor;

  // image
  const toExt = path.extname(fileOut).substring(1);
  const type = ext2type[toExt] || toExt;
  const animated = pages > 1 && /gif|webp|png/i.test(toExt);
  const task = { input, ext, animated, toAnimated: animated, format: { type } };
  let image = await getSharp(task, { transparent: !background });

  // flatten background
  if (background) image.ensureAlpha().flatten({ background });
  else image.png();

  // rotate
  const angle = rotateType === "any" ? rotate : +rotateType;
  if (angle !== 0) {
    const defBg = /jpg|bmp/i.test(toExt)
      ? "#FFFFFF"
      : { r: 0, g: 0, b: 0, alpha: 0 };
    image = await rotateImage(image, task, angle, background || defBg);
  }
  // flop & flip
  if (flop) image.flop();
  if (flip) image.flip();
  // apply rotate result
  if (angle !== 0 || flop || flip) {
    image = sharp(await image.toBuffer(), { animated });
  }

  // crop
  const { width, height, left, top } = crop;
  if (width > 0 && height > 0) {
    image.extract({
      left: Math.round(left / zoom),
      top: Math.round(top / zoom),
      width: Math.round(width),
      height: Math.round(height),
    });
    // apply the modified results (need to read frames data if save as apng image)
    if (animated && toExt === "png") {
      image = sharp(await image.toBuffer(), { animated });
    }
  }

  return sharpToFile({ image }, fileOut);
}
