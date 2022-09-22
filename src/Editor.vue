<template>
  <div class="window">
    <div
      class="cropper"
      :class="[
        mode,
        grid.visible ? 'grid' : '',
        grid.dark ? 'grid-dark' : '',
        moveMode ? 'move-mode' : '',
        dragging ? 'dragging' : '',
        preview ? 'preview' : '',
        previewLight ? 'preview-light' : '',
      ]"
      @mousedown="onCropperMousedown"
      @mousewheel="onCropperMousewheel"
    >
      <VueCropper
        v-if="img"
        ref="cropper"
        :src="img"
        :viewMode="1"
        :autoCrop="false"
        :background="false"
        :highlight="true"
        :toggleDragModeOnDblclick="false"
        :responsive="true"
        @ready="onCropperReady"
        @zoom="onZoomChange"
        @cropstart="onCropStart"
        @cropmove="onCropChange"
        @cropend="onCropEnd"
        style="width: calc(100vw - 20px); height: calc(100vh - 162px)"
        :style="{ opacity: cropperReady ? 1 : 0.001 }"
      ></VueCropper>
      <div
        v-if="mode === 'rotate' && grid.visible"
        class="cropper-grid"
        :style="{
          'background-size': `${grid.size}px ${grid.size}px`,
          'background-position': `${grid.top}px ${grid.left}px`,
        }"
      ></div>
    </div>

    <!-- toolbar start -->
    <div class="toolbar">
      <div class="modes">
        <div>
          <span
            class="icon-btn"
            @click="onZoom('zoomIn')"
            :title="$t('editor.zoomIn')"
            ><i class="iconfont icon-zoom-in"></i
          ></span>
          <span
            class="icon-btn"
            @click="onZoom('zoomOut')"
            :title="$t('editor.zoomOut')"
            ><i class="iconfont icon-zoom-out"></i
          ></span>
          <span
            class="icon-btn"
            @click="onZoom('zoom1')"
            :title="$t('editor.zoom1')"
            ><i class="iconfont icon-zoom-1"></i
          ></span>
          <span
            class="icon-btn"
            @click="onZoom('zoomFit')"
            :title="$t('editor.zoomFit')"
            ><i class="iconfont icon-zoom-fit"></i
          ></span>
        </div>
        <div class="tip">
          <!-- <span
            v-if="mode === 'crop'"
            :title="$t('editor.cropTip')"
            v-html="$t('editor.cropTip')"
          ></span>
          <span
            v-if="mode === 'rotate' && grid.visible"
            :title="$t('editor.rotateTip')"
            v-html="$t('editor.rotateTip')"
          ></span> -->
        </div>
        <div>
          <span
            class="icon-btn border"
            :class="{ active: mode === 'crop' }"
            @click="mode = 'crop'"
            :title="$t('editor.crop')"
            ><i class="iconfont icon-crop"></i
          ></span>
          <span
            class="icon-btn border"
            :class="{ active: mode === 'rotate' }"
            @click="mode = 'rotate'"
            :title="$t('editor.rotate')"
            ><i class="iconfont icon-rotate"></i
          ></span>
          <span
            class="icon-btn border"
            :class="{
              disabled: mode === 'crop' && !cropped,
              active: grid.visible,
            }"
            @click="grid.visible = !grid.visible"
            @contextmenu="grid.dark = !grid.dark"
            :title="$t('editor.showGrid')"
            ><i class="iconfont icon-grid"></i
          ></span>
          <span
            class="icon-btn border"
            :class="{ disabled: !cropped, active: preview }"
            @mouseenter="preview = true"
            @mouseleave="preview = false"
            @contextmenu="previewLight = !previewLight"
            :title="$t('editor.preview')"
            ><i class="iconfont icon-preview"></i
          ></span>
        </div>
      </div>

      <!-- crop options -->
      <div v-if="mode === 'crop'">
        <div style="white-space: nowrap">
          <span class="label">{{ $t("editor.cropBox") }}</span>
          <el-input-number
            v-model="crop.width"
            :disabled="crop.height === 0"
            :step="1"
            :step-strictly="true"
            :min="0"
            :max="Math.floor(canvas.naturalWidth)"
            controls-position="right"
            style="width: 100px"
          />
          <span style="margin: 0 10px">×</span>
          <el-input-number
            v-model="crop.height"
            :disabled="crop.height === 0 || cropRatio !== 'freeHand'"
            :step="1"
            :step-strictly="true"
            :min="0"
            :max="Math.floor(canvas.naturalHeight)"
            controls-position="right"
            style="width: 100px"
          />
          <el-button
            :icon="MoreFilled"
            @click="showCropSizesMenu"
            style="min-width: 20px; padding: 8px; margin: 0 10px"
          />
          <el-button
            :disabled="!cropped"
            @click="centerCropBox"
            :title="$t('editor.centerCropBox')"
            style="width: 16px; margin: 0px; min-width: 32px"
            ><i class="iconfont icon-position-center"></i
          ></el-button>
          <el-button
            :disabled="!cropped"
            style="margin: 0; margin-left: 10px"
            @click="clearCropBox"
            >{{ $t("editor.clear") }}</el-button
          >
          <!-- <span class="label">(0,0)</span> -->
        </div>
        <div style="white-space: nowrap; margin-top: 4px">
          <span class="label">{{ $t("editor.cropRatio") }}</span>
          <el-select v-model="cropRatio" placeholder=" ">
            <el-option
              v-for="option in cropRatios"
              :key="option.value"
              :label="option.label || $t(option.labelKey)"
              :value="option.value"
            />
          </el-select>
          <el-checkbox
            v-if="cropRatio !== 'freeHand' && cropRatio !== 1"
            v-model="flipRatio"
            style="margin-left: 10px"
          >
            {{ $t("editor.flipRatio") }}
          </el-checkbox>
        </div>
      </div>

      <!-- rotate options start -->
      <div v-if="mode === 'rotate'" style="display: flex; flex-flow: row">
        <div style="flex: auto">
          <div style="display: flex; flex-flow: row">
            <el-radio-group v-model="rotateType">
              <el-radio label="any">
                {{ $t("editor.anyAngle") }}
              </el-radio>
            </el-radio-group>
            <div v-if="rotateType === 'any'" style="flex: auto; margin: 0 20px">
              <el-slider v-model="rotate" :step="0.1" :min="-180" :max="180" />
            </div>
            <el-input-number
              v-if="rotateType === 'any'"
              v-model="rotate"
              :step="0.1"
              :step-strictly="true"
              :min="-180"
              :max="180"
              controls-position="right"
              style="width: 100px"
            />
            <el-button
              v-if="rotateType === 'any'"
              :disabled="rotate === 0"
              @click="rotate = 0"
              style="margin-left: 10px"
              >{{ $t("editor.reset") }}</el-button
            >
          </div>
          <div>
            <el-radio-group v-model="rotateType" style="flex-wrap: nowrap">
              <el-radio label="-90">
                <i class="iconfont icon-rotate-left"></i>
                -90
              </el-radio>
              <el-radio label="90">
                <i class="iconfont icon-rotate-right"></i>
                90
              </el-radio>
              <el-radio label="180">
                <i class="iconfont icon-rotate-180"></i>
                180
              </el-radio>
            </el-radio-group>
          </div>
        </div>
        <div style="margin-left: 10px">
          <div>
            <el-checkbox v-model="flop">
              <i class="iconfont icon-flip"></i>
              {{ $t("editor.flop") }}
            </el-checkbox>
          </div>
          <div>
            <el-checkbox v-model="flip">
              <span style="display: inline-block; transform: rotate(90deg)">
                <i class="iconfont icon-flip"></i>
              </span>
              {{ $t("editor.flip") }}
            </el-checkbox>
          </div>
        </div>
      </div>
      <!-- rotate options end -->
    </div>
    <!-- toolbar end -->

    <div class="footer">
      <span v-if="mode === 'crop'" class="footer-append">
        <span class="label">{{ $t("editor.outerDarkness") }}</span>
        <span class="outerDarkness">
          <el-slider
            v-model="outerDarkness"
            :disabled="!cropped"
            :step="0.01"
            :min="0"
            :max="1"
            :show-tooltip="false"
          />
        </span>
      </span>
      <span
        v-if="mode === 'rotate' && rotateType === 'any'"
        class="footer-append"
      >
        <span style="white-space: nowrap">
          <span class="label">{{ $t("editor.background") }}</span>
          <ColorPicker v-model="background" />
        </span>
      </span>
      <span style="white-space: nowrap">
        <el-link :underline="false" class="tips" @click="tipsDialog = true">
          <i class="iconfont icon-tips"></i>
          {{ $t("editor.tips.title") }}
        </el-link>
        <el-button @click="onCancel">{{ $t("editor.cancel") }}</el-button>
        <el-button type="primary" @click="onConfirm">{{
          $t("editor.confirm")
        }}</el-button>
      </span>
    </div>

    <el-dialog
      v-model="tipsDialog"
      :title="$t('editor.tips.title')"
      width="80%"
      custom-class="tips-dialog"
    >
      <p>
        <i class="iconfont icon-mouse-wheel"></i>：{{
          $t("editor.tips.zoomCanvas")
        }}
      </p>
      <p>
        <i class="iconfont icon-mouse-right"></i> /
        <span class="keyboard"><i class="iconfont icon-space"></i></span> +
        <i class="iconfont icon-mouse-left"></i>：{{
          $t("editor.tips.moveCanvas")
        }}
      </p>
      <el-divider content-position="left">{{ $t("editor.crop") }}</el-divider>
      <p>
        <i class="iconfont icon-mouse-left"></i>：{{
          $t("editor.tips.cropBox")
        }}
      </p>
      <p>
        <span class="keyboard">Shift</span> +
        <i class="iconfont icon-mouse-left"></i>：{{
          $t("editor.tips.aspectRatio")
        }}
      </p>
      <p>
        (<span class="keyboard">Shift</span> +)
        <span class="keyboard square">↑</span>
        <span class="keyboard square">→</span>
        <span class="keyboard square">↓</span>
        <span class="keyboard square">←</span>：{{
          $t("editor.tips.moveCropBox")
        }}
      </p>
      <el-divider content-position="left">{{ $t("editor.rotate") }}</el-divider>
      <p>
        <i class="iconfont icon-mouse-left"></i>：{{
          $t("editor.tips.moveGrid")
        }}
      </p>
      <p>
        <i class="iconfont icon-mouse-left"></i> +
        <i class="iconfont icon-mouse-wheel"></i>：{{
          $t("editor.tips.zoomGrid")
        }}
      </p>
    </el-dialog>
  </div>
</template>

<script>
import url from "url";
import { shallowRef } from "vue";
import { MoreFilled, Close } from "@element-plus/icons-vue";
import VueCropper from "@/editor/VueCropper";
import ColorPicker from "@/component/ColorPicker";
import "@/editor/cropper.css";
import { getImageInfo } from "./util/converter";
import { getCurrentScreen, getSearches, humanFileSize } from "./util/util";
import Contextmenu from "@/contextmenu/contextmenu";
import { cropSizes } from "@/contextmenu/editor";

const cropSizesMenu = new Contextmenu(cropSizes);

const { scaleFactor } = getCurrentScreen();

let mouseX, mouseY, startY, startX;
let cropping = false;
let tempCropBox;

let _task;

export default {
  name: "AppEditor",
  components: { VueCropper, ColorPicker },
  data() {
    return {
      MoreFilled: shallowRef(MoreFilled),
      Close: shallowRef(Close),
      img: "",
      imgInfo: { width: 0, height: 0 },
      cropperReady: false,
      zoom: 1,
      outerDarkness: 0.4,
      mode: "crop",
      preview: false,
      previewLight: false,
      grid: {
        visible: true,
        dark: false,
        size: 100,
        top: -1,
        left: -1,
      },
      cropRatios: [
        { labelKey: "editor.freeHand", value: "freeHand" },
        { labelKey: "editor.originalRatio", value: "originalRatio" },
        { label: "1:1", value: 1 },
        { label: "3:2", value: 3 / 2 },
        { label: "4:3", value: 4 / 3 },
        { label: "16:9", value: 16 / 9 },
      ],
      cropRatio: "freeHand",
      flipRatio: false,
      canvas: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        naturalWidth: 0,
        naturalHeight: 0,
      },
      crop: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      },
      rotateType: "any",
      rotate: 0,
      background: "",
      flop: false,
      flip: false,
      moveMode: false,
      dragging: false,
      tipsDialog: false,
    };
  },

  computed: {
    cropper() {
      return this.$refs.cropper;
    },
    cropped() {
      return this.crop.width > 0 && this.crop.height > 0;
    },
  },

  methods: {
    setCropBoxData(data, hackLimit) {
      this.cropper?.cropper.setCropBoxData(data, hackLimit);
    },

    onCropperReady() {
      this.updateCropper();

      this.onZoom("zoomFit");

      const crop = _task?.edit?.crop;
      if (crop && crop.width > 0 && crop.height > 0) {
        setTimeout(() => {
          const { left, top, width, height } = crop;
          const canvas = this.cropper.getCanvasData();
          this.cropper.initCrop();
          this.setCropBoxData(
            {
              left: left + canvas.left,
              top: top + canvas.top,
              width: width * this.zoom,
              height: height * this.zoom,
            },
            true
          );
          this.onCropChange();
        }, 1);
      }

      this.cropperReady = true;
      window.cropper = this.cropper.cropper;
      this.updateTitle();
    },

    onZoomChange(e) {
      const oldZoom = this.zoom;
      if (e) {
        this.zoom = e.detail.ratio;
      } else {
        const image = this.cropper.getImageData();
        this.zoom = image.width / image.naturalWidth;
      }
      this.$nextTick(() => this.updateCrop(oldZoom));
      this.updateTitle();
    },
    fitContainer() {
      const container = this.cropper.getContainerData();
      const canvas = this.cropper.getCanvasData();
      const zoom = Math.min(
        container.width / canvas.naturalWidth,
        container.height / canvas.naturalHeight
      );
      this.cropper.zoomTo(zoom);
      this.centerCanvas();
    },
    centerCanvas() {
      const container = this.cropper.getContainerData();
      const canvas = this.cropper.getCanvasData();
      const x = (container.width - canvas.width) / 2;
      const y = (container.height - canvas.height) / 2;
      this.cropper.moveTo(x, y);
    },
    centerCropBox() {
      const canvas = this.cropper.getCanvasData();
      const crop = this.cropper.getCropBoxData();
      this.setCropBoxData(
        {
          left: canvas.left + (canvas.width - crop.width) / 2,
          top: canvas.top + (canvas.height - crop.height) / 2,
        },
        true
      );
      this.onCropChange();
    },
    onZoom(type) {
      switch (type) {
        case "zoomIn":
          this.cropper.cropper.zoom(0.1);
          break;
        case "zoomOut":
          this.cropper.cropper.zoom(-0.1);
          break;
        case "zoom1":
          this.cropper.zoomTo(1 / scaleFactor);
          this.centerCanvas();
          break;
        case "zoomFit":
          this.fitContainer();
          break;
      }
    },

    updateCrop(oldZoom) {
      const canvas = this.cropper.getCanvasData();
      if (this.cropped) {
        const scale = oldZoom ? this.zoom / oldZoom : 1;
        this.setCropBoxData({
          left: this.crop.left * scale + canvas.left,
          top: this.crop.top * scale + canvas.top,
          width: this.crop.width * this.zoom,
          height: this.crop.height * this.zoom,
        });
        this.cropper.moveTo(canvas.left, canvas.top);
      }
      this.canvas = canvas;
      this.onCropChange();
    },

    onCropStart() {
      cropping = true;
      this.updateCropper("outerDarkness");
    },
    onCropChange() {
      if (this.cropper) {
        const canvas = this.cropper.getCanvasData();
        const crop = this.cropper.getCropBoxData();
        this.crop = {
          left: (crop.left || 0) - canvas.left,
          top: (crop.top || 0) - canvas.top,
          width: Math.round((crop.width || 0) / this.zoom),
          height: Math.round((crop.height || 0) / this.zoom),
        };
        this.canvas = canvas;
      }
    },
    onCropEnd() {
      cropping = false;
    },

    showCropSizesMenu(e) {
      cropSizesMenu.popup(e, this.cropSizesMenuCallback);
    },
    cropSizesMenuCallback({ value }) {
      if (!this.cropped) this.cropper?.initCrop();
      if (value === "original") {
        value = [this.imgInfo.width, this.imgInfo.height];
      } else if (typeof value === "number") {
        const canvas = this.cropper.getCanvasData();
        value = [canvas.naturalWidth * value, canvas.naturalHeight * value];
      }
      this.setCropBoxData(
        {
          width: value[0] * this.zoom,
          height: value[1] * this.zoom,
        },
        true
      );
      this.onCropChange();
    },

    updateCropper(key) {
      if (!this.cropper) return;
      if (!key || key === "outerDarkness") {
        const modal = document.querySelector(".cropper-modal");
        if (modal)
          modal.style.background = `rgba(0,0,0,${1 - this.outerDarkness})`;
      }
      if (!key || key === "background") {
        const canvas = document.querySelector(".cropper-canvas");
        if (canvas) canvas.style.background = this.background;
        const viewBox = document.querySelector(".cropper-view-box");
        if (viewBox) viewBox.style.background = this.background;
      }
      if (!key || key === "rotateType" || key === "rotate") {
        this.cropper.rotateTo(
          this.rotateType === "any" ? this.rotate : +this.rotateType
        );
        this.cropper.cropper.renderCropBox(true);
        this.onCropChange();
      }
      if (!key || key === "flop" || key === "flip") {
        this.cropper.scale(this.flop ? -1 : 1, this.flip ? -1 : 1);
      }
      if (key === "cropRatio" || key === "flipRatio") {
        tempCropBox = this.cropper.getCropBoxData();
        this.cropper.setAspectRatio(
          this.cropRatio === "freeHand"
            ? NaN
            : this.flipRatio
            ? 1 / this.cropRatio
            : this.cropRatio
        );
        this.setCropBoxData(tempCropBox, true);
        this.onCropChange();
      }
      if (!cropping && (key === "crop.width" || key === "crop.height")) {
        const { width, height } = this.cropper.getCropBoxData();
        if (this.crop.width !== width || this.crop.height !== height) {
          if (this.crop.width === 0 || this.crop.height === 0) {
            this.cropper.clear();
          } else {
            this.setCropBoxData(
              {
                width: this.crop.width * this.zoom,
                height: this.crop.height * this.zoom,
              },
              true
            );
          }
          this.onCropChange();
        }
      }
    },

    onCropperMousewheel(e) {
      if (this.mode === "rotate") {
        if (e.buttons > 0) {
          let size = this.grid.size + (e.deltaY < 0 ? 10 : -10);
          if (size < 10) size = 10;
          this.grid.size = size;
        } else {
          this.cropper.cropper.zoom(e.deltaY < 0 ? 0.1 : -0.1);
        }
      }
    },

    onCropperMousedown(e) {
      if (this.moveMode || e.button === 2) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        const canvas = this.cropper.getCanvasData();
        startX = canvas.left;
        startY = canvas.top;
        window.addEventListener("mousemove", this.moveCanvas);
        window.addEventListener("mouseup", this.stopMoveCanvas);
        this.dragging = true;
      } else if (this.mode === "rotate" && this.grid && e.button === 0) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        this.grid.top = mouseX - 10;
        this.grid.left = mouseY - 10;
        startX = this.grid.left;
        startY = this.grid.top;
        window.addEventListener("mousemove", this.moveGrip);
        window.addEventListener("mouseup", this.stopMoveGrip);
      }
    },
    moveCanvas(e) {
      this.cropper.moveTo(
        startX + e.clientX - mouseX,
        startY + e.clientY - mouseY
      );
      this.updateCrop();
    },
    stopMoveCanvas() {
      window.removeEventListener("mousemove", this.moveCanvas);
      window.removeEventListener("mouseup", this.stopMoveCanvas);
      this.dragging = false;
    },
    moveGrip(e) {
      this.grid.top = startY + e.clientX - mouseX;
      this.grid.left = startX + e.clientY - mouseY;
    },
    stopMoveGrip() {
      window.removeEventListener("mousemove", this.moveGrip);
      window.removeEventListener("mouseup", this.stopMoveGrip);
    },

    clearCropBox() {
      this.cropper.clear();
      this.onCropChange();
    },

    updateTitle() {
      if (!this.cropperReady || !this.imgInfo.filename) return;
      const { filename, width, height, size } = this.imgInfo;
      const zoom = Math.round(this.zoom * 100 * scaleFactor) + "%";
      document.title =
        this.$t("editor.editImage") +
        ` - ${filename} (${width} × ${height} = ${humanFileSize(
          size
        )}) ${zoom}`;
    },

    updateLocale(locale) {
      this.$i18n.locale = locale;
      this.updateTitle();
    },

    onCancel() {
      window.close();
    },
    onConfirm() {
      this.onZoom("zoomFit");
      setTimeout(() => {
        const { zoom, crop, rotateType, rotate, background, flop, flip } = this;
        process.emit("updateTask", {
          key: _task.key,
          edit: { zoom, crop, rotateType, rotate, background, flop, flip },
        });
        window.close();
      }, 0);
    },
  },

  async created() {
    const searches = getSearches();

    process.emit("getTask", searches.taskKey, async (task) => {
      _task = task;
      console.log(task);
      if (task.edit) {
        // eslint-disable-next-line
        const { crop, ...others } = task.edit;
        Object.assign(this, others);
      }
      this.img = url.pathToFileURL(task.input).toString();
      this.imgInfo = await getImageInfo(task.input);
      this.cropRatios[1].value = this.imgInfo.width / this.imgInfo.height;
      this.updateTitle();
    });

    [
      "outerDarkness",
      "background",
      "rotateType",
      "rotate",
      "flop",
      "flip",
      "cropRatio",
      "flipRatio",
      "crop.width",
      "crop.height",
    ].forEach((key) => {
      this.$watch(key, () => this.updateCropper(key));
    });

    this.updateLocale(searches.locale);
    process.on("localeChange", this.updateLocale);
    window.addEventListener("beforeunload", () => {
      process.removeAllListeners("localeChange");
    });

    // window.addEventListener("resize", () => {
    //   const zoom = this.zoom;
    //   setTimeout(() => {
    //     this.cropper.cropper.rotate(0);
    //     this.cropper.zoomTo(zoom);
    //     this.centerCanvas();
    //     this.onZoomChange();
    //     setTimeout(() => {
    //     }, 0);
    //   }, 0);
    // });

    const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    const body = document.body;
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" && !this.moveMode) {
        this.moveMode = true;
      } else if (
        this.cropped &&
        arrowKeys.indexOf(e.code) !== -1 &&
        e.target === body
      ) {
        const canvas = this.cropper.getCanvasData();
        const crop = this.cropper.getCropBoxData();
        const minTop = canvas.top;
        const maxTop = canvas.top + canvas.height - crop.height;
        const minLeft = canvas.left;
        const maxLeft = canvas.left + canvas.width - crop.width;
        const step = e.shiftKey ? 10 : 1;
        switch (e.code) {
          case "ArrowUp":
            crop.top = e.ctrlKey ? minTop : Math.max(crop.top - step, minTop);
            break;
          case "ArrowDown":
            crop.top = e.ctrlKey ? maxTop : Math.min(crop.top + step, maxTop);
            break;
          case "ArrowLeft":
            crop.left = e.ctrlKey
              ? minLeft
              : Math.max(crop.left - step, minLeft);
            break;
          case "ArrowRight":
            crop.left = e.ctrlKey
              ? maxLeft
              : Math.min(crop.left + step, maxLeft);
            break;
        }
        this.cropper.cropper.action = "shortcut";
        this.setCropBoxData(crop, true);
        this.onCropChange();
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.code === "Space" && this.moveMode) {
        this.moveMode = false;
      }
    });

    window.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      return false;
    });
  },
};
</script>

<style></style>
