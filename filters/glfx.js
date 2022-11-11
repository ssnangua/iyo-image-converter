const fx = require("./lib/glfx");
const canvas = fx.canvas();
const texture = {};

const offscreenCanvas = document.createElement("canvas");
const ctx = offscreenCanvas.getContext("2d");

const pv = (p, v) => (p / 100) * v;
const r2a = (r) => (r / 360) * Math.PI;

const group = {
  index: 10,
  en: {
    label: "glfx.js",
    hueSaturation: {
      label: "Hue / Saturation",
      hue: "Hue",
      saturation: "Saturation",
      brightness: "Brightness",
      contrast: "Contrast",
    },
    brightnessContrast: {
      label: "Brightness / Contrast",
      brightness: "Brightness",
      contrast: "Contrast",
    },
    denoise: {
      label: "Denoise",
      exponent: "Exponent",
    },
    noise: {
      label: "Noise",
      amount: "Amount",
    },
    sepia: {
      label: "Sepia",
      amount: "Amount",
    },
    unsharpMask: {
      label: "Unsharp Mask",
      radius: "Radius",
      strength: "Strength",
    },
    vibrance: {
      label: "Vibrance",
      amount: "Amount",
    },
    vignette: {
      label: "Vignette",
      size: "Size",
      amount: "Amount",
    },
    lensBlur: {
      label: "Lens Blur",
      radius: "Radius",
      brightness: "Brightness",
      angle: "Angle",
    },
    tiltShift: {
      label: "Tilt Shift",
      startX: "Start X",
      startY: "Start Y",
      endX: "End X",
      endY: "End Y",
      blurRadius: "Blur Radius",
      gradientRadius: "Gradient Radius",
    },
    triangleBlur: {
      label: "Triangle Blur",
      radius: "Radius",
    },
    zoomBlur: {
      label: "Zoom Blur",
      centerX: "Center X",
      centerY: "Center Y",
      strength: "Strength",
    },
    halftone: {
      label: "Color Halftone",
      isColor: "Color",
      centerX: "Center X",
      centerY: "Center Y",
      angle: "Angle",
      size: "Size",
    },
    dotScreen: {
      label: "Dot Screen",
      centerX: "Center X",
      centerY: "Center Y",
      angle: "Angle",
      size: "Size",
    },
    edgeWork: {
      label: "Edge Work",
      radius: "Radius",
    },
    hexagonalPixelate: {
      label: "Hexagonal Pixelate",
      centerX: "Center X",
      centerY: "Center Y",
      scale: "Scale",
    },
    ink: {
      label: "Ink",
      strength: "Strength",
    },
    bulgePinch: {
      label: "Bulge / Pinch",
      centerX: "Center X",
      centerY: "Center Y",
      radius: "Radius",
      strength: "Strength",
    },
    swirl: {
      label: "Swirl",
      centerX: "Center X",
      centerY: "Center Y",
      radius: "Radius",
      angle: "Angle",
    },
  },

  "zh-CN": {
    label: "glfx.js",
    hueSaturation: {
      label: "色相 / 饱和度",
      hue: "色相",
      saturation: "饱和度",
    },
    brightnessContrast: {
      label: "亮度 / 对比度",
      brightness: "亮度",
      contrast: "对比度",
    },
    denoise: {
      label: "降噪",
      exponent: "指数",
    },
    noise: {
      label: "噪点",
      amount: "数量",
    },
    sepia: {
      label: "老照片",
      amount: "程度",
    },
    unsharpMask: {
      label: "锐化",
      radius: "半径",
      strength: "强度",
    },
    vibrance: {
      label: "自然饱和度",
      amount: "程度",
    },
    vignette: {
      label: "晕影",
      size: "大小",
      amount: "程度",
    },
    lensBlur: {
      label: "失焦",
      radius: "半径",
      brightness: "亮度",
      angle: "角度",
    },
    tiltShift: {
      label: "移轴",
      startX: "起始点 X",
      startY: "起始点 Y",
      endX: "终止点 X",
      endY: "终止点 Y",
      blurRadius: "模糊程度",
      gradientRadius: "清晰范围",
    },
    triangleBlur: {
      label: "模糊",
      radius: "半径",
    },
    zoomBlur: {
      label: "运动模糊",
      centerX: "中心 X",
      centerY: "中心 Y",
      strength: "强度",
    },
    halftone: {
      label: "半色调",
      isColor: "彩色",
      centerX: "中心 X",
      centerY: "中心 Y",
      angle: "角度",
      size: "大小",
    },
    edgeWork: {
      label: "边缘",
      radius: "半径",
    },
    hexagonalPixelate: {
      label: "六边形像素化",
      centerX: "中心 X",
      centerY: "中心 Y",
      scale: "大小",
    },
    ink: {
      label: "墨水轮廓",
      strength: "强度",
    },
    bulgePinch: {
      label: "膨胀 / 褶皱",
      centerX: "中心 X",
      centerY: "中心 Y",
      radius: "半径",
      strength: "强度",
    },
    swirl: {
      label: "旋涡",
      centerX: "中心 X",
      centerY: "中心 Y",
      radius: "半径",
      angle: "角度",
    },
  },

  filters: {
    hueSaturation: {
      options: [
        {
          key: "hue",
          type: "number",
          default: 0,
          step: 0.01,
          min: -1,
          max: 1,
        },
        {
          key: "saturation",
          type: "number",
          default: 0,
          step: 0.01,
          min: -1,
          max: 1,
        },
      ],
      apply({ hue, saturation }) {
        canvas.hueSaturation(hue, saturation);
      },
    },

    brightnessContrast: {
      options: [
        {
          key: "brightness",
          type: "number",
          default: 0,
          step: 0.01,
          min: -1,
          max: 1,
        },
        {
          key: "contrast",
          type: "number",
          default: 0,
          step: 0.01,
          min: -1,
          max: 1,
        },
      ],
      apply({ brightness, contrast }) {
        canvas.brightnessContrast(brightness, contrast);
      },
    },

    denoise: {
      options: [
        {
          key: "exponent",
          type: "number",
          default: 128,
          step: 1,
          min: 0,
          max: 255,
        },
      ],
      apply({ exponent }) {
        canvas.denoise(exponent);
      },
    },

    noise: {
      options: [
        {
          key: "amount",
          type: "number",
          default: 0.1,
          step: 0.01,
          min: 0,
          max: 1,
        },
      ],
      apply({ amount }) {
        canvas.noise(amount);
      },
    },

    sepia: {
      options: [
        {
          key: "amount",
          type: "number",
          default: 0.5,
          step: 0.01,
          min: 0,
          max: 1,
        },
      ],
      apply({ amount }) {
        canvas.sepia(amount);
      },
    },

    unsharpMask: {
      options: [
        {
          key: "radius",
          type: "number",
          default: 20,
          step: 1,
          min: 0,
          max: 200,
        },
        {
          key: "strength",
          type: "number",
          default: 0.5,
          step: 0.01,
          min: 0,
          max: 5,
        },
      ],
      apply({ radius, strength }) {
        canvas.unsharpMask(radius, strength);
      },
    },

    vibrance: {
      options: [
        {
          key: "amount",
          type: "number",
          default: 0.5,
          step: 0.01,
          min: -1,
          max: 1,
        },
      ],
      apply({ amount }) {
        canvas.vibrance(amount);
      },
    },

    vignette: {
      options: [
        {
          key: "size",
          type: "number",
          default: 0.2,
          step: 0.01,
          min: 0,
          max: 1,
        },
        {
          key: "amount",
          type: "number",
          default: 0.8,
          step: 0.01,
          min: 0,
          max: 1,
        },
      ],
      apply({ size, amount }) {
        canvas.vignette(size, amount);
      },
    },

    lensBlur: {
      options: [
        {
          key: "radius",
          type: "number",
          default: 10,
          step: 1,
          min: 0,
          max: 50,
        },
        {
          key: "brightness",
          type: "number",
          default: 0,
          step: 0.01,
          min: -1,
          max: 1,
        },
        {
          key: "angle",
          type: "number",
          default: 0,
          step: 1,
          min: -360,
          max: 360,
        },
      ],
      apply({ radius, brightness, angle }) {
        canvas.lensBlur(radius, brightness, r2a(angle));
      },
    },

    tiltShift: {
      options: [
        {
          key: "startX",
          type: "number",
          default: 0,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "startY",
          type: "number",
          default: 50,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "endX",
          type: "number",
          default: 100,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "endY",
          type: "number",
          default: 50,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "blurRadius",
          type: "number",
          default: 50,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          key: "gradientRadius",
          type: "number",
          default: 100,
          step: 1,
          min: 0,
          max: 100,
        },
      ],
      apply(
        { startX, startY, endX, endY, blurRadius, gradientRadius },
        { width, height }
      ) {
        canvas.tiltShift(
          pv(startX, width),
          pv(startY, height),
          pv(endX, width),
          pv(endY, height),
          blurRadius,
          pv(gradientRadius, Math.max(width, height))
        );
      },
    },

    triangleBlur: {
      options: [
        {
          key: "radius",
          type: "number",
          default: 10,
          step: 1,
          min: 0,
          max: 200,
        },
      ],
      apply({ radius }) {
        canvas.triangleBlur(radius);
      },
    },

    hexagonalPixelate: {
      options: [
        {
          key: "centerX",
          type: "number",
          default: 50,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "centerY",
          type: "number",
          default: 50,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "scale",
          type: "number",
          default: 20,
          step: 1,
          min: 1,
          max: 100,
        },
      ],
      apply({ centerX, centerY, scale }, { width, height }) {
        canvas.hexagonalPixelate(
          pv(centerX, width),
          pv(centerY, height),
          scale
        );
      },
    },

    bulgePinch: {
      options: [
        {
          key: "centerX",
          type: "number",
          default: 50,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "centerY",
          type: "number",
          default: 50,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "radius",
          type: "number",
          default: 20,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "strength",
          type: "number",
          default: 0.5,
          step: 0.01,
          min: -1,
          max: 1,
        },
      ],
      apply({ centerX, centerY, radius, strength }, { width, height }) {
        canvas.bulgePinch(
          pv(centerX, width),
          pv(centerY, height),
          pv(radius, Math.max(width, height)),
          strength
        );
      },
    },

    zoomBlur: {
      options: [
        {
          key: "centerX",
          type: "number",
          default: 50,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "centerY",
          type: "number",
          default: 50,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "strength",
          type: "number",
          default: 0.1,
          step: 0.01,
          min: 0,
          max: 1,
        },
      ],
      apply({ centerX, centerY, strength }, { width, height }) {
        canvas.zoomBlur(pv(centerX, width), pv(centerY, height), strength);
      },
    },

    swirl: {
      options: [
        {
          key: "centerX",
          type: "number",
          default: 50,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "centerY",
          type: "number",
          default: 50,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "radius",
          type: "number",
          default: 10,
          step: 1,
          min: 0,
          max: 50,
        },
        {
          key: "angle",
          type: "number",
          default: 10,
          step: 0.1,
          min: -25,
          max: 25,
        },
      ],
      apply({ centerX, centerY, radius, angle }, { width, height }) {
        canvas.swirl(
          pv(centerX, width),
          pv(centerY, height),
          pv(radius, Math.max(width, height)),
          angle
        );
      },
    },

    halftone: {
      options: [
        {
          key: "isColor",
          type: "boolean",
          default: true,
        },
        {
          key: "centerX",
          type: "number",
          default: 50,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "centerY",
          type: "number",
          default: 50,
          step: 0.1,
          min: 0,
          max: 100,
        },
        {
          key: "angle",
          type: "number",
          default: 0,
          step: 1,
          min: 0,
          max: 360,
        },
        {
          key: "size",
          type: "number",
          default: 10,
          step: 1,
          min: 1,
          max: 100,
        },
      ],
      apply({ isColor, centerX, centerY, angle, size }, { width, height }) {
        canvas[isColor ? "colorHalftone" : "dotScreen"](
          pv(centerX, width),
          pv(centerY, height),
          r2a(angle),
          size
        );
      },
    },

    edgeWork: {
      options: [
        {
          key: "radius",
          type: "number",
          default: 10,
          step: 1,
          min: 0,
          max: 200,
        },
      ],
      apply({ radius }) {
        canvas.edgeWork(radius);
      },
    },

    ink: {
      options: [
        {
          key: "strength",
          type: "number",
          default: 0.5,
          step: 0.01,
          min: 0,
          max: 1,
        },
      ],
      apply({ strength }) {
        canvas.ink(strength);
      },
    },
  },
};

Object.keys(group.filters).forEach((name) => {
  group.filters[name].handler = function ({ width, height, data }, options) {
    const imageData = new ImageData(data, width, height);
    if (texture[name]) texture[name].loadContentsOf(imageData);
    else texture[name] = canvas.texture(imageData);
    canvas.draw(texture[name]);
    this.apply(options, { width, height, data });
    canvas.update();

    // GL_INVALID_OPERATION: Invalid format and type combination.
    // return Uint8ClampedArray.from(canvas.getPixelArray());

    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    ctx.drawImage(canvas, 0, 0);
    return ctx.getImageData(0, 0, width, height).data;
  };
});

module.exports = group;
