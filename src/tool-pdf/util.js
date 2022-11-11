import path from "path";
import fs from "fs-extra";
import sharp from "sharp";
import PDF from "sharp-pdf";
import { showLoading, showError } from "@/util/message";

export function extractImages(pdfPath, outputFolder, password, vue) {
  if (!fs.existsSync(pdfPath)) {
    showError(`${pdfPath} ${vue.$t("pdfTool.notValidSourceFile")}`);
    return false;
  }
  if (!fs.existsSync(outputFolder)) {
    showError(`${outputFolder} ${vue.$t("pdfTool.notValidOutputFolder")}`);
    return false;
  }

  const loading = showLoading({
    lock: true,
    text: vue.$t("pdfTool.loadingPdf"),
  });

  PDF.sharpsFromPdf(
    {
      url: pdfPath,
      password,
    },
    {
      delay: 0,
      handler(event, data) {
        if (event === "loading") {
          const progress = Math.round((data.loaded / data.total) * 100);
          loading.setText(`${vue.$t("pdfTool.loadingPdf")} ${progress}%`);
        } else if (event === "image" || event === "error") {
          const progress = Math.round((data.pageIndex / data.pages) * 100);
          loading.setText(`${vue.$t("pdfTool.parsingImages")} ${progress}%`);
        }
      },
    }
  )
    .then((images) => {
      loading.setText(vue.$t("pdfTool.extracting"));
      return Promise.all(
        images.map(({ image, name, channels }) => {
          const ext = channels > 3 ? ".png" : ".jpg";
          const fileOut = path.join(outputFolder, `${name}${ext}`);
          return image.toFile(fileOut).catch((err) => showError(err));
        })
      );
    })
    .then(() => loading.close())
    .catch((err) => {
      showError(err);
      loading.close();
    });
}

export function exportPdf(
  images,
  fileOut,
  pageSize,
  password,
  quality,
  margins,
  vue
) {
  const loading = showLoading({
    lock: true,
    text: vue.$t("pdfTool.exporting"),
  });

  PDF.sharpsToPdf(
    images.map(({ path }) =>
      sharp(path)
        .ensureAlpha()
        .flatten({ background: "#FFFFFF" })
        .jpeg({ quality })
    ),
    fileOut,
    {
      pdfOptions: {
        format: pageSize === "auto" ? "a4" : pageSize,
        encryption: password
          ? {
              userPassword: password,
            }
          : undefined,
      },
      imageOptions: {
        margin: margins,
        handler({ index, pages }) {
          const progress = Math.round(((index + 1) / pages) * 100);
          loading.setText(`${vue.$t("pdfTool.exporting")} ${progress}%`);
        },
      },
      autoSize: pageSize === "auto",
    }
  )
    .then(() => loading.close())
    .catch((err) => {
      showError(err);
      loading.close();
    });
}
