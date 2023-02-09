import path from "path";
import url from "url";
import fs from "fs-extra";
import sharp from "sharp";
import PDF from "sharp-pdf";
import { showLoading, showError } from "@/util/message";

const win = nw.Window.get();

export async function extractImages(pdfs, outputFolder, password, vue, i = 0) {
  const pdfPath = pdfs[i];
  const pdfProgress = pdfs.length === 1 ? "" : `[ ${i + 1} / ${pdfs.length} ] `;
  win.setProgressBar(i / pdfs.length);

  // if (!fs.existsSync(pdfPath)) {
  //   showError(`${pdfPath} ${vue.$t("pdfTool.notValidSourceFile")}`);
  //   return false;
  // }

  const { dir: pdfDir, name: pdfName } = path.parse(pdfPath);

  if (!outputFolder) outputFolder = pdfDir;
  const outputDir = path.join(outputFolder, pdfName);
  const validDir = await fs
    .ensureDir(outputDir)
    .then(() => true)
    .catch(() => false);
  if (!validDir) {
    showError(`${outputFolder} ${vue.$t("pdfTool.notValidOutputFolder")}`);
    return false;
  }

  const loading = showLoading({
    lock: true,
    text: pdfProgress + vue.$t("pdfTool.loadingPdf"),
  });

  PDF.sharpsFromPdf(
    {
      url: url.pathToFileURL(pdfPath).toString(),
      password,
    },
    {
      delay: 0,
      handler(event, data) {
        if (event === "loading") {
          const progress = Math.round((data.loaded / data.total) * 100);
          loading.setText(
            pdfProgress + `${vue.$t("pdfTool.loadingPdf")} ${progress}%`
          );
        } else if (event === "image" || event === "error") {
          const progress = Math.round((data.pageIndex / data.pages) * 100);
          loading.setText(
            pdfProgress + `${vue.$t("pdfTool.parsingImages")} ${progress}%`
          );
        }
      },
    }
  )
    .then((images) => {
      loading.setText(pdfProgress + vue.$t("pdfTool.extracting"));
      return Promise.all(
        images.map(({ image, name, channels }) => {
          const ext = channels > 3 ? ".png" : ".jpg";
          const fileOut = path.join(outputDir, `${name}${ext}`);
          return image.toFile(fileOut).catch((err) => showError(err));
        })
      );
    })
    .then(() => loading.close())
    .catch((err) => {
      showError(err);
      loading.close();
    })
    .then(() => {
      if (i < pdfs.length - 1) {
        extractImages(pdfs, outputFolder, password, vue, i + 1);
      } else {
        win.setProgressBar(-1);
      }
    });
}

// jsPDF limits
const MAX_PAGE_SIZE = 14400;

export async function exportPdf(
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

  const maxHeight = MAX_PAGE_SIZE - margins * 2;

  const pages = [];
  for (const { path } of images) {
    const image = sharp(path)
      .ensureAlpha()
      .flatten({ background: "#FFFFFF" })
      .jpeg({ quality });
    const { width, height } = await image.metadata();
    if (height > maxHeight) {
      for (
        let i = 0, cutCount = Math.ceil(height / maxHeight);
        i < cutCount;
        i++
      ) {
        const page = image.clone().extract({
          left: 0,
          top: maxHeight * i,
          width,
          height: Math.min(height - maxHeight * i, maxHeight),
        });
        pages.push(page);
      }
    } else {
      pages.push(image);
    }
  }

  PDF.sharpsToPdf(
    // images.map(({ path }) =>
    //   sharp(path)
    //     .ensureAlpha()
    //     .flatten({ background: "#FFFFFF" })
    //     .jpeg({ quality })
    // ),
    pages,
    fileOut,
    // { type: "arraybuffer" },
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
    // .then((arraybuffer) => {
    //   const buffer = Buffer.from(arraybuffer);
    //   return fs.writeFile(fileOut, buffer);
    // })
    .then(() => loading.close())
    .catch((err) => {
      showError(err);
      loading.close();
    });
}
