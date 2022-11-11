/**
 * Pixelate Filter. Averages groups of pixels and redraws
 *  them as larger pixels
 * @function
 * @name Pixelate
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author ippo615
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Pixelate]);
 * node.pixelSize(10);
 */
module.exports = function (imageData, options) {
  var pixelSize = Math.ceil(options.pixelSize),
    width = imageData.width,
    height = imageData.height,
    x,
    y,
    i,
    //pixelsPerBin = pixelSize * pixelSize,
    red,
    green,
    blue,
    alpha,
    nBinsX = Math.ceil(width / pixelSize),
    nBinsY = Math.ceil(height / pixelSize),
    xBinStart,
    xBinEnd,
    yBinStart,
    yBinEnd,
    xBin,
    yBin,
    pixelsInBin,
    data = imageData.data;

  if (pixelSize <= 0) {
    console.error('pixelSize value can not be <= 0');
    return;
  }

  for (xBin = 0; xBin < nBinsX; xBin += 1) {
    for (yBin = 0; yBin < nBinsY; yBin += 1) {
      // Initialize the color accumlators to 0
      red = 0;
      green = 0;
      blue = 0;
      alpha = 0;

      // Determine which pixels are included in this bin
      xBinStart = xBin * pixelSize;
      xBinEnd = xBinStart + pixelSize;
      yBinStart = yBin * pixelSize;
      yBinEnd = yBinStart + pixelSize;

      // Add all of the pixels to this bin!
      pixelsInBin = 0;
      for (x = xBinStart; x < xBinEnd; x += 1) {
        if (x >= width) {
          continue;
        }
        for (y = yBinStart; y < yBinEnd; y += 1) {
          if (y >= height) {
            continue;
          }
          i = (width * y + x) * 4;
          red += data[i + 0];
          green += data[i + 1];
          blue += data[i + 2];
          alpha += data[i + 3];
          pixelsInBin += 1;
        }
      }

      // Make sure the channels are between 0-255
      red = red / pixelsInBin;
      green = green / pixelsInBin;
      blue = blue / pixelsInBin;
      alpha = alpha / pixelsInBin;

      // Draw this bin
      for (x = xBinStart; x < xBinEnd; x += 1) {
        if (x >= width) {
          continue;
        }
        for (y = yBinStart; y < yBinEnd; y += 1) {
          if (y >= height) {
            continue;
          }
          i = (width * y + x) * 4;
          data[i + 0] = red;
          data[i + 1] = green;
          data[i + 2] = blue;
          data[i + 3] = alpha;
        }
      }
    }
  }
};
