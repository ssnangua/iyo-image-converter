const cvs = document.createElement("canvas");
const ctx = cvs.getContext("2d");

export function drawText(
  ctx,
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
  }
) {
  if (!text.trim()) return;
  const { width, height } = ctx.canvas;
  const x = width / 2;
  const y = height - marginBottom;
  // save
  ctx.save();
  // style
  ctx.font = `${italic ? "italic " : ""}${
    bold ? "bold " : ""
  }${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  text
    .split("\\n")
    .reverse()
    .forEach((line, index) => {
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
  cvs.width = width;
  cvs.height = height;
  ctx.clearRect(0, 0, width, height);

  drawText(ctx, options);

  const uri = cvs.toDataURL();
  return Buffer.from(uri.split(",")[1], "base64");
}
