import path from "path";
import { showOpenDialog, showSaveDialog } from "nwjs-dialog";
import { getTextBuffer } from "@/util/canvas";
import { sharpToFile } from "@/util/converter";
import { showSuccess, showError, showLoading } from "@/util/message";
import { saveAccept, saveAcceptRule } from "@/util/imageFiles";

export async function saveImage(vue, images, ext) {
  const [fileOut] = await showSaveDialog({
    accept: "." + ext,
    nwsaveas: `${vue.frames[0].name}.${ext}`,
  }).catch(() => []);
  if (!fileOut) return;

  const { frames, setting, loop } = vue;
  const { width, height } = vue.image;
  let {
    transparent,
    background,
    resizeTo,
    resizeType,
    fit,
    kernel,
    maxColors,
  } = setting;
  background = transparent ? undefined : background || "#FFFFFF";
  const delay = frames.map((frame) => frame.delay);
  let loading;
  sharpToFile(
    // imageData
    {
      frames: images.map((image, index) => {
        const subtitle = vue.getSubtitle(index);
        return subtitle?.text
          ? image.frame
              .clone()
              .composite([{ input: getTextBuffer(width, height, subtitle) }])
          : image.frame;
      }),
    },
    fileOut,
    // options
    {
      width,
      height,
      delay,
      repeat: loop,
      transparent,
      maxColors,
      resizeTo,
      resizeType,
      resizeOptions: { fit, kernel, background },
      extendBackground: background,
      sharpOptions: { delay, loop },
    },
    // progress
    ({ total, encoded }) => {
      // console.log(`${encoded}/${total}`);
      const percent = Math.round((encoded / total) * 100);
      const text = `${vue.$t("animeTool.encoding")}…（${percent}%）`;
      if (!loading) {
        loading = showLoading({
          lock: true,
          text,
        });
      } else {
        loading.setText(text);
      }
    }
  )
    .then(() => {
      if (loading) loading.close();
      showSuccess(vue.$t("animeTool.saveSuccess"));
    })
    .catch((err) => {
      console.error(err);
      if (loading) loading.close();
      showError(vue.$t("animeTool.saveError"), err);
    });
}

export function saveFramesAs(vue, images) {
  const selected = images.filter((image) => image.item.selected);
  let saver;
  if (selected.length === 1) {
    const { item, frame } = selected[0];
    saver = showSaveDialog({
      nwsaveas: `${item.name}-${("0000" + item.index).substr(-4)}.png`,
      accept: saveAccept,
    }).then(([filePath]) => {
      if (!saveAcceptRule.test(filePath)) filePath += `.png`;
      return sharpToFile({ image: frame }, filePath);
    });
  } else {
    saver = showOpenDialog({
      nwdirectory: true,
      nwdirectorydesc: vue.$t("animeTool.chooseOutputFolder"),
    }).then(([dir]) => {
      return Promise.all(
        selected.map(({ item, frame }) => {
          const filePath = path.join(
            dir,
            `${item.name}-${("0000" + item.index).substr(-4)}.png`
          );
          return sharpToFile({ image: frame }, filePath);
        })
      );
    });
  }
  saver
    .then(() => {
      showSuccess(vue.$t("animeTool.saveSuccess"));
    })
    .catch((err) => {
      showError(vue.$t("animeTool.saveError"), err);
    });
}
