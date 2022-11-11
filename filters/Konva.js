/**
 * @reference https://github.com/konvajs/konva
 */
const Konva = require("./lib/Konva");

const group = {
  index: 30,

  en: {
    label: "Konva",
    Blur: {
      label: "Blur",
      blurRadius: "Blur Radius",
    },
    Brighten: {
      label: "Brighten",
      brightness: "Brightness",
    },
    Contrast: {
      label: "Contrast",
      contrast: "Contrast",
    },
    Emboss: {
      label: "Emboss",
      embossStrength: "Strength",
      embossWhiteLevel: "White Level",
      embossDirection: "Direction",
      embossBlend: "Blend",
      embossDirectionOptions: {
        topLeft: "↖ Top Left",
        top: "↑ Top",
        topRight: "↗ Top Right",
        left: "← Left",
        right: "→ Right",
        bottomLeft: "↙ Bottom Left",
        bottom: "↓ Bottom",
        bottomRight: "↘ Bottom Right",
      },
    },
    Enhance: {
      label: "Enhance",
      enhance: "Enhance",
    },
    Grayscale: {
      label: "Grayscale",
    },
    HSL: {
      label: "HSL",
      hue: "Hue",
      saturation: "Saturation",
      luminance: "Luminance",
    },
    HSV: {
      label: "HSV",
      hue: "Hue",
      saturation: "Saturation",
      value: "Value",
    },
    Invert: {
      label: "Invert",
    },
    Noise: {
      label: "Noise",
      noise: "Noise",
    },
    Pixelate: {
      label: "Pixelate",
      pixelSize: "PixelSize",
    },
    Posterize: {
      label: "Posterize",
      levels: "Levels",
    },
    RGB: {
      label: "RGB",
      red: "Red",
      green: "Green",
      blue: "Blue",
    },
    RGBA: {
      label: "RGBA",
      red: "Red",
      green: "Green",
      blue: "Blue",
      alpha: "Alpha",
    },
    Sepia: {
      label: "Sepia",
    },
    Solarize: {
      label: "Solarize",
    },
    Threshold: {
      label: "Threshold",
      threshold: "Threshold",
    },
  },

  "zh-CN": {
    label: "Konva",
    Blur: {
      label: "模糊",
      blurRadius: "模糊半径",
    },
    Brighten: {
      label: "亮度",
      brightness: "亮度",
    },
    Contrast: {
      label: "对比度",
      contrast: "对比度",
    },
    Emboss: {
      label: "浮雕",
      embossStrength: "强度",
      embossWhiteLevel: "白色等级",
      embossDirection: "方向",
      embossBlend: "混合",
      embossDirectionOptions: {
        topLeft: "↖ 左上",
        top: "↑ 上",
        topRight: "↗ 右上",
        left: "← 左",
        right: "→ 右",
        bottomLeft: "↙ 左下",
        bottom: "↓ 下",
        bottomRight: "↘ 右下",
      },
    },
    Enhance: {
      label: "增强",
      enhance: "增强",
    },
    Grayscale: {
      label: "去色",
    },
    HSL: {
      label: "色相 / 饱和度 / 亮度",
      hue: "色相",
      saturation: "饱和度",
      luminance: "亮度",
    },
    HSV: {
      label: "色相 / 饱和度 / 明度",
      hue: "色相",
      saturation: "饱和度",
      value: "明度",
    },
    Invert: {
      label: "反相",
    },
    Noise: {
      label: "杂色",
      noise: "杂色",
    },
    Pixelate: {
      label: "像素化",
      pixelSize: "大小",
    },
    Posterize: {
      label: "色调分离",
      levels: "色阶",
    },
    RGB: {
      label: "RGB",
      red: "红",
      green: "绿",
      blue: "蓝",
    },
    RGBA: {
      label: "RGBA",
      red: "红",
      green: "绿",
      blue: "蓝",
      alpha: "透明",
    },
    Sepia: {
      label: "老照片",
    },
    Solarize: {
      label: "过度曝光",
    },
    Threshold: {
      label: "阈值",
      threshold: "阈值",
    },
  },

  filters: {
    Blur: {
      options: [
        {
          key: "blurRadius",
          type: "number",
          default: 10,
          step: 1,
          min: 0,
          max: 100,
        },
      ],
    },

    Brighten: {
      options: [
        {
          key: "brightness",
          type: "number",
          default: 0.2,
          step: 0.01,
          min: -1,
          max: 1,
        },
      ],
    },

    Contrast: {
      options: [
        {
          key: "contrast",
          type: "number",
          default: 10,
          step: 1,
          min: -100,
          max: 100,
        },
      ],
    },

    Emboss: {
      options: [
        {
          key: "embossStrength",
          type: "number",
          default: 0.5,
          step: 0.01,
          min: 0,
          max: 1,
        },
        {
          key: "embossDirection",
          type: "select",
          default: "top",
          options: [
            {
              labelKey: "embossDirectionOptions.topLeft",
              value: "top-left",
            },
            {
              labelKey: "embossDirectionOptions.top",
              value: "top",
            },
            {
              labelKey: "embossDirectionOptions.topRight",
              value: "top-right",
            },
            {
              labelKey: "embossDirectionOptions.left",
              value: "left",
            },
            {
              labelKey: "embossDirectionOptions.right",
              value: "right",
            },
            {
              labelKey: "embossDirectionOptions.bottomLeft",
              value: "bottom-left",
            },
            {
              labelKey: "embossDirectionOptions.bottom",
              value: "bottom",
            },
            {
              labelKey: "embossDirectionOptions.bottomRight",
              value: "bottom-right",
            },
          ],
        },
        {
          key: "embossBlend",
          type: "boolean",
          default: true,
        },
        {
          key: "embossWhiteLevel",
          type: "number",
          default: 0.5,
          step: 0.01,
          min: 0,
          max: 1,
          lockWhen: (value) => value.embossBlend === true,
        },
      ],
    },

    Enhance: {
      options: [
        {
          key: "enhance",
          type: "number",
          default: 0.2,
          step: 0.01,
          min: -1,
          max: 1,
        },
      ],
    },

    Grayscale: {
      options: [],
    },

    HSL: {
      options: [
        {
          key: "hue",
          type: "number",
          default: 0,
          step: 1,
          min: 0,
          max: 359,
        },
        {
          key: "saturation",
          type: "number",
          default: 0,
          step: 0.01,
          min: -5,
          max: 5,
        },
        {
          key: "luminance",
          type: "number",
          default: 0,
          step: 0.01,
          min: -2,
          max: 2,
        },
      ],
    },

    HSV: {
      options: [
        {
          key: "hue",
          type: "number",
          default: 0,
          step: 1,
          min: 0,
          max: 359,
        },
        {
          key: "saturation",
          type: "number",
          default: 0,
          step: 0.01,
          min: -5,
          max: 5,
        },
        {
          key: "value",
          type: "number",
          default: 0,
          step: 0.01,
          min: -5,
          max: 5,
        },
      ],
    },

    Invert: {
      options: [],
    },

    Noise: {
      options: [
        {
          key: "noise",
          type: "number",
          default: 0.5,
          step: 0.1,
          min: 0,
          max: 4,
        },
      ],
    },

    Pixelate: {
      options: [
        {
          key: "pixelSize",
          type: "number",
          default: 20,
          step: 1,
          min: 1,
          max: 100,
        },
      ],
    },

    Posterize: {
      options: [
        {
          key: "levels",
          type: "number",
          default: 0.05,
          step: 0.01,
          min: 0,
          max: 0.5,
        },
      ],
    },

    RGB: {
      options: [
        {
          key: "red",
          type: "number",
          default: 255,
          step: 1,
          min: 0,
          max: 255,
        },
        {
          key: "green",
          type: "number",
          default: 0,
          step: 1,
          min: 0,
          max: 255,
        },
        {
          key: "blue",
          type: "number",
          default: 0,
          step: 1,
          min: 0,
          max: 255,
        },
      ],
    },

    RGBA: {
      options: [
        {
          key: "red",
          type: "number",
          default: 255,
          step: 1,
          min: 0,
          max: 255,
        },
        {
          key: "green",
          type: "number",
          default: 255,
          step: 1,
          min: 0,
          max: 255,
        },
        {
          key: "blue",
          type: "number",
          default: 255,
          step: 1,
          min: 0,
          max: 255,
        },
        {
          key: "alpha",
          type: "number",
          default: 0.1,
          step: 0.01,
          min: -1,
          max: 1,
        },
      ],
    },

    Sepia: {
      options: [],
    },

    Solarize: {
      options: [],
    },

    Threshold: {
      options: [
        {
          key: "threshold",
          type: "number",
          default: 0.5,
          step: 0.05,
          min: 0,
          max: 1,
        },
      ],
    },
  },
};

for (let name in Konva) {
  if (!group.en[name]) group.en[name] = { label: name };
  if (!group["zh-CN"][name]) group["zh-CN"][name] = { label: name };
  if (!group.filters[name]) group.filters[name] = {};
  group.filters[name].handler = (imageData, options) => {
    Konva[name](imageData, options);
    return imageData.data;
  };
}

module.exports = group;
