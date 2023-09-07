import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import { getSharp } from "@/util/converter";
import { getOutputPath } from "@/util/util";

export async function save(
  groups,
  { outputFolder, format, quality },
  onProgress
) {
  // console.log(groups, outputFolder);

  for (let group of groups) {
    // do nothing
    if (group.images.length === 1 && group.split.lines.length === 0) {
      const image = group.images[0];
      const dest = path.join(outputFolder, image.name);
      await fs.copy(image.path, getOutputPath(dest));
      onProgress(group.index);
      continue;
    }

    // join
    const { totalWidth, totalHeight } = group;
    const { margin } = group.join;
    const isJoinH = group.join.direction === "horizontal";
    const background =
      group.join.background ||
      (format === "JPEG" ? "#FFFFFF" : { r: 0, g: 0, b: 0, alpha: 0 });
    const images = group.images.slice(0);
    if (group.join.reverse) images.reverse();
    const joinedName = images
      .map((image) => path.parse(image.path).name)
      .join("_");
    let joined;
    if (images.length > 1) {
      const _images = [];
      let top = 0;
      let left = 0;
      for (let image of images) {
        const _image = await getSharp({ input: image.path, toAnimated: false });
        _image.resize({
          width: image.width,
          height: image.height,
          fit: "contain",
          background,
        });
        _images.push({
          input: await _image.toBuffer(),
          top: isJoinH ? Math.floor((totalHeight - image.height) / 2) : top,
          left: !isJoinH ? Math.floor((totalWidth - image.width) / 2) : left,
        });
        if (isJoinH) left += image.width + margin;
        else top += image.height + margin;
      }

      joined = sharp({
        create: {
          width: totalWidth,
          height: totalHeight,
          channels: 4,
          background,
        },
      }).composite(_images);
    } else {
      joined = await getSharp({
        input: images[0].path,
        toAnimated: false,
      });
    }

    // format
    let ext;
    if (format === "JPEG") {
      ext = "jpg";
      joined.jpeg({ quality });
    } else {
      ext = "png";
      joined.png({ palette: true, quality });
    }

    // split
    const isSplitH = group.split.direction === "horizontal";
    const splitReverse = group.split.reverse;
    if (group.split.lines.length > 0) {
      const splitLines = group.split.lines
        .map((v) => Math.round(v))
        .concat(isSplitH ? totalWidth : totalHeight)
        .sort((a, b) => a - b);
      const splitCount = splitLines.length;
      const maxLength = String(splitCount).length;
      joined = sharp(await joined.toBuffer());
      let v = 0;
      for (let i = 0; i < splitCount; i++) {
        const pIndex = splitReverse ? splitCount - i : i + 1;
        const pName = "p" + String(pIndex).padStart(maxLength, "0");
        const output = path.join(outputFolder, `${joinedName}_${pName}.${ext}`);
        await joined
          .clone()
          .extract({
            left: isSplitH ? v : 0,
            top: !isSplitH ? v : 0,
            width: isSplitH ? splitLines[i] - v : totalWidth,
            height: !isSplitH ? splitLines[i] - v : totalHeight,
          })
          .toFile(getOutputPath(output));
        v = splitLines[i];
      }
    } else {
      const output = path.join(outputFolder, `${joinedName}.${ext}`);
      await joined.toFile(getOutputPath(output));
    }

    onProgress(group.index);
  }
}