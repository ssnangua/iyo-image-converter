/**
 * RGB Filter
 * @function
 * @name RGB
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author ippo615
 * @example
 * node.cache();
 * node.filters([Konva.Filters.RGB]);
 * node.blue(120);
 * node.green(200);
 */
module.exports = function (imageData, options) {
  var data = imageData.data,
    nPixels = data.length,
    red = options.red,
    green = options.green,
    blue = options.blue,
    i,
    brightness;

  for (i = 0; i < nPixels; i += 4) {
    brightness =
      (0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2]) / 255;
    data[i] = brightness * red; // r
    data[i + 1] = brightness * green; // g
    data[i + 2] = brightness * blue; // b
    data[i + 3] = data[i + 3]; // alpha
  }
};
