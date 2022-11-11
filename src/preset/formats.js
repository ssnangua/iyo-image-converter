/**
 * Image formats options
 */
import setting from "./setting";

const kernel = {
  key: "kernel",
  type: "select",
  default: "lanczos3",
  options: [
    { label: "nearest", value: "nearest" },
    { label: "cubic", value: "cubic" },
    { label: "mitchell", value: "mitchell" },
    { label: "lanczos2", value: "lanczos2" },
    { label: "lanczos3", value: "lanczos3" },
  ],
};

export const formats = [
  { type: "raw", ext: "", color: "#333333" },
  {
    type: "tiny",
    ext: "",
    color: "#666666",
    editor: {
      options: [
        {
          key: "jpeg",
          toKey: "quality",
          type: "number",
          default: 50,
          step: 1,
          min: 1,
          max: 100,
        },
        {
          key: "png",
          toKey: "quality",
          type: "number",
          default: 50,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          key: "webp",
          toKey: "quality",
          type: "number",
          default: 50,
          step: 1,
          min: 1,
          max: 100,
        },
        {
          key: "gif",
          toKey: "colors",
          type: "number",
          default: 128,
          step: 1,
          min: 2,
          max: 256,
        },
        {
          key: "apng",
          toKey: "cnum",
          type: "number",
          default: 128,
          step: 1,
          min: 1,
          max: 256,
        },
        // {
        //   key: "ico",
        //   toKey: "quality",
        //   type: "number",
        //   default: 50,
        //   step: 1,
        //   min: 0,
        //   max: 100,
        // },
        // {
        //   key: "bmp",
        //   toKey: "quality",
        //   type: "number",
        //   default: 50,
        //   step: 1,
        //   min: 1,
        //   max: 100,
        // },
        {
          key: "tiff",
          toKey: "quality",
          type: "number",
          default: 80,
          step: 1,
          min: 1,
          max: 100,
        },
        {
          key: "avif",
          toKey: "quality",
          type: "number",
          default: 50,
          step: 1,
          min: 1,
          max: 100,
        },
        {
          key: "heif",
          toKey: "quality",
          type: "number",
          default: 50,
          step: 1,
          min: 1,
          max: 100,
        },
      ],
      setValue(value) {
        return this.options.reduce((formatted, option) => {
          formatted[option.key] = value[option.key][option.toKey];
          return formatted;
        }, {});
      },
      getValue(value) {
        const { tiny } = setting;
        return this.options.reduce((formatted, option) => {
          formatted[option.key] = {
            ...tiny[option.key],
            [option.toKey]: value[option.key],
          };
          return formatted;
        }, {});
      },
    },
  },
  {
    type: "jpeg",
    ext: ".jpg",
    color: "#139b81",
    editor: {
      options: [
        {
          key: "quality",
          type: "number",
          default: 80,
          step: 1,
          min: 1,
          max: 100,
        },
        {
          key: "progressive",
          type: "boolean",
          default: false,
        },
        {
          key: "chromaSubsampling",
          type: "select",
          default: "4:2:0",
          options: [
            {
              labelKey: "jpeg.chromaSubsamplingOptions.yes",
              value: "4:2:0",
            },
            {
              labelKey: "jpeg.chromaSubsamplingOptions.no",
              value: "4:4:4",
            },
          ],
        },
        {
          key: "optimiseCoding",
          type: "boolean",
          default: true,
        },
        {
          key: "mozjpeg",
          type: "boolean",
          default: false,
        },
        {
          key: "trellisQuantisation",
          type: "boolean",
          default: false,
          lockWhen: (value) => value.mozjpeg === true,
          lockValue: true,
        },
        {
          key: "overshootDeringing",
          type: "boolean",
          default: false,
          lockWhen: (value) => value.mozjpeg === true,
          lockValue: true,
        },
        {
          key: "optimiseScans",
          type: "boolean",
          default: false,
          lockWhen: (value) => value.mozjpeg === true,
          lockValue: true,
        },
        {
          key: "quantisationTable",
          type: "number",
          default: 0,
          step: 1,
          min: 0,
          max: 8,
          lockWhen: (value) => value.mozjpeg === true,
          lockValue: 3,
        },
      ],
    },
  },
  {
    type: "png",
    ext: ".png",
    color: "#3aa3f2",
    editor: {
      options: [
        {
          key: "progressive",
          type: "boolean",
          default: false,
        },
        {
          key: "compressionLevel",
          type: "number",
          default: 6,
          step: 1,
          min: 0,
          max: 9,
        },
        {
          key: "adaptiveFiltering",
          type: "boolean",
          default: false,
        },
        {
          key: "palette",
          type: "boolean",
          default: false,
        },
        {
          key: "quality",
          type: "number",
          default: 100,
          step: 1,
          min: 0,
          max: 100,
          lockWhen: (value) => value.palette === false,
        },
        {
          key: "effort",
          type: "number",
          default: 7,
          step: 1,
          min: 1,
          max: 10,
          lockWhen: (value) => value.palette === false,
        },
        {
          key: "colors",
          type: "number",
          default: 256,
          step: 1,
          min: 2,
          max: 256,
          lockWhen: (value) => value.palette === false,
        },
        {
          key: "dither",
          type: "number",
          default: 1.0,
          step: 0.01,
          min: 0,
          max: 1,
          lockWhen: (value) => value.palette === false,
        },
      ],
    },
  },
  {
    type: "webp",
    ext: ".webp",
    color: "#49af59",
    editor: {
      options: [
        {
          key: "quality",
          type: "number",
          default: 80,
          step: 1,
          min: 1,
          max: 100,
        },
        {
          key: "alphaQuality",
          type: "number",
          default: 100,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          key: "lossless",
          type: "boolean",
          default: false,
        },
        {
          key: "nearLossless",
          type: "boolean",
          default: false,
        },
        {
          key: "smartSubsample",
          type: "boolean",
          default: false,
        },
        {
          key: "effort",
          type: "number",
          default: 4,
          step: 1,
          min: 0,
          max: 6,
        },
        {
          key: "loop",
          type: "number",
          input: true,
          default: 0,
          step: 1,
          min: 0,
          max: 65535,
        },
      ],
    },
  },
  {
    type: "gif",
    ext: ".gif",
    color: "#ec7421",
    editor: {
      options: [
        {
          key: "colors",
          type: "number",
          default: 256,
          step: 1,
          min: 2,
          max: 256,
        },
        {
          key: "effort",
          type: "number",
          default: 7,
          step: 1,
          min: 1,
          max: 10,
        },
        {
          key: "dither",
          type: "number",
          default: 1.0,
          step: 0.01,
          min: 0,
          max: 1,
        },
        {
          key: "loop",
          type: "number",
          input: true,
          default: 0,
          step: 1,
          min: 0,
          max: 65535,
        },
      ],
    },
  },
  {
    type: "apng",
    ext: ".png",
    color: "#3aa3f2",
    editor: {
      options: [
        // {
        //   key: "readApng",
        //   type: "divider",
        // },
        {
          key: "transparent",
          type: "boolean",
          default: false,
        },
        // {
        //   key: "maxColors",
        //   type: "number",
        //   default: 256,
        //   step: 1,
        //   min: 1,
        //   max: 256,
        // },
        // {
        //   key: "repeat",
        //   type: "number",
        //   input: true,
        //   default: 0,
        //   step: 1,
        //   min: 0,
        //   max: 65535,
        // },
        // {
        //   key: "format",
        //   type: "radio",
        //   default: "rgb565",
        //   options: [
        //     {
        //       label: "rgb565",
        //       value: "rgb565",
        //       descKey: "colorFormat.rgb565",
        //     },
        //     {
        //       label: "rgb444",
        //       value: "rgb444",
        //       descKey: "colorFormat.rgb444",
        //     },
        //     {
        //       label: "rgba4444",
        //       value: "rgba4444",
        //       descKey: "colorFormat.rgb4444",
        //     },
        //   ],
        // },
        // {
        //   key: "generate",
        //   type: "divider",
        // },
        {
          key: "lossless",
          type: "boolean",
          default: true,
        },
        {
          key: "cnum",
          type: "number",
          default: 256,
          step: 1,
          min: 1,
          max: 256,
          lockWhen: (value) => value.lossless === true,
        },
      ],
    },
  },
  {
    type: "ico",
    ext: ".ico",
    color: "#00488f",
    editor: {
      options: [
        kernel,
        {
          key: "extract",
          type: "divider",
        },
        {
          key: "extractFrames",
          type: "radio",
          default: "allFrames",
          options: [
            { labelKey: "ico.largestFrame", value: "largestFrame" },
            { labelKey: "ico.allFrames", value: "allFrames" },
            { labelKey: "ico.extractSizes", value: "extractSizes" },
          ],
        },
        {
          key: "newFolder",
          type: "boolean",
          default: true,
          lockWhen: (value) => value.extractFrames === "largestFrame",
        },
        {
          key: "extractSizes",
          type: "checkbox",
          default: [16, 24, 32, 48, 64, 72, 96, 128, 256],
          lockWhen: (value) => value.extractFrames !== "extractSizes",
          options: [
            { label: "16 × 16", value: 16 },
            { label: "24 × 24", value: 24 },
            { label: "32 × 32", value: 32 },
            { label: "48 × 48", value: 48 },
            { label: "64 × 64", value: 64 },
            { label: "72 × 72", value: 72 },
            { label: "96 × 96", value: 96 },
            { label: "128 × 128", value: 128 },
            { label: "256 × 256", value: 256 },
          ],
        },
        {
          key: "generate",
          type: "divider",
        },
        {
          key: "includeSizes",
          type: "checkbox",
          default: [16, 24, 32, 48, 64, 72, 96, 128, 256],
          options: [
            { label: "16 × 16", value: 16 },
            { label: "24 × 24", value: 24 },
            { label: "32 × 32", value: 32 },
            { label: "48 × 48", value: 48 },
            { label: "64 × 64", value: 64 },
            { label: "72 × 72", value: 72 },
            { label: "96 × 96", value: 96 },
            { label: "128 × 128", value: 128 },
            { label: "256 × 256", value: 256 },
          ],
        },
      ],
    },
  },
  { type: "bmp", ext: ".bmp", color: "#619aa6" },
  {
    type: "tiff",
    ext: ".tif",
    color: "#657f6c",
    editor: {
      options: [
        {
          key: "quality",
          type: "number",
          default: 80,
          step: 1,
          min: 1,
          max: 100,
        },
        {
          key: "compression",
          type: "select",
          default: "jpeg",
          options: [
            {
              label: "lzw",
              value: "lzw",
            },
            {
              label: "deflate",
              value: "deflate",
            },
            {
              label: "jpeg",
              value: "jpeg",
            },
            {
              label: "ccittfax4",
              value: "ccittfax4",
            },
          ],
        },
        {
          key: "predictor",
          type: "select",
          default: "horizontal",
          options: [
            {
              labelKey: "tiff.predictorOptions.none",
              value: "none",
            },
            {
              labelKey: "tiff.predictorOptions.horizontal",
              value: "horizontal",
            },
            {
              labelKey: "tiff.predictorOptions.float",
              value: "float",
            },
          ],
        },
        {
          key: "pyramid",
          type: "boolean",
          default: false,
        },
        {
          key: "tile",
          type: "boolean",
          default: false,
        },
        {
          key: "tileWidth",
          type: "number",
          input: true,
          default: 256,
          step: 1,
          min: 1,
        },
        {
          key: "tileHeight",
          type: "number",
          input: true,
          default: 256,
          step: 1,
          min: 1,
        },
        {
          key: "xres",
          type: "number",
          input: true,
          default: 1.0,
          step: 0.01,
          min: 0.01,
        },
        {
          key: "yres",
          type: "number",
          input: true,
          default: 1.0,
          step: 0.01,
          min: 0.01,
        },
        {
          key: "resolutionUnit",
          type: "select",
          default: "inch",
          options: [
            {
              labelKey: "tiff.resolutionUnitOptions.inch",
              value: "inch",
            },
            {
              labelKey: "tiff.resolutionUnitOptions.cm",
              value: "cm",
            },
          ],
        },
        {
          key: "bitdepth",
          type: "select",
          default: 8,
          options: [
            {
              label: "1",
              value: 1,
            },
            {
              label: "2",
              value: 2,
            },
            {
              label: "4",
              value: 4,
            },
            {
              label: "8",
              value: 8,
            },
          ],
        },
      ],
    },
  },
  {
    type: "avif",
    ext: ".avif",
    color: "#546a7a",
    editor: {
      options: [
        {
          key: "quality",
          type: "number",
          default: 50,
          step: 1,
          min: 1,
          max: 100,
        },
        {
          key: "lossless",
          type: "boolean",
          default: false,
        },
        {
          key: "effort",
          type: "number",
          default: 4,
          step: 1,
          min: 0,
          max: 9,
        },
        {
          key: "chromaSubsampling",
          type: "select",
          default: "4:4:4",
          options: [
            {
              labelKey: "jpeg.chromaSubsamplingOptions.yes",
              value: "4:2:0",
            },
            {
              labelKey: "jpeg.chromaSubsamplingOptions.no",
              value: "4:4:4",
            },
          ],
        },
      ],
    },
  },
  {
    type: "heif",
    ext: ".heif",
    color: "#045dd2",
    editor: {
      options: [
        {
          key: "quality",
          type: "number",
          default: 50,
          step: 1,
          min: 1,
          max: 100,
        },
        {
          key: "compression",
          type: "select",
          default: "av1",
          options: [
            {
              label: "av1",
              value: "av1",
            },
            {
              label: "hevc",
              value: "hevc",
            },
          ],
        },
        {
          key: "lossless",
          type: "boolean",
          default: false,
        },
        {
          key: "effort",
          type: "number",
          default: 4,
          step: 1,
          min: 0,
          max: 9,
        },
        {
          key: "chromaSubsampling",
          type: "select",
          default: "4:4:4",
          options: [
            {
              labelKey: "jpeg.chromaSubsamplingOptions.yes",
              value: "4:2:0",
            },
            {
              labelKey: "jpeg.chromaSubsamplingOptions.no",
              value: "4:4:4",
            },
          ],
        },
      ],
    },
  },
];

export const formatsMap = formats.reduce((map, format) => {
  map[format.type] = format;
  return map;
}, {});
