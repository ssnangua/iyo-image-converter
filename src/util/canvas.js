const _cvs = document.createElement("canvas");
const _ctx = _cvs.getContext("2d");

export function drawText(
  ctx = _ctx,
  {
    text = "",
    marginBottom = 0,
    fontSize = 48,
    fontFamily = "serif",
    italic = false,
    bold = false,
    fontColor = "#000000",
    strokeWidth = 0,
    strokeColor = "#ffffff",
    lineSpacing = 2,
    autoSize = false,
  }
) {
  if (!text.trim()) return;

  const lines = text.split("\\n").reverse();

  // save
  ctx.save();
  // style
  const font = `${italic ? "italic " : ""}${
    bold ? "bold " : ""
  }${fontSize}px ${fontFamily}`;

  if (autoSize || ctx.canvas.width === 0 || ctx.canvas.height === 0) {
    ctx.canvas.width =
      Math.max(
        ...lines.map((line) => {
          ctx.font = font;
          return ctx.measureText(line).width;
        })
      ) +
      strokeWidth * 2;
    ctx.canvas.height =
      lines.length * (fontSize + lineSpacing) -
      lineSpacing +
      marginBottom +
      strokeWidth * 2;
  }
  const { width, height } = ctx.canvas;
  const x = width / 2;
  const y = height - marginBottom;

  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  lines.forEach((line, index) => {
    const _y = y - (fontSize + lineSpacing) * index;
    // stroke
    if (strokeWidth > 0) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;
      ctx.strokeText(line, x, _y);
    }
    // fill
    ctx.fillStyle = fontColor;
    ctx.fillText(line, x, _y);
  });
  // restore
  ctx.restore();
}

export function getTextBuffer(width, height, options) {
  _cvs.width = width;
  _cvs.height = height;
  _ctx.clearRect(0, 0, width, height);

  drawText(_ctx, options);

  const uri = _cvs.toDataURL();
  return Buffer.from(uri.split(",")[1], "base64");
}
