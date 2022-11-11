import { showOpenDialog } from "nwjs-dialog";
import { openAccept } from "@/util/imageFiles";
import Contextmenu from "@/util/contextmenu";

const zoomValues = [
  { label: "100 %", value: 1 },
  { type: "separator" },
  { label: "10 %", value: 0.1 },
  { label: "25 %", value: 0.25 },
  { label: "50 %", value: 0.5 },
  { label: "75 %", value: 0.75 },
  { label: "100 %", value: 1 },
  { label: "125 %", value: 1.25 },
  { label: "150 %", value: 1.5 },
  { label: "175 %", value: 1.75 },
  { label: "200 %", value: 2 },
  { label: "300 %", value: 3 },
  { label: "400 %", value: 4 },
  { label: "500 %", value: 5 },
  { label: "750 %", value: 7.5 },
  { label: "1000 %", value: 10 },
];

const sizeValues = [
  { label: "× 2", value: 2 },
  { label: "× 0.5", value: 0.5 },
  { type: "separator" },
  { label: "120 × 90", value: [120, 90] },
  { label: "160 × 120", value: [160, 120] },
  { label: "200 × 150", value: [200, 150] },
  { label: "320 × 240", value: [320, 240] },
  { label: "640 × 480", value: [640, 480] },
  { label: "800 × 600", value: [800, 600] },
  { type: "separator" },
  { label: "90 × 120", value: [90, 120] },
  { label: "120 × 160", value: [120, 160] },
  { label: "150 × 200", value: [150, 200] },
  { label: "240 × 320", value: [240, 320] },
  { label: "480 × 640", value: [480, 640] },
  { label: "600 × 800", value: [600, 800] },
  { type: "separator" },
  { labelKey: "animeTool.other", value: "other" },
];

const delayValues = [
  { label: "× 2", value: 2, multiple: true },
  { label: "× 0.5", value: 0.5, multiple: true },
  { type: "separator" },
  { labelKey: "animeTool.noDelay", value: 0 },
  { labelKey: "animeTool.pointOneSeconds", value: 100 },
  { label: "0.017 (60 fps)", value: 17 },
  { type: "separator" },
  { label: "0.02", value: 20 },
  { label: "0.05", value: 50 },
  { label: "0.1", value: 100 },
  { label: "0.2", value: 200 },
  { label: "0.5", value: 500 },
  { label: "1.0", value: 1000 },
  { label: "2.0", value: 2000 },
  { label: "5.0", value: 5000 },
  { type: "separator" },
  { labelKey: "animeTool.other", value: "other" },
];

const loopValues = [
  { labelKey: "animeTool.once", value: 1 },
  { labelKey: "animeTool.threeTimes", value: 3 },
  { labelKey: "animeTool.forever", value: 0 },
  { type: "separator" },
  { labelKey: "animeTool.other", value: "other" },
];

const insertTo = [
  {
    labelKey: "animeTool.insertEnd",
    value: "insertEnd",
    modifiers: "ctrl",
    key: "o",
  },
  { labelKey: "animeTool.insertFront", value: "insertFront" },
  { labelKey: "animeTool.insertAfter", value: "insertAfter" },
  { labelKey: "animeTool.insertBefore", value: "insertBefore" },
];

const deleteFrames = [
  { labelKey: "animeTool.deleteFrames", value: "deleteFrames", key: "Delete" },
  { labelKey: "animeTool.deleteAll", value: "deleteAll" },
];

const frameItem = [
  { labelKey: "animeTool.deleteFrames", value: "delete", key: "Delete" },
  { type: "separator" },
  { labelKey: "animeTool.moveFront", value: "moveFront" },
  { labelKey: "animeTool.moveEnd", value: "moveEnd" },
  { type: "separator" },
  { labelKey: "animeTool.reverseFrames", value: "reverse", cmd: "reverse" },
  { type: "separator" },
  { labelKey: "animeTool.saveAs", value: "saveAs" },
  { type: "separator" },
  {
    labelKey: "animeTool.selectAll",
    value: "selectAll",
    modifiers: "ctrl",
    key: "a",
  },
];

const saveTypes = [
  { labelKey: "animeTool.gifFormat", value: "gif" },
  { labelKey: "animeTool.webpFormat", value: "webp" },
  { labelKey: "animeTool.apngFormat", value: "png" },
];

const zoomMenu = new Contextmenu(zoomValues);
const sizeMenu = new Contextmenu(sizeValues);
const delayMenu = new Contextmenu(delayValues);
const loopMenu = new Contextmenu(loopValues);
const insertMenu = new Contextmenu(insertTo);
const deleteMenu = new Contextmenu(deleteFrames);
const frameMenu = new Contextmenu(frameItem);
const saveMenu = new Contextmenu(saveTypes);

export default {
  methods: {
    // zoom
    showZoomMenu(e) {
      zoomMenu.popup(e, this.zoomMenuCallback);
    },
    zoomMenuCallback({ value }) {
      this.setZoom(value / this.scaleFactor);
    },

    // size
    showSizeMenu(e) {
      sizeMenu.popup(e, this.sizeMenuCallback);
    },
    sizeMenuCallback({ value }) {
      let width, height;
      if (value === "other") {
        this.showInputDialog({
          title: this.$t("animeTool.setImageSize"),
          name: "otherSize",
          data: {
            width: this.image.width,
            height: this.image.height,
          },
        });
      } else if (Array.isArray(value)) {
        width = value[0];
        height = value[1];
      } else {
        width = Math.floor(this.image.width * value);
        height = Math.floor(this.image.height * value);
      }
      if (width && height) {
        this.setting.resizeTo = "customSize";
        this.updateImageSize(width, height);
        this.drawFrame();
      }
    },

    // frame
    showFrameMenu(e, index) {
      if (!this.frames[index].selected) this.onFrameClick(e, index);
      const count = this.frames.filter((frame) => frame.selected).length;
      frameMenu.popup(e, this.frameMenuCallback, { reverse: count > 1 });
    },
    frameMenuCallback({ value }) {
      if (value === "delete") {
        this.deleteFrames();
      } else if (value === "moveFront") {
        this.moveSelectedFrameToIndex(-1);
      } else if (value === "moveEnd") {
        this.moveSelectedFrameToIndex(this.frames.length - 1);
      } else if (value === "reverse") {
        this.reverse();
      } else if (value === "saveAs") {
        this.saveAs();
      } else if (value === "selectAll") {
        this.setAllFramesSelected(true);
      }
    },

    // delay
    showDelayMenu(e, frame) {
      delayMenu.popup(e, this.delayMenuCallback, null, frame);
    },
    delayMenuCallback({ value, multiple }, frame) {
      frame.selected = true;
      if (value === "other") {
        this.showInputDialog({
          title: this.$t("animeTool.setFrameDelay"),
          name: "otherDelay",
          data: this.frames[this.curFrameIndex].delay / 1000,
        });
      } else {
        this.setSelectedFramesDelay(value, multiple);
      }
    },

    // loop
    showLoopMenu(e) {
      loopMenu.popup(e, this.loopMenuCallback);
    },
    loopMenuCallback({ value }) {
      if (value === "other") {
        this.showInputDialog({
          title: this.$t("animeTool.setLoopCount"),
          name: "otherLoop",
          data: this.loop,
        });
      } else {
        this.loop = value;
      }
    },

    // insert
    showInsertMenu(e) {
      insertMenu.popup(e, this.insertMenuCallback);
    },
    insertMenuCallback({ value }) {
      showOpenDialog({
        accept: openAccept,
        multiple: true,
        returnFormat: "file",
      }).then((files) => {
        this.insertFrames(files, value);
      });
    },

    // delete
    showDeleteMenu(e) {
      deleteMenu.popup(e, this.deleteMenuCallback);
    },
    deleteMenuCallback({ value }) {
      this.deleteFrames(value === "deleteAll");
    },

    // save
    showSaveMenu(e) {
      saveMenu.popup(e, this.saveMenuCallback);
    },
    saveMenuCallback({ value }) {
      this.saveImage(value);
    },
  },
};
