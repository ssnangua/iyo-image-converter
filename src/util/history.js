export default class {
  constructor(maxItems = 100, handlers = {}) {
    this.data = [];
    this.index = -1;
    this.maxItems = maxItems;
    this.handlers = handlers;
  }
  push(item) {
    if (!item && typeof this.handlers.push === "function") {
      item = this.handlers.push();
    }
    if (this.index !== this.data.length - 1) {
      this.data = this.data.slice(0, this.index + 1);
    }
    if (this.data.length >= this.maxItems) {
      this.data.shift();
    }
    this.data.push(item);
    this.index = this.data.length - 1;
  }
  back() {
    const item = this.index > 0 ? this.data[--this.index] : null;
    if (typeof this.handlers.back === "function") {
      this.handlers.back(item);
    }
    return item;
  }
  forward() {
    const item = this.index < this.data.length - 1 ? this.data[++this.index] : null;
    if (typeof this.handlers.forward === "function") {
      this.handlers.forward(item);
    }
    return item;
  }
}
