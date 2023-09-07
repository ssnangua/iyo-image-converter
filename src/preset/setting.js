import path from "path";
import fs from "fs-extra";
import { deepExtend } from "@/util/util";

export const defaultSetting = {
  locale: navigator.language || process.env.VUE_APP_I18N_LOCALE || "en",
  general: {
    outputFolder: "",
    appendFilename: "",
    overwriteOutputFile: false,
    afterProcessing: "none",
    skipSameFormat: false,
    concurrently: 1,
    timeout: 60,
    outputAnimated: true,
    extractFrames: "allFrames",
    newFolder: true,
    readFolders: true,
    keepDirectoryStructure: true,
    completeNotify: true,
    showTaskIndex: false,
    showTaskPreview: true,
  },
  modifier: {
    enableCrop: false,
    cropType: "trim",
    trimColor: "",
    trimThreshold: 10,
    cropTop: 0,
    cropRight: 0,
    cropBottom: 0,
    cropLeft: 0,
    cropWidth: 0,
    cropHeight: 0,
    enableResize: false,
    resizeType: "pixels",
    width: 0,
    height: 0,
    fit: "inside",
    kernel: "lanczos3",
    enableRotate: false,
    angle: 0,
    background: "",
    flop: false,
    flip: false,
    forceDensity: false,
    density: 72,
  },
  watermark: {
    enable: false,
    type: "text",
    text: {
      text: "",
      fontFamily: "Arial",
      italic: false,
      bold: false,
      fontSize: 12,
      fontColor: "#FF0000",
      strokeWidth: 0,
      strokeColor: "#000000",
    },
    image: "",
    opacity: 1,
    angle: 0,
    position: "top-left",
    marginX: 0,
    marginY: 0,
  },
  raw: {},
  tiny: {
    jpeg: {
      quality: 50,
    },
    png: {
      palette: true,
      quality: 50,
    },
    webp: {
      quality: 50,
    },
    gif: {
      colors: 128,
    },
    apng: {
      lossless: false,
      cnum: 128,
    },
    // ico: {
    //   quality: 50,
    // },
    // bmp: {
    //   quality: 50,
    // },
    tiff: {
      quality: 50,
    },
    avif: {
      quality: 50,
    },
    heif: {
      quality: 50,
    },
  },
  jpeg: {
    quality: 80,
    progressive: false,
    chromaSubsampling: "4:2:0",
    optimiseCoding: true,
    mozjpeg: false,
    trellisQuantisation: false,
    overshootDeringing: false,
    optimiseScans: false,
    quantisationTable: 0,
  },
  png: {
    progressive: false,
    compressionLevel: 6,
    adaptiveFiltering: false,
    palette: false,
    quality: 100,
    effort: 7,
    colors: 256,
    dither: 1.0,
  },
  webp: {
    outputAnimated: true,
    extractFrames: "allFrames",
    newFolder: true,
    quality: 80,
    alphaQuality: 100,
    lossless: false,
    nearLossless: false,
    smartSubsample: false,
    effort: 4,
    loop: 0,
  },
  gif: {
    outputAnimated: true,
    extractFrames: "allFrames",
    newFolder: true,
    colors: 256,
    effort: 7,
    dither: 1.0,
    loop: 0,
  },
  apng: {
    transparent: false,
    maxColors: 256,
    repeat: 0,
    // format: "rgba4444",
    lossless: false,
    cnum: 256,
  },
  ico: {
    extractFrames: "largestFrame",
    newFolder: true,
    extractSizes: [16, 24, 32, 48, 64, 72, 96, 128, 256],
    includeSizes: [16, 24, 32, 48, 64, 72, 96, 128, 256],
    kernel: "lanczos3",
  },
  bmp: {},
  tiff: {
    quality: 80,
    compression: "jpeg",
    predictor: "horizontal",
    pyramid: false,
    tile: false,
    tileWidth: 256,
    tileHeight: 256,
    xres: 1.0,
    yres: 1.0,
    resolutionUnit: "inch",
    bitdepth: 8,
  },
  avif: { quality: 50, lossless: false, effort: 4, chromaSubsampling: "4:4:4" },
  heif: {
    quality: 50,
    compression: "av1",
    lossless: false,
    effort: 4,
    chromaSubsampling: "4:4:4",
  },
};

const settingFile = path.join(nw.App.dataPath, "setting.json");
let userSetting = {};
try {
  if (fs.existsSync(settingFile)) {
    userSetting = fs.readJSONSync(settingFile);
  }
} catch (e) {
  console.warn(e);
}
const setting = deepExtend({}, defaultSetting, userSetting);
// console.log(setting);

export default setting;

export function writeSetting(newSetting) {
  Object.assign(setting, newSetting);
  fs.writeJSON(settingFile, setting).catch((err) => console.warn(err));
}
