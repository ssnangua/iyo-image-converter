/**
 * @reference https://github.com/silvia-odwyer/pixels.js
 */
const PixelsJS = require("./lib/Pixels");

const group = {
  index: 1000,
  en: { label: "Pixels.JS" },
  "zh-CN": { label: "Pixels.JS" },
  filters: {},
};

const en = {};
const zh_CN = {};
function formatName(name) {
  return name.replace(/_/g, " ");
}

PixelsJS.getFilterList().forEach((name) => {
  group.en[name] = { label: en[name] || formatName(name) };
  group["zh-CN"][name] = { label: zh_CN[name] || formatName(name) };
  group.filters[name] = {
    handler(imageData) {
      PixelsJS.filterImgData(imageData, name);
      return imageData.data;
    },
  };
});

module.exports = group;
