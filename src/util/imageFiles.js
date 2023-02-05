import { promises as fs } from "fs";
import path from "path";
import { handleDropFiles } from "./util";

export const openAccept =
  ".png,.jpg,.jpeg,.webp,.gif,.svg,.tif,.tiff,.avif,.heif,.bmp,.ico";
export const saveAccept = ".png,.jpg,.webp,.gif,.tif,.avif,.heif,.bmp,.ico";
export const openAcceptRule =
  /.(jpg|jpeg|png|webp|gif|svg|tif|tiff|avif|heif|bmp|ico)$/i;
export const saveAcceptRule =
  /.(jpg|jpeg|png|webp|gif|tif|tiff|avif|heif|bmp|ico)$/i;

function compareFiles(a, b) {
  return a.name.length - b.name.length || (a.name > b.name ? 1 : -1);
}
export async function getImages(files, isReadFolders, images = [], rootPath) {
  for (let i = 0, length = files.length; i < length; i++) {
    const file = files[i];
    const stat = await fs.stat(file);
    if (stat.isDirectory()) {
      if (isReadFolders) {
        const subfiles = await fs.readdir(file);
        await getImages(
          subfiles.map((subfile) => path.join(file, subfile)),
          isReadFolders,
          images,
          rootPath || file
        );
      }
    } else {
      if (openAcceptRule.test(file)) {
        images.push({
          rootPath,
          path: file,
          name: path.basename(file),
          size: stat.size,
        });
      }
    }
  }
  images.sort(compareFiles);
  return images;
}

export function handleDropImages(handler, isReadFolders) {
  handleDropFiles(async (files) => {
    const imageFiles = await getImages(
      files.map((file) => file.path),
      typeof isReadFolders === "function" ? isReadFolders() : isReadFolders
    );
    handler(imageFiles);
  });
}
