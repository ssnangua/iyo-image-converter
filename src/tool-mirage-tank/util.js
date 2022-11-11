function grayscale(data) {
  for (let i = 0, len = data.length; i < len; i += 4) {
    const brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
    data[i] = brightness;
    data[i + 1] = brightness;
    data[i + 2] = brightness;
  }
}

function alpha(data, alpha) {
  for (let i = 0, len = data.length; i < len; i += 4) {
    const ia = 1 - alpha;
    data[i] = 255 * alpha + data[i] * ia;
    data[i + 1] = 255 * alpha + data[i + 1] * ia;
    data[i + 2] = 255 * alpha + data[i + 2] * ia;
  }
}

function brighten(data, brightness) {
  const v = brightness * 255;
  for (let i = 0, len = data.length; i < len; i += 4) {
    data[i] += v;
    data[i + 1] += v;
    data[i + 2] += v;
  }
}

function invert(data) {
  for (let i = 0, len = data.length; i < len; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
}

function linearDodgeBlend(data1, data2) {
  const data = [];
  for (let i = 0; i < data1.length; i++) {
    data[i] = data1[i] + data2[i];
  }
  return data;
}

function divideBlend(data1, data2) {
  const data = [];
  for (let i = 0; i < data1.length; i++) {
    const mix = data1[i];
    const base = data2[i];
    let v;
    switch (mix) {
      case 0: v = base === 0 ? 0 : 255; break;
      case 255: v = base; break;
      case base: v = 255; break;
      default: v = Math.round((base / mix) * 255);
    }
    data[i] = v;
  }
  return data;
}

function mask(data1, data2) {
  const data = [];
  for (let i = 0, len = data1.length; i < len; i += 4) {
    const v = data1[i];
    const a = data2[i];
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = a;
  }
  return data;
}

export function mirageTank(fore, back, { fAlpha, bAlpha, bBrightness }) {
  const f = Uint8ClampedArray.from(fore);
  const b = Uint8ClampedArray.from(back);
  grayscale(f);
  grayscale(b);
  alpha(f, fAlpha);
  alpha(b, bAlpha);
  brighten(b, bBrightness - 1);
  invert(f);
  const l = linearDodgeBlend(f, b);
  const d = divideBlend(l, b);
  const m = mask(d, l);
  return Uint8ClampedArray.from(m);
}
