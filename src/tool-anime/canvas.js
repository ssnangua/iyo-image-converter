let se, sx, sy;

export default {
  methods: {
    setZoom(zoom) {
      if (zoom < this.minZoom) zoom = this.minZoom;
      if (zoom > this.maxZoom) zoom = this.maxZoom;
      this.zoom = zoom;

      const { preview } = this.$refs;
      const { offsetWidth: ow, offsetHeight: oh } = preview;
      const { width: iw, height: ih } = this.image;
      const { width: cw, height: ch, left: cl, top: ct } = this.canvas;
      const width = Math.round(iw * zoom);
      const height = Math.round(ih * zoom);
      let left, top;
      if (width < ow) {
        left = Math.round((ow - width) * 0.5);
      } else {
        left = ow * 0.5 - ((ow * 0.5 - Math.min(0, cl)) / cw) * width;
        if (left > 0) left = 0;
        if (left < ow - width) left = ow - width;
      }
      if (height < oh) {
        top = Math.round((oh - height) * 0.5);
      } else {
        top = oh * 0.5 - ((oh * 0.5 - Math.min(0, ct)) / ch) * height;
        if (top > 0) top = 0;
        if (top < oh - height) top = oh - height;
      }
      Object.assign(this.canvas, { width, height, left, top });
    },

    updateFitZoom() {
      const { preview } = this.$refs;
      const { offsetWidth, offsetHeight } = preview;
      const { width, height } = this.image;
      this.fitZoom = Math.min(offsetWidth / width, offsetHeight / height);
      this.setZoom(this.zoom);
    },

    onStartMove($event) {
      if (this.zoom <= this.fitZoom) return;
      se = $event;
      sx = this.canvas.left;
      sy = this.canvas.top;
      window.addEventListener("mousemove", this.onMove);
      window.addEventListener("mouseup", this.onStopMove);
    },
    onMove($event) {
      const { offsetWidth, offsetHeight } = this.$refs.preview;
      let { width, height } = this.canvas;

      // left
      let left = sx + $event.clientX - se.clientX;
      if (width < offsetWidth) {
        left = Math.round((offsetWidth - width) * 0.5);
      } else {
        if (left > 0) left = 0;
        if (left < offsetWidth - width) left = offsetWidth - width;
      }

      // top
      let top = sy + $event.clientY - se.clientY;
      if (height < offsetHeight) {
        top = Math.round((offsetHeight - height) * 0.5);
      } else {
        if (top > 0) top = 0;
        if (top < offsetHeight - height) top = offsetHeight - height;
      }

      Object.assign(this.canvas, { left, top });
    },
    onStopMove() {
      window.removeEventListener("mousemove", this.onMove);
      window.removeEventListener("mouseup", this.onStopMove);
    },
  },
};
