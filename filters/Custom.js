function getRGBA(cssColor) {
  const rgba = (cssColor || "rgba(0, 0, 0, 0)")
    .match(/[.?\d]+/g)
    .map((v, i) => (i < 3 ? +v : (255 * v) << 0));
  return rgba[3] === 0 ? [0, 0, 0, 0] : rgba;
}
function between(v1, v2, threshold) {
  return Math.abs(v1 - v2) <= threshold;
}

module.exports = {
  index: 20,
  en: {
    label: "Demo",
    RGB: {
      label: "RGB",
      red: "Red",
      green: "Green",
      blue: "Blue",
    },
    binarization: {
      label: "Binarization",
      threshold: "Threshold",
    },
    replaceColor: {
      label: "Replace Color",
      from: "From",
      to: "To",
      threshold: "Threshold",
    },
  },

  "zh-CN": {
    label: "Demo",
    RGB: {
      label: "RGB",
      red: "红",
      green: "绿",
      blue: "蓝",
    },
    binarization: {
      label: "二值化",
      threshold: "阈值",
    },
    replaceColor: {
      label: "颜色替换",
      from: "将",
      to: "替换为",
      threshold: "阈值",
    },
  },

  filters: {
    RGB: {
      options: [
        {
          key: "red",
          type: "number",
          default: 1,
          step: 0.01,
          min: 0,
          max: 1,
        },
        {
          key: "green",
          type: "number",
          default: 1,
          step: 0.01,
          min: 0,
          max: 1,
        },
        {
          key: "blue",
          type: "number",
          default: 1,
          step: 0.01,
          min: 0,
          max: 1,
        },
      ],
      handler({ data }, { red, green, blue }) {
        const n = data.length;
        for (let i = 0; i < n; i += 4) {
          data[i] *= red; // r
          data[i + 1] *= green; // g
          data[i + 2] *= blue; // b
          data[i + 3] = data[i + 3]; // alpha
        }
        return data;
      },
    },

    binarization: {
      options: [
        {
          key: "threshold",
          type: "number",
          default: 2,
          step: 0.01,
          min: 1,
          max: 10,
        },
      ],
      handler({ data }, { threshold }) {
        var index = 255 / threshold; // 阈值
        for (var i = 0, n = data.length; i < n; i += 4) {
          var sum = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (sum > index) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
          }
        }
        return data;
      },
    },

    replaceColor: {
      options: [
        {
          key: "from",
          type: "color",
          default: "",
          showAlpha: true,
        },
        {
          key: "to",
          type: "color",
          default: "",
          showAlpha: true,
        },
        {
          key: "threshold",
          type: "number",
          default: 0,
          step: 1,
          min: 0,
          max: 255,
        },
      ],
      handler({ data }, { from, to, threshold: t }) {
        if (from || to) {
          const [fr, fg, fb, fa] = getRGBA(from);
          const [tr, tg, tb, ta] = getRGBA(to);
          for (var i = 0, n = data.length; i < n; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            if (
              (fa === 0 && a === 0) ||
              (between(r, fr, t) && between(g, fg, t) && between(b, fb, t))
            ) {
              data[i] = tr;
              data[i + 1] = tg;
              data[i + 2] = tb;
              data[i + 3] = ta;
            }
          }
        }
        return data;
      },
    },
  },
};
