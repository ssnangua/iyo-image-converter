/**
 * Posterize Filter. Adjusts the channels so that there are no more
 *  than n different values for that channel. This is also applied
 *  to the alpha channel.
 * @function
 * @name Posterize
 * @author ippo615
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Posterize]);
 * node.levels(0.8); // between 0 and 1
 */
module.exports = function (imageData, options) {
  // level must be between 1 and 255
  var levels = Math.round(options.levels * 254) + 1,
    data = imageData.data,
    len = data.length,
    scale = 255 / levels,
    i;

  for (i = 0; i < len; i += 1) {
    data[i] = Math.floor(data[i] / scale) * scale;
  }
};
