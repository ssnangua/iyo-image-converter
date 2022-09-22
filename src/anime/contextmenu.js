import { showOpenDialog } from "nwjs-dialog";
import Contextmenu from "@/contextmenu/contextmenu";
import {
  zoomValues,
  sizeValues,
  delayValues,
  loopValues,
  insertTo,
  deleteFrames,
  frameItem,
  saveTypes,
} from "@/contextmenu/animeTool";
import { openAccept } from "@/util/imageFiles";

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
      this.zoom = value;
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
            width: this.width,
            height: this.height,
          },
        });
      } else if (Array.isArray(value)) {
        width = value[0];
        height = value[1];
      } else {
        width = this.width * value;
        height = this.height * value;
      }
      if (width && height) {
        this.setting.resizeTo = "customSize";
        this.updateCanvasSize(width, height);
        this.drawFrame();
      }
    },

    // frame
    showFrameMenu(e, index) {
      if (!this.frames[index].selected) this.onFrameClick(e, index);
      frameMenu.popup(e, this.frameMenuCallback);
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
