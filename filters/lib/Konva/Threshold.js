/**
 * Threshold Filter. Pushes any value above the mid point to
 *  the max and any value below the mid point to the min.
 *  This affects the alpha channel.
 * @function
 * @name Threshold
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author ippo615
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Threshold]);
 * node.threshold(0.1);
 */
module.exports = function (imageData, options) {
  var level = options.threshold * 255,
    data = imageData.data,
    len = data.length,
    i;

  for (i = 0; i < len; i += 1) {
    data[i] = data[i] < level ? 0 : 255;
  }
};
