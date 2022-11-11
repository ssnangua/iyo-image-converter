/**
 * RGBA Filter
 * @function
 * @name RGBA
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author codefo
 * @example
 * node.cache();
 * node.filters([Konva.Filters.RGBA]);
 * node.blue(120);
 * node.green(200);
 * node.alpha(0.3);
 */
module.exports = function (imageData, options) {
  var data = imageData.data,
    nPixels = data.length,
    red = options.red,
    green = options.green,
    blue = options.blue,
    alpha = options.alpha,
    i,
    ia;

  for (i = 0; i < nPixels; i += 4) {
    ia = 1 - alpha;

    data[i] = red * alpha + data[i] * ia; // r
    data[i + 1] = green * alpha + data[i + 1] * ia; // g
    data[i + 2] = blue * alpha + data[i + 2] * ia; // b
  }
};
