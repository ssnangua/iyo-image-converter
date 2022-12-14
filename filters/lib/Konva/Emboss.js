/**
 * Emboss Filter.
 * Pixastic Lib - Emboss filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 * @function
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Emboss]);
 * node.embossStrength(0.8);
 * node.embossWhiteLevel(0.3);
 * node.embossDirection('right');
 * node.embossBlend(true);
 */
module.exports = function (imageData, options) {
  // pixastic strength is between 0 and 10.  I want it between 0 and 1
  // pixastic greyLevel is between 0 and 255.  I want it between 0 and 1.  Also,
  // a max value of greyLevel yields a white emboss, and the min value yields a black
  // emboss.  Therefore, I changed greyLevel to whiteLevel
  var strength = options.embossStrength * 10,
    greyLevel = options.embossWhiteLevel * 255,
    direction = options.embossDirection,
    blend = options.embossBlend,
    dirY = 0,
    dirX = 0,
    data = imageData.data,
    w = imageData.width,
    h = imageData.height,
    w4 = w * 4,
    y = h;

  switch (direction) {
    case 'top-left':
      dirY = -1;
      dirX = -1;
      break;
    case 'top':
      dirY = -1;
      dirX = 0;
      break;
    case 'top-right':
      dirY = -1;
      dirX = 1;
      break;
    case 'right':
      dirY = 0;
      dirX = 1;
      break;
    case 'bottom-right':
      dirY = 1;
      dirX = 1;
      break;
    case 'bottom':
      dirY = 1;
      dirX = 0;
      break;
    case 'bottom-left':
      dirY = 1;
      dirX = -1;
      break;
    case 'left':
      dirY = 0;
      dirX = -1;
      break;
    default:
      console.error('Unknown emboss direction: ' + direction);
  }

  do {
    var offsetY = (y - 1) * w4;

    var otherY = dirY;
    if (y + otherY < 1) {
      otherY = 0;
    }
    if (y + otherY > h) {
      otherY = 0;
    }

    var offsetYOther = (y - 1 + otherY) * w * 4;

    var x = w;
    do {
      var offset = offsetY + (x - 1) * 4;

      var otherX = dirX;
      if (x + otherX < 1) {
        otherX = 0;
      }
      if (x + otherX > w) {
        otherX = 0;
      }

      var offsetOther = offsetYOther + (x - 1 + otherX) * 4;

      var dR = data[offset] - data[offsetOther];
      var dG = data[offset + 1] - data[offsetOther + 1];
      var dB = data[offset + 2] - data[offsetOther + 2];

      var dif = dR;
      var absDif = dif > 0 ? dif : -dif;

      var absG = dG > 0 ? dG : -dG;
      var absB = dB > 0 ? dB : -dB;

      if (absG > absDif) {
        dif = dG;
      }
      if (absB > absDif) {
        dif = dB;
      }

      dif *= strength;

      if (blend) {
        var r = data[offset] + dif;
        var g = data[offset + 1] + dif;
        var b = data[offset + 2] + dif;

        data[offset] = r > 255 ? 255 : r < 0 ? 0 : r;
        data[offset + 1] = g > 255 ? 255 : g < 0 ? 0 : g;
        data[offset + 2] = b > 255 ? 255 : b < 0 ? 0 : b;
      } else {
        var grey = greyLevel - dif;
        if (grey < 0) {
          grey = 0;
        } else if (grey > 255) {
          grey = 255;
        }

        data[offset] = data[offset + 1] = data[offset + 2] = grey;
      }
    } while (--x);
  } while (--y);
};
