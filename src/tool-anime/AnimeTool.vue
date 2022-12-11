<template>
  <div class="window" :class="{ dragging: frameDragging, playing }">
    <!-- canvas start -->
    <div
      ref="preview"
      class="preview"
      @mousewheel="setZoom(zoom * ($event.deltaY < 0 ? 1.1 : 0.9))"
      @mousedown="onStartMove"
    >
      <canvas
        ref="canvas"
        class="canvas"
        :style="{
          width: canvas.width + 'px',
          height: canvas.height + 'px',
          top: canvas.top + 'px',
          left: canvas.left + 'px',
        }"
      ></canvas>
      <!-- zoom tool bar start -->
      <div class="zoom-tool">
        <span
          class="zoom-btn"
          @click="setZoom(zoom + 0.1)"
          :title="$t('zoomTool.zoomIn')"
          ><i class="iconfont icon-zoom-in"></i
        ></span>
        <span
          class="zoom-btn"
          @click="setZoom(zoom - 0.1)"
          :title="$t('zoomTool.zoomOut')"
          ><i class="iconfont icon-zoom-out"></i
        ></span>
        <span
          class="zoom-btn"
          @click="setZoom(1 / scaleFactor)"
          :title="$t('zoomTool.zoom1')"
          ><i class="iconfont icon-zoom-1"></i
        ></span>
        <span
          class="zoom-btn"
          @click="setZoom(fitZoom)"
          :title="$t('zoomTool.zoomFit')"
          ><i class="iconfont icon-zoom-fit"></i
        ></span>
      </div>
      <!-- zoom tool bar end -->
    </div>
    <!-- canvas end -->

    <!-- info bar start -->
    <div class="info-bar">
      <div
        class="zoom select"
        :title="$t('animeTool.zoomRatio')"
        @click="showZoomMenu"
      >
        <span>{{ Math.round(zoom * scaleFactor * 100) }} % </span>
        <i class="iconfont icon-expand"></i>
      </div>
      <div
        class="size select"
        :title="$t('animeTool.attributes')"
        @click="showSizeMenu"
      >
        <span>{{ image.width }} × {{ image.height }}</span>
        <i class="iconfont icon-expand"></i>
      </div>
      <div class="frames" v-if="hasData">
        {{ frames.length }} {{ $t("animeTool.frames") }}
      </div>
      <div class="frame-info" v-if="frameInfo">
        {{ frameInfo.basename }} - {{ $t("animeTool.frame") }}
        {{ frameInfo.sourceFrameIndex + 1 }}
      </div>
    </div>
    <!-- info bar end -->

    <!-- frame list start -->
    <div
      class="frame-list"
      :class="{ disabled: playing }"
      ref="frameList"
      @mousewheel="setScrollLeft(this.scrollLeft + $event.deltaY)"
      @contextmenu="showTimelineMenu($event)"
    >
      <div v-if="!hasData" class="nodata">{{ $t("animeTool.emptyText") }}</div>
      <div v-else class="frame-divider" :class="{ insert: insertIndex < 0 }" />
      <template v-for="(frame, index) in frames" :key="index">
        <div
          @contextmenu.prevent.stop="showFrameMenu($event, index)"
          class="frame-item"
          :class="{
            selected: frame.selected,
            cur: index === curFrameIndex,
          }"
          @click.stop="onFrameClick($event, index)"
          @mouseenter="hoverFrame = frame"
          @mouseleave="hoverFrame = null"
          @dragstart="onFrameDrag"
        >
          <div class="frame-index">{{ index + 1 }}</div>
          <el-image
            :ref="`frame-${index}`"
            :src="frame.base64"
            fit="contain"
            class="frame-img"
          />
          <div
            class="select"
            @click.stop="showDelayMenu($event, frame)"
            style="width: 64px; line-height: initial"
          >
            <span
              >{{ frame.delay / 1000 }} {{ $t("animeTool.delayUnit") }}</span
            >
            <i class="iconfont icon-expand"></i>
          </div>
          <div
            @click="frame.selected && showSubtitleDialog(index)"
            class="frame-subtitle"
            :style="{
              width: 80 + ((frame.subtitle?.duration || 1) - 1) * 85 + 'px',
              'z-index': (frame.subtitle?.duration || 1) + 100,
            }"
          >
            <span v-if="frame.subtitle" :title="frame.subtitle.text">{{
              frame.subtitle.text
            }}</span>
          </div>
        </div>
        <div class="frame-divider" :class="{ insert: insertIndex === index }" />
      </template>
    </div>
    <!-- frame list end -->

    <!-- control bar start -->
    <div class="control">
      <!-- loop -->
      <div class="btn-group">
        <div
          class="select"
          @click="showLoopMenu"
          :title="$t('animeTool.loop')"
          style="width: 64px"
        >
          <span>{{
            loopKeys[loop]
              ? $t(loopKeys[loop])
              : loop + " " + $t("animeTool.loopUnit")
          }}</span>
          <i class="iconfont icon-expand"></i>
        </div>
      </div>
      <!-- control -->
      <div class="btn-group" :class="{ disabled: !hasData }">
        <!-- first frame -->
        <span
          class="icon-btn"
          :class="{ disabled: playing || curFrameIndex === 0 }"
          @click="onControl('selectFirstFrame')"
          :title="
            $t('animeTool.selectFirstFrame') +
            ' (Ctrl+' +
            $t('animeTool.keyLeft') +
            ')'
          "
          ><i class="iconfont icon-f-first"></i
        ></span>
        <!-- prev frame -->
        <span
          class="icon-btn"
          :class="{ disabled: playing || frames.length < 2 }"
          @click="onControl('selectPrevFrame')"
          :title="
            $t('animeTool.selectPrevFrame') +
            ' (' +
            $t('animeTool.keyLeft') +
            ')'
          "
          ><i class="iconfont icon-f-prev"></i
        ></span>
        <!-- play -->
        <span
          v-if="!playing"
          class="icon-btn play-btn"
          :class="{ disabled: playing || frames.length < 2 }"
          @click="onControl('play')"
          :title="$t('animeTool.play') + ' (' + $t('animeTool.keySpace') + ')'"
          ><i class="iconfont icon-f-play"></i
        ></span>
        <!-- pause -->
        <span
          v-else
          class="icon-btn active"
          @click="onControl('pause')"
          :title="$t('animeTool.pause') + ' (' + $t('animeTool.keySpace') + ')'"
          ><i class="iconfont icon-f-pause"></i
        ></span>
        <!-- next frame -->
        <span
          class="icon-btn"
          :class="{ disabled: playing || frames.length < 2 }"
          @click="onControl('selectNextFrame')"
          :title="
            $t('animeTool.selectNextFrame') +
            ' (' +
            $t('animeTool.keyRight') +
            ')'
          "
          ><i class="iconfont icon-f-next"></i
        ></span>
        <!-- last frame -->
        <span
          class="icon-btn"
          :class="{ disabled: playing || curFrameIndex === frames.length - 1 }"
          @click="onControl('selectLastFrame')"
          :title="
            $t('animeTool.selectLastFrame') +
            ' (Ctrl+' +
            $t('animeTool.keyRight') +
            ')'
          "
          ><i class="iconfont icon-f-last"></i
        ></span>
      </div>
      <div class="btn-group">
        <!-- import -->
        <span
          class="icon-btn has-submenu"
          :class="{ disabled: playing }"
          @click="onControl('insert')"
          @contextmenu="showInsertMenu"
          :title="$t('animeTool.importImages') + ' (Ctrl+O)'"
        >
          <i class="iconfont icon-f-insert"></i>
        </span>
        <!-- delete -->
        <span
          class="icon-btn has-submenu"
          :class="{ disabled: !hasData || playing }"
          @click="onControl('delete')"
          @contextmenu="showDeleteMenu"
          :title="$t('animeTool.deleteFrames') + ' (Del)'"
        >
          <i class="iconfont icon-f-delete"></i>
        </span>
      </div>

      <!-- scrollbar start -->
      <span
        class="icon-btn scrollbar-button left"
        :class="{
          disabled:
            !hasData || playing || thumb.width === 0 || thumb.left === 0,
        }"
        @mousedown="onScrollButton(-1)"
        ><i class="iconfont icon-prev"></i
      ></span>
      <div
        class="scrollbar"
        :class="{ disabled: playing }"
        @mousewheel="setScrollLeft(this.scrollLeft + $event.deltaY)"
      >
        <div
          ref="track"
          class="scrollbar-track"
          @mousedown="
            scrollbarTo($event.offsetX - this.thumb.width / 2);
            startScrollbar($event);
          "
        >
          <div
            ref="thumb"
            class="scrollbar-thumb"
            @mousedown.stop="startScrollbar"
            :style="{
              left: thumb.left + 'px',
              width: thumb.width + 'px',
            }"
          ></div>
        </div>
      </div>
      <span
        class="icon-btn scrollbar-button right"
        :class="{
          disabled:
            !hasData ||
            playing ||
            thumb.width === 0 ||
            thumb.left === thumb.maxLeft,
        }"
        @mousedown="onScrollButton(1)"
        ><i class="iconfont icon-next"></i
      ></span>
      <!-- scrollbar end -->
    </div>
    <!-- control bar end -->

    <!-- footer start -->
    <div class="footer">
      <div class="options">
        <el-button class="setting" @click="showSettingEditor = true">
          <i class="iconfont icon-setting" style="margin-right: 6px"></i>
          {{ $t("animeTool.option") }}
        </el-button>
      </div>
      <div>
        <el-link :underline="false" class="tips" @click="showTipsDialog = true">
          <i class="iconfont icon-tips"></i>
          {{ $t("animeTool.tips.title") }}
        </el-link>
        <el-button
          type="primary"
          :disabled="this.frames.length < 1"
          @click="showSaveMenu"
          >{{ $t("animeTool.export") }}
        </el-button>
      </div>
    </div>
    <!-- footer end -->

    <!-- options panel -->
    <SubtitleDialog
      ref="subtitleDialog"
      :maxDuration="frames.length - curFrameIndex"
      :maxMargin="image.height"
      @data-change="onSubtitleDialogChange"
      @closed="onSubtitleDialogClosed"
    />

    <!-- options panel start -->
    <el-drawer
      v-model="showSettingEditor"
      direction="btt"
      custom-class="drawer-panel"
      modal-class="drawer-modal"
      :with-header="false"
      :size="222"
    >
      <div class="setting-title">
        <span>{{ $t("animeTool.option") }}</span>
      </div>
      <el-scrollbar view-style="padding: 20px">
        <OptionsEditor
          :config="settingOptions"
          :setting="setting"
          :unobtrusive="false"
        />
      </el-scrollbar>
    </el-drawer>
    <!-- options panel end -->

    <!-- input dialog -->
    <InputDialog ref="inputDialog" @confirm="onInputDialogConfirm" />

    <!-- tips dialog -->
    <AnimeTips v-model="showTipsDialog" />
  </div>
</template>

<script>
import path from "path";
import clone from "clone";
import { handleDropImages, openAcceptRule } from "@/util/imageFiles";
import { sharpToBase64, getFrames } from "@/util/converter";
import { getSearches, getCurrentScreen } from "@/util/util";
import { showError, showLoading } from "@/util/message";
import { drawText } from "@/util/canvas";
import OptionsEditor from "@/component/OptionsEditor.vue";
import { saveFramesAs, saveImage } from "./util";
import SubtitleDialog from "./SubtitleDialog.vue";
import InputDialog from "./InputDialog.vue";
import AnimeTips from "./AnimeTips.vue";
import canvas from "./canvas";
import contextmenu from "./contextmenu";
import settingOptions from "./options";

function reverseArray(array, start, end) {
  return array
    .slice(0, start)
    .concat(array.slice(start, end + 1).reverse())
    .concat(array.slice(end + 1));
}

const { scaleFactor } = getCurrentScreen();

let images = [];

let cvs, ctx;

let playedTimes = 0;

let dragInfo;

let copiedImages = null;

export default {
  name: "AnimeTool",
  mixins: [canvas, contextmenu],
  components: {
    OptionsEditor,
    SubtitleDialog,
    InputDialog,
    AnimeTips,
  },

  data() {
    return {
      scrollLeft: 0,
      scrolling: false,
      thumb: {
        left: 0,
        width: 0,
        maxLeft: 0,
      },

      frames: [],
      curFrameIndex: 0,
      playing: false,
      hoverFrame: null,

      scaleFactor,
      minZoom: 0.1 / scaleFactor,
      maxZoom: 10 / scaleFactor,
      fitZoom: 1,
      zoom: 1 / scaleFactor,
      image: {
        width: 320,
        height: 240,
      },
      canvas: {
        width: 320,
        height: 240,
        top: 0,
        left: 0,
      },
      hasCopiedImages: false,

      loop: 0,
      loopKeys: {
        0: "animeTool.forever",
        1: "animeTool.once",
      },

      frameDragging: false,
      insertIndex: -2,

      showSettingEditor: false,
      settingOptions,
      setting: {
        transparent: false,
        background: "#FFFFFF",
        resizeTo: "largestFrame",
        resizeType: "zoom",
        fit: "contain",
        kernel: "lanczos3",
        // colorFormat: "rgba4444",
        maxColors: 256,
      },
      oldResizeTo: "largestFrame",

      dontShowDeleteConfirmAgain: false,

      showTipsDialog: false,
    };
  },

  computed: {
    hasData() {
      return this.frames.length > 0;
    },
    frameInfo() {
      return this.hoverFrame || this.frames[this.curFrameIndex];
    },
    subtitleDialog() {
      return this.$refs.subtitleDialog;
    },
    inputDialog() {
      return this.$refs.inputDialog;
    },
    showingDialog() {
      return (
        this.subtitleDialog?.visible ||
        this.showSettingEditor ||
        this.inputDialog?.visible ||
        this.showTipsDialog
      );
    },
  },

  watch: {
    setting: {
      deep: true,
      handler(setting) {
        if (setting.resizeTo !== this.oldResizeTo) {
          this.oldResizeTo = setting.resizeTo;
          if (setting.resizeTo !== "customSize" && this.hasData) {
            const { width, height } = this.getSizeFromFrames();
            this.updateImageSize(width, height);
          }
        }
        this.drawFrame();
      },
    },
  },

  methods: {
    updateScrollbar() {
      this.$nextTick(() => {
        const { frameList, track } = this.$refs;
        const trackWidth = track.offsetWidth;
        const { scrollWidth, offsetWidth } = frameList;
        const percent = scrollWidth ? (offsetWidth + 2) / scrollWidth : 0;
        const thumbWidth = percent < 1 ? percent * trackWidth : 0;
        Object.assign(this.thumb, {
          width: thumbWidth,
          maxScrollLeft: scrollWidth - offsetWidth + 2,
          maxLeft: trackWidth - thumbWidth,
        });

        this.setScrollLeft(this.scrollLeft);
      });
    },
    startScrollbar(e) {
      Object.assign(this.thumb, {
        startLeft: this.thumb.left,
        mouseLeft: e.clientX,
      });
      this.scrolling = true;
      window.addEventListener("mousemove", this.scroll);
      window.addEventListener("mouseup", this.stopScrollbar);
    },
    scroll(e) {
      const { startLeft, mouseLeft } = this.thumb;
      let left = startLeft + e.clientX - mouseLeft;
      this.scrollbarTo(left);
    },
    stopScrollbar() {
      window.removeEventListener("mousemove", this.scroll);
      window.removeEventListener("mouseup", this.stopScrollbar);
      this.scrolling = false;
    },
    scrollbarTo(left) {
      const { maxLeft, maxScrollLeft } = this.thumb;
      if (left < 0) left = 0;
      if (left > maxLeft) left = maxLeft;
      this.thumb.left = left;
      // update frameList scrollLeft
      this.setScrollLeft((left / maxLeft) * maxScrollLeft);
    },

    onScrollButton(v) {
      this.setScrollLeft(this.scrollLeft + 100 * v);
      this.scrollTimer = setTimeout(() => {
        this.scrollTimer = setInterval(() => {
          this.setScrollLeft(this.scrollLeft + 50 * v);
        }, 50);
      }, 500);
      window.addEventListener("mouseup", this.stopScrollButton);
    },
    stopScrollButton() {
      clearInterval(this.scrollTimer);
      window.removeEventListener("mouseup", this.stopScrollButton);
    },

    setScrollLeft(left) {
      this.$refs.frameList.scrollLeft = left;
      this.scrollLeft = this.$refs.frameList.scrollLeft;
      // update scrollbar-thumb left
      if (!this.scrolling) {
        this.thumb.left =
          this.thumb.maxLeft * (this.scrollLeft / this.thumb.maxScrollLeft);
      }
    },

    showInputDialog(options) {
      this.inputDialog?.show(options);
    },
    onInputDialogConfirm(name, data, checked) {
      if (name === "deleteConfirm") {
        this.dontShowDeleteConfirmAgain = checked;
        this.doDeleteFrames(data);
      } else if (name === "otherSize") {
        const { width, height } = data;
        if (width && height) {
          this.setting.resizeTo = "customSize";
          this.updateImageSize(width, height);
          this.drawFrame();
        } else {
          showError(this.$t("message.invalidInput"));
        }
      } else if (name === "otherLoop") {
        this.loop = data || 0;
      } else if (name === "otherDelay") {
        this.setSelectedFramesDelay((data || 0) * 1000);
      }
    },

    getSelectedFrames() {
      return this.frames.filter((frame) => frame.selected);
    },

    deleteFrames(deleteAll = false) {
      if (this.dontShowDeleteConfirmAgain) {
        this.doDeleteFrames(deleteAll);
      } else {
        const count = this.getSelectedFrames().length;
        this.showInputDialog({
          name: "deleteConfirm",
          type: "warning",
          message: this.$t("animeTool.deleteFramesConfirm", { count }),
          checkboxText: this.$t("animeTool.dontShowAgain"),
          checked: this.dontShowDeleteConfirmAgain,
          confirmText: this.$t("message.yes"),
          cancelText: this.$t("message.no"),
          data: deleteAll,
        });
      }
    },

    doDeleteFrames(deleteAll) {
      const firstSelectedIndex = this.frames.find(
        (frame) => frame.selected
      ).index;
      if (deleteAll) {
        images = [];
        this.frames = [];
      } else {
        images = images.filter((image) => !image.item.selected);
        this.reloadFrames();
      }
      if (this.hasData) {
        if (this.setting.resizeTo !== "customSize") {
          const { width, height } = this.getSizeFromFrames();
          this.updateImageSize(width, height);
        }
        this.selectFrame(Math.min(firstSelectedIndex, images.length - 1));
      } else {
        this.curFrameIndex = 0;
        this.updateImageSize(320, 240);
        this.clearCanvas();
        this.hoverFrame = null;
        this.setScrollLeft(0);
      }
      this.updateScrollbar();
    },

    copySelectedFrames() {
      copiedImages = images.filter((image) => image.item.selected);
      this.hasCopiedImages = true;
    },

    pasteFrames(insertIndex) {
      const { hasData } = this;
      if (copiedImages) {
        const cloneImages = copiedImages.map((image) => {
          const { item, frame, img } = image;
          const cloneItem = clone(item);
          cloneItem.subtitle = null;
          return { item: cloneItem, frame, img };
        });
        if (typeof insertIndex !== "number") {
          const selectedFrames = this.getSelectedFrames();
          const lastSelected = selectedFrames[selectedFrames.length - 1];
          insertIndex = lastSelected ? lastSelected.index + 1 : 0;
        }
        images.splice(insertIndex, 0, ...cloneImages);
        this.reloadFrames();

        if (!hasData && this.setting.resizeTo !== "customSize") {
          const { width, height } = this.getSizeFromFrames();
          this.updateImageSize(width, height);
        }
        this.selectFrame(cloneImages[0].item.index);
        cloneImages.forEach((image) => (image.item.selected = true));

        this.updateScrollbar();
        this.$nextTick(() => {
          this.ensureFrameInView(
            cloneImages[cloneImages.length - 1].item.index
          );
          this.ensureFrameInView(cloneImages[0].item.index);
        });
      }
    },

    reverse() {
      const { frames } = this;
      let start = -1,
        end = -1;
      for (let i = 0; i < frames.length; i++) {
        if (frames[i].selected) {
          if (start < 0) start = i;
          if (end < 0) end = i;
          else if (i !== end + 1)
            return alert(this.$t("animeTool.notConsecutive"));
          else end = i;
        }
      }
      if (end > start) {
        const curFrame = this.frames[this.curFrameIndex];
        images = reverseArray(images, start, end);
        this.reloadFrames(curFrame);
        this.ensureFrameInView(this.curFrameIndex);
      }
    },

    saveAs() {
      saveFramesAs(this, images);
    },

    setSelectedFramesDelay(delay, multiple = false) {
      this.frames.forEach((frame) => {
        if (frame.selected) {
          frame.delay = multiple ? Math.round(frame.delay * delay) : delay;
        }
      });
    },

    getSubtitle(index) {
      const { frames } = this;
      for (let i = 0; i < frames.length; ) {
        const { subtitle } = frames[i];
        i += subtitle?.duration || 1;
        if (i > index) return subtitle;
      }
    },

    showSubtitleDialog(index) {
      this.subtitleDialog?.show(this.frames[index].subtitle);
    },
    onSubtitleDialogChange(data) {
      this.frames[this.curFrameIndex].subtitle = data;
      this.drawFrame();
    },
    onSubtitleDialogClosed(data) {
      this.frames[this.curFrameIndex].subtitle = data.text.trim() ? data : null;
    },

    async insertFrames(files, insertTo) {
      if (files.length === 0) return;
      const loading = showLoading({
        lock: true,
        text: this.$t("animeTool.parsing"),
      });
      const { hasData } = this;
      let allImages = [];
      for (let i = 0; i < files.length; i++) {
        const filePath = files[i].path;
        if (openAcceptRule.test(filePath)) {
          const newImages = [];
          const { name, base: basename } = path.parse(filePath);
          const fileProgress =
            files.length > 1 ? `[ ${i + 1} / ${files.length} ] ` : "";
          const { frames, width, height, delay } = await getFrames(
            filePath,
            {},
            ({ cutted, total }) => {
              loading.setText(
                fileProgress +
                  this.$t("animeTool.parsing") +
                  " " +
                  `${cutted} / ${total}`
              );
            }
          );
          await Promise.all(
            frames.map(async (frame, index) => {
              const base64 = await sharpToBase64(frame);
              const img = new Image(width, height);
              img.src = base64;
              await new Promise((resolve) => (img.onload = resolve));
              // const { buffer } = await frame.raw().toBuffer();
              // const pixels = new Uint8ClampedArray(buffer);
              // const imageData = new ImageData(pixels, width, height);
              const item = {
                basename,
                name,
                sourceFrameIndex: index,
                index: 0,
                base64,
                width,
                height,
                delay: delay[index],
                selected: false,
                subtitle: null,
              };
              newImages[index] = { item, frame, img };
            })
          ).catch(() => {});
          allImages = allImages.concat(newImages);
        }
      }
      let insertIndex = 0;
      if (insertTo === "insertFront") {
        insertIndex = 0;
      } else if (insertTo === "insertAfter") {
        insertIndex = this.curFrameIndex + 1;
      } else if (insertTo === "insertBefore") {
        insertIndex = this.curFrameIndex;
      } else {
        // insertTo === 'insertEnd'
        insertIndex = images.length;
      }
      images.splice(insertIndex, 0, ...allImages);
      this.reloadFrames();

      if (this.setting.resizeTo !== "customSize") {
        const { width, height } = this.getSizeFromFrames();
        this.updateImageSize(width, height);
      }

      if (hasData) {
        this.selectFrame(allImages[0].item.index);
        allImages.forEach((image) => (image.item.selected = true));
      } else {
        this.selectFrame(0);
        this.setZoom(Math.min(1 / this.scaleFactor, this.fitZoom));
      }

      this.updateScrollbar();
      this.$nextTick(() => {
        this.ensureFrameInView(allImages[allImages.length - 1].item.index);
        this.ensureFrameInView(allImages[0].item.index);
      });

      loading.close();
    },

    reloadFrames(curFrame) {
      images.forEach((image, index) => {
        image.item.index = index;
      });
      this.frames = images.map((image) => image.item);
      if (curFrame) {
        this.curFrameIndex = this.frames.indexOf(curFrame);
      }
    },

    onControl(action) {
      switch (action) {
        case "selectFirstFrame":
          this.selectFrame(0);
          break;
        case "selectPrevFrame":
          this.selectFrame(
            this.curFrameIndex === 0
              ? this.frames.length - 1
              : this.curFrameIndex - 1
          );
          break;
        case "play":
          this.playing = true;
          playedTimes = 0;
          this.selectFrame(
            this.curFrameIndex === this.frames.length - 1
              ? 0
              : this.curFrameIndex
          );
          break;
        case "pause":
          this.playing = false;
          break;
        case "selectNextFrame":
          this.selectFrame(
            this.curFrameIndex === this.frames.length - 1
              ? 0
              : this.curFrameIndex + 1
          );
          break;
        case "selectLastFrame":
          this.selectFrame(this.frames.length - 1);
          break;
        case "insert":
          this.insertMenuCallback({ value: "insertEnd" });
          break;
        case "delete":
          this.deleteFrames();
          break;
      }
    },

    onFrameClick(e, index) {
      const { frames, curFrameIndex } = this;
      const frame = frames[index];
      if (e.ctrlKey) {
        if (index !== curFrameIndex) {
          frame.selected = !frame.selected;
        }
      } else if (e.shiftKey) {
        const start = Math.min(index, curFrameIndex);
        const end = Math.max(index, curFrameIndex);
        this.setAllFramesSelected(false);
        frames
          .slice(start, end + 1)
          .forEach((frame) => (frame.selected = true));
      } else {
        this.selectFrame(index);
      }
    },
    setAllFramesSelected(selected) {
      this.frames.forEach((frame) => (frame.selected = selected));
    },
    selectFrame(index) {
      if (index >= 0 && index < this.frames.length) {
        this.setAllFramesSelected(false);
        const frame = this.frames[index];
        frame.selected = true;
        this.curFrameIndex = index;

        this.drawFrame();
        this.ensureFrameInView(index);

        if (this.playing) {
          // play next frame
          setTimeout(() => {
            if (index < this.frames.length - 1) {
              this.selectFrame(index + 1);
            } else {
              playedTimes += 1;
              if (this.loop === 0 || playedTimes < this.loop) {
                this.selectFrame(0);
              } else {
                this.playing = false;
              }
            }
          }, frame.delay);
        }
      }
    },
    ensureFrameInView(index) {
      const { scrollLeft } = this;
      const { offsetWidth } = this.$refs.frameList;
      const maxLeft = 2 + index * 85;
      const minLeft = maxLeft - offsetWidth + 85;
      if (scrollLeft < minLeft) {
        this.setScrollLeft(this.playing ? maxLeft : minLeft);
      } else if (scrollLeft > maxLeft) {
        this.setScrollLeft(maxLeft);
      }
    },

    onFrameDrag(e) {
      this.frameDragging = true;
      dragInfo = {
        target: e.target,
        listWidth: this.$refs.frameList.offsetWidth,
        timestamp: 0,
      };
      this.dragFrame(e);
      dragInfo.target.addEventListener("drag", this.dragFrame);
      dragInfo.target.addEventListener("dragend", this.stopDragFrame);
    },
    dragFrame({ clientX }) {
      const timestamp = Date.now();
      if (timestamp - dragInfo.timestamp < 100) return;
      const { scrollLeft } = this;
      let offset = 0;
      if (clientX < 20) {
        offset = -1;
        this.setScrollLeft(scrollLeft - 85);
      } else if (clientX > dragInfo.listWidth) {
        offset = 1;
        this.setScrollLeft(scrollLeft + 85);
      }
      let index =
        scrollLeft < 2 && clientX < 10 + 85 / 2
          ? -1
          : (((scrollLeft + clientX - 12 - 85 / 2) / 85) << 0) + offset;
      if (index > this.frames.length - 1) index = this.frames.length - 1;
      this.insertIndex = index;
      dragInfo.timestamp = timestamp;
    },
    stopDragFrame() {
      dragInfo.target.removeEventListener("drag", this.dragFrame);
      dragInfo.target.removeEventListener("dragend", this.stopDragFrame);
      dragInfo = null;
      this.frameDragging = false;
      this.moveSelectedFrameToIndex(this.insertIndex);
    },

    moveSelectedFrameToIndex(index) {
      const unselectedImages = images.filter((image) => !image.item.selected);
      const insertIndex =
        index < 0 ? -1 : unselectedImages.indexOf(images[index]);
      if (index < 0 || insertIndex !== -1) {
        const curFrame = this.frames[this.curFrameIndex];
        const selectedImages = images.filter((image) => image.item.selected);
        unselectedImages.splice(
          index < 0 ? 0 : insertIndex + 1,
          0,
          ...selectedImages
        );
        images = unselectedImages;
        this.reloadFrames(curFrame);
      }
    },

    getSizeFromFrames() {
      const math =
        this.setting.resizeTo === "largestFrame" ? Math.max : Math.min;
      const width = math(...this.frames.map((frame) => frame.width));
      const height = math(...this.frames.map((frame) => frame.height));
      return { width, height };
    },
    updateImageSize(width, height) {
      this.image.width = width;
      this.image.height = height;
      cvs.width = width;
      cvs.height = height;
      this.updateFitZoom();
    },
    clearCanvas() {
      ctx.clearRect(0, 0, this.image.width, this.image.height);
      if (!this.setting.transparent) {
        ctx.fillStyle = this.setting.background || "#FFFFFF";
        ctx.fillRect(0, 0, this.image.width, this.image.height);
      }
    },
    drawFrame() {
      this.clearCanvas();
      if (!this.hasData) return;

      const { width: cw, height: ch } = this.image;
      const { img } = images[this.curFrameIndex];
      const { naturalWidth: iw, naturalHeight: ih } = img;

      if (this.setting.resizeType === "zoom") {
        const { fit } = this.setting;
        let sx, sy, x, y;
        if (fit === "contain") {
          const s = Math.min(cw / iw, ch / ih);
          sx = s;
          sy = s;
        } else if (fit === "cover") {
          const s = Math.max(cw / iw, ch / ih);
          sx = s;
          sy = s;
        } else {
          // fit === "fill"
          sx = cw / iw;
          sy = ch / ih;
        }
        x = (cw - iw * sx) / 2;
        y = (ch - ih * sy) / 2;
        ctx.save();
        ctx.scale(sx, sy);
        ctx.drawImage(img, x / sx, y / sy);
        ctx.restore();
      } else {
        const sx = Math.max(0, (iw - cw) / 2);
        const sy = Math.max(0, (ih - ch) / 2);
        const sw = Math.min(cw, iw);
        const sh = Math.min(ch, ih);
        const dx = Math.max(0, (cw - iw) / 2);
        const dy = Math.max(0, (ch - ih) / 2);
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, sw, sh);
      }

      const subtitle = this.getSubtitle(this.curFrameIndex);
      if (subtitle) {
        drawText(ctx, subtitle);
      }
    },

    saveImage(ext) {
      if (this.hasData) saveImage(this, images, ext);
    },

    updateLocale(locale) {
      this.$i18n.locale = locale;
      document.title = this.$t("animeTool.title");
    },
  },

  mounted() {
    cvs = this.$refs.canvas;
    ctx = cvs.getContext("2d");
    this.clearCanvas();

    const searches = getSearches();

    this.updateLocale(searches.locale);
    process.on("localeChange", this.updateLocale);
    window.addEventListener("beforeunload", () => {
      process.removeAllListeners("localeChange");
    });

    handleDropImages((files) => {
      this.insertFrames(files, "insertEnd");
    });

    window.addEventListener("keydown", (event) => {
      if (this.showingDialog || this.playing || this.frames.length < 2) return;
      const isCtrl = event.ctrlKey || event.metaKey;
      switch (event.code) {
        case "ArrowLeft":
          this.onControl(isCtrl ? "selectFirstFrame" : "selectPrevFrame");
          break;
        case "ArrowRight":
          this.onControl(isCtrl ? "selectLastFrame" : "selectNextFrame");
          break;
      }
    });
    window.addEventListener("keyup", (event) => {
      if (this.showingDialog) return;
      if (this.playing) {
        if (event.code === "Space") this.onControl("pause");
        return;
      }
      const isCtrl = event.ctrlKey || event.metaKey;
      switch (event.code) {
        case "KeyO":
          if (isCtrl) this.onControl("insert");
          break;
        case "KeyA":
          if (isCtrl) this.setAllFramesSelected(true);
          break;
        case "KeyC":
          if (isCtrl && this.hasData) this.copySelectedFrames();
          break;
        case "KeyV":
          if (isCtrl && copiedImages) this.pasteFrames();
          break;
        case "KeyS":
          if (isCtrl) this.saveImage("gif");
          break;
        case "Space":
          if (this.hasData) this.onControl("play");
          break;
        case "Delete":
          this.deleteFrames();
          break;
      }
    });

    this.updateFitZoom();
    window.addEventListener("resize", () => {
      this.updateFitZoom();
      this.updateScrollbar();
    });
  },
};
</script>
