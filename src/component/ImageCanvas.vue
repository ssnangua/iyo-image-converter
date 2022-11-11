<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import sharp from "sharp";
import { getSharp } from "@/util/converter";

export async function getPixels(input, width, height) {
  let image = await getSharp(input);
  const meta = await image.metadata();
  if (meta.width !== width || meta.height !== height) {
    image.png().resize({
      width,
      height,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
    image = sharp(await image.toBuffer());
  }
  const buffer = await image.ensureAlpha().raw().toBuffer();
  return new Uint8ClampedArray(buffer.buffer);
}

export default {
  name: "ImageCanvas",
  data() {
    return {
      ctx: null,
    };
  },
  methods: {
    setCanvasSize(width, height) {
      this.ctx.canvas.width = width;
      this.ctx.canvas.height = height;
    },
    setCanvasElSize(width, height) {
      this.ctx.canvas.style.width = width + "px";
      this.ctx.canvas.style.height = height + "px";
    },

    drawImage(
      input,
      imageWidth = this.ctx.canvas.width,
      imageHeight = this.ctx.canvas.height
    ) {
      const pixels = getPixels(input, imageWidth, imageHeight);
      this.drawPixels(pixels, imageWidth, imageHeight);
    },

    drawPixels(pixels, imageWidth, imageHeight) {
      const { width, height } = this.ctx.canvas;
      const imageData = new ImageData(pixels, imageWidth, imageHeight);
      const x = (width - imageWidth) * 0.5;
      const y = (height - imageHeight) * 0.5;
      // this.ctx.clearRect(0, 0, width, height);
      this.ctx.putImageData(imageData, x, y);
    },
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext("2d");
  },
};
</script>

<style></style>
