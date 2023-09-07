<template>
  <div class="window" :class="{ extended: showImgList }">
    <div class="img-list-wrapper">
      <div v-if="imgList.length > 0" class="img-list">
        <div
          class="img-item"
          v-for="(item, index) in imgList"
          :key="index"
          :title="item.path"
          :class="{ cur: item === img, edited: item.edited }"
          @click="loadImage(item)"
        >
          {{ item.name }}
        </div>
      </div>
      <div v-else class="img-list">
        <div class="no-image">
          {{ $t("editImage.noImage") }}
        </div>
      </div>
      <div class="img-list-setting">
        <div style="margin: -5px 0 5px 0">
          <el-link :underline="false" class="link-btn" @click="onOpen">
            <i
              class="iconfont icon-f-insert"
              style="font-size: 12px; margin-right: 4px"
            ></i>
            {{ $t("editImage.addImages") }}
          </el-link>
          <el-link
            :underline="false"
            :disabled="imgList.length === 0"
            class="link-btn"
            @click="imgList = []"
            style="float: right"
          >
            <i
              class="iconfont icon-f-clear"
              style="font-size: 12px; margin-right: 4px"
            ></i>
            {{ $t("editImage.clearImages") }}
          </el-link>
        </div>
        <div>
          <FilePicker
            v-model="outputFolder"
            :options="{
              nwdirectorydescKey: 'editImage.chooseOutputFolder',
              nwdirectory: true,
            }"
            :placeholder="$t('editImage.outputFolder')"
          />
        </div>
      </div>
    </div>

    <div class="main">
      <div class="header" style="margin-bottom: 10px">
        <el-button
          type="primary"
          @click="onOpen"
          style="padding: 0 10px; cursor: pointer"
          tabindex="-1"
        >
          <i class="iconfont icon-image"></i>
          <span style="margin-left: 5px">{{ $t("editImage.open") }}</span>
        </el-button>

        <el-link
          :underline="false"
          :type="showImgList ? 'primary' : 'default'"
          class="link-btn img-list-btn"
          @click="
            showImgList = !showImgList;
            onResize();
          "
        >
          <i class="iconfont icon-images" style="margin-right: 4px"></i>
          {{ $t("editImage.imageList") }}
        </el-link>

        <el-link
          :underline="false"
          class="link-btn tips-btn"
          @click="tipsDialog = true"
        >
          <i class="iconfont icon-tips"></i>
          {{ $t("editImage.tips.title") }}
        </el-link>
      </div>
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
          cropping ? 'cropping' : '',
        ]"
        @mousedown="onCropperMousedown"
        @mousewheel="onCropperMousewheel"
      >
        <VueCropper
          v-if="img"
          ref="cropper"
          :src="img.url"
          :viewMode="1"
          :autoCrop="false"
          :background="false"
          :highlight="true"
          :toggleDragModeOnDblclick="false"
          :responsive="false"
          @ready="onCropperReady"
          @zoom="onZoomChange"
          @cropstart="onCropStart"
          @cropmove="onCropChange"
          @cropend="onCropEnd"
          class="vue-cropper"
          :class="{ 'cropper-hide': imgList.length === 0 }"
          :style="{ opacity: cropperReady ? 1 : 0.001 }"
        ></VueCropper>
        <div v-if="!img || imgList.length === 0" class="no-image">
          {{ $t("editImage.noImage") }}
        </div>
        <div
          v-if="cropperReady && mode === 'rotate' && grid.visible"
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
              :title="$t('zoomTool.zoomIn')"
              ><i class="iconfont icon-zoom-in"></i
            ></span>
            <span
              class="icon-btn"
              @click="onZoom('zoomOut')"
              :title="$t('zoomTool.zoomOut')"
              ><i class="iconfont icon-zoom-out"></i
            ></span>
            <span
              class="icon-btn"
              @click="onZoom('zoom1')"
              :title="$t('zoomTool.zoom1')"
              ><i class="iconfont icon-zoom-1"></i
            ></span>
            <span
              class="icon-btn"
              @click="onZoom('zoomFit')"
              :title="$t('zoomTool.zoomFit')"
              ><i class="iconfont icon-zoom-fit"></i
            ></span>
          </div>
          <div class="tip">
            <!-- <span
            v-if="mode === 'crop'"
            :title="$t('editImage.cropTip')"
            v-html="$t('editImage.cropTip')"
          ></span>
          <span
            v-if="mode === 'rotate' && grid.visible"
            :title="$t('editImage.rotateTip')"
            v-html="$t('editImage.rotateTip')"
          ></span> -->
            <span v-if="canvas && canvas.width > 0" class="crop-pos"
              >{{ Math.round((canvas.width || 0) / zoom) }} ×
              {{ Math.round((canvas.height || 0) / zoom) }}</span
            >
          </div>
          <div>
            <span
              class="icon-btn border"
              :class="{ active: mode === 'crop' }"
              @click="mode = 'crop'"
              :title="$t('editImage.crop')"
              ><i class="iconfont icon-crop"></i
            ></span>
            <span
              class="icon-btn border"
              :class="{ active: mode === 'rotate' }"
              @click="mode = 'rotate'"
              :title="$t('editImage.rotate')"
              ><i class="iconfont icon-rotate"></i
            ></span>
            <span
              class="icon-btn border has-submenu"
              :class="{
                disabled: mode === 'crop' && !cropped,
                active: grid.visible,
              }"
              @click="grid.visible = !grid.visible"
              @contextmenu="grid.dark = !grid.dark"
              :title="$t('editImage.showGrid')"
              ><i class="iconfont icon-grid"></i
            ></span>
            <span
              class="icon-btn border has-submenu"
              :class="{ disabled: !cropped, active: preview }"
              @mouseenter="preview = true"
              @mouseleave="preview = false"
              @contextmenu="previewLight = !previewLight"
              :title="$t('editImage.preview')"
              ><i class="iconfont icon-preview"></i
            ></span>
          </div>
        </div>

        <!-- crop options -->
        <div v-if="mode === 'crop'">
          <div style="white-space: nowrap">
            <span class="label">{{ $t("editImage.cropBox") }}</span>
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
              style="min-width: 20px; padding: 8px; margin: 0 0 0 10px"
            />
            <el-button
              :disabled="!cropped"
              @click="centerCropBox"
              :title="$t('editImage.centerCropBox')"
              style="width: 16px; margin: 0 0 0 10px; min-width: 32px"
            >
              <i class="iconfont icon-position-center"></i>
            </el-button>
            <el-button
              :disabled="!cropped"
              style="margin: 0 0 0 10px"
              @click="clearCropBox"
              >{{ $t("editImage.clear") }}</el-button
            >
            <span v-if="cropped" class="crop-pos"
              >({{ Math.round((crop.left || 0) / zoom) }},
              {{ Math.round((crop.top || 0) / zoom) }})</span
            >
          </div>
          <div style="white-space: nowrap; margin-top: 4px">
            <span class="label">{{ $t("editImage.cropRatio") }}</span>
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
              {{ $t("editImage.flipRatio") }}
            </el-checkbox>
          </div>
        </div>

        <!-- rotate options start -->
        <div v-if="mode === 'rotate'" style="display: flex; flex-flow: row">
          <div style="flex: auto">
            <div style="display: flex; flex-flow: row">
              <el-radio-group v-model="rotateType">
                <el-radio label="any">
                  {{ $t("editImage.anyAngle") }}
                </el-radio>
              </el-radio-group>
              <div
                v-if="rotateType === 'any'"
                style="flex: auto; margin: 0 20px"
              >
                <el-slider
                  v-model="rotate"
                  :step="0.1"
                  :min="-180"
                  :max="180"
                />
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
                >{{ $t("editImage.reset") }}</el-button
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
                {{ $t("editImage.flop") }}
              </el-checkbox>
            </div>
            <div>
              <el-checkbox v-model="flip">
                <span style="display: inline-block; transform: rotate(90deg)">
                  <i class="iconfont icon-flip"></i>
                </span>
                {{ $t("editImage.flip") }}
              </el-checkbox>
            </div>
          </div>
        </div>
        <!-- rotate options end -->
      </div>
      <!-- toolbar end -->

      <div class="footer">
        <span v-if="mode === 'crop'" class="footer-append">
          <span class="label">{{ $t("editImage.outerDarkness") }}</span>
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
            <span class="label">{{ $t("editImage.background") }}</span>
            <ColorPicker v-model="background" />
          </span>
        </span>
        <span style="white-space: nowrap">
          <el-button
            type="primary"
            @click="onSave"
            :disabled="!img"
            :style="{ cursor: img ? 'pointer' : 'not-allowed' }"
            >{{ $t("editImage.save") }}</el-button
          >
        </span>
      </div>
    </div>

    <el-dialog
      v-model="tipsDialog"
      :title="$t('editImage.tips.title')"
      width="80%"
      class="tips-dialog"
    >
      <p>
        <i class="iconfont icon-mouse-wheel"></i>：{{
          $t("editImage.tips.zoomCanvas")
        }}
      </p>
      <p>
        <i class="iconfont icon-mouse-right"></i> /
        <span class="keyboard"><i class="iconfont icon-space"></i></span> +
        <i class="iconfont icon-mouse-left"></i>：{{
          $t("editImage.tips.moveCanvas")
        }}
      </p>
      <el-divider content-position="left">{{
        $t("editImage.crop")
      }}</el-divider>
      <p>
        <i class="iconfont icon-mouse-left"></i>：{{
          $t("editImage.tips.cropBox")
        }}
      </p>
      <p>
        <span class="keyboard">Shift</span> +
        <i class="iconfont icon-mouse-left"></i>：{{
          $t("editImage.tips.aspectRatio")
        }}
      </p>
      <p>
        (<span class="keyboard">Shift</span> +)
        <span class="keyboard square">↑</span>
        <span class="keyboard square">→</span>
        <span class="keyboard square">↓</span>
        <span class="keyboard square">←</span>：{{
          $t("editImage.tips.moveCropBox")
        }}
      </p>
      <p>
        <span class="keyboard">Ctrl</span> +
        <span class="keyboard square">A</span>：{{
          $t("editImage.tips.maxCropBox")
        }}
      </p>
      <el-divider content-position="left">{{
        $t("editImage.rotate")
      }}</el-divider>
      <p>
        <i class="iconfont icon-mouse-left"></i>：{{
          $t("editImage.tips.moveGrid")
        }}
      </p>
      <p>
        <i class="iconfont icon-mouse-left"></i> +
        <i class="iconfont icon-mouse-wheel"></i>：{{
          $t("editImage.tips.zoomGrid")
        }}
      </p>
    </el-dialog>
  </div>
</template>

<script>
import fs from "fs-extra";
import path from "path";
import url from "url";
import { shallowRef } from "vue";
import clone from "clone";
import { showOpenDialog, showSaveDialog } from "nwjs-dialog";
import { MoreFilled, Close } from "@element-plus/icons-vue";
import { getImageInfo } from "@/util/converter";
import {
  getCurrentScreen,
  getSearches,
  humanFileSize,
  getOutputPath,
  comparePaths,
} from "@/util/util";
import {
  handleDropImages,
  openAccept,
  saveAccept,
  saveAcceptRule,
} from "@/util/imageFiles";
import ColorPicker from "@/component/ColorPicker.vue";
import FilePicker from "@/component/FilePicker.vue";
import { cropSizesMenu } from "./contextmenu";
import VueCropper from "./VueCropper";
import { applyEditor } from "./util";
import "./cropper.css";
import { showError, showLoading } from "@/util/message";

const { scaleFactor } = getCurrentScreen();

function getImgItem(imagePath) {
  return {
    path: imagePath,
    url: url.pathToFileURL(imagePath).toString(),
    name: path.basename(imagePath),
    edited: false,
  };
}

const defaultData = {
  zoom: 1,
  mode: "crop",
  outerDarkness: 0.4,
  preview: false,
  previewLight: false,
  grid: {
    visible: true,
    dark: false,
    size: 100,
    top: -1,
    left: -1,
  },
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
  background: "#FFFFFF",
  flop: false,
  flip: false,
  moveMode: false,
  dragging: false,
  tipsDialog: false,
};

let mouseX, mouseY, startY, startX;
let tempCropBox;
let resizeTimer = -1;

export default {
  name: "EditImage",
  components: { VueCropper, ColorPicker, FilePicker },
  data() {
    return Object.assign(
      {
        MoreFilled: shallowRef(MoreFilled),
        Close: shallowRef(Close),
        img: "",
        imgInfo: { width: 0, height: 0 },
        cropperReady: false,
        cropRatios: [
          { labelKey: "editImage.freeHand", value: "freeHand" },
          { labelKey: "editImage.originalRatio", value: "originalRatio" },
          { label: "1:1", value: 1 },
          { label: "3:2", value: 3 / 2 },
          { label: "4:3", value: 4 / 3 },
          { label: "16:9", value: 16 / 9 },
        ],
        cropping: false,
        showImgList: false,
        imgList: [],
        outputFolder: "",
      },
      clone(defaultData)
    );
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
    reset() {
      Object.assign(this, clone(defaultData));
    },

    setImgList(images) {
      const needLoadImage = this.imgList.length === 0 || !this.showImgList;
      const imgList = images.map((image) => getImgItem(image));
      if (this.showImgList) this.imgList = this.imgList.concat(imgList);
      else this.imgList = imgList;
      this.imgList.forEach((item, index) => (item.index = index));
      if (needLoadImage && imgList.length > 0) this.loadImage(imgList[0]);
    },

    onOpen() {
      showOpenDialog({ accept: openAccept, multiple: true }).then((images) => {
        this.setImgList(images);
      });
    },

    async loadImage(img) {
      this.reset();
      if (this.img) this.cropper.replace(img.url);
      this.img = img;
      this.imgInfo = await getImageInfo(img.path);
      this.cropRatios[1].value = this.imgInfo.width / this.imgInfo.height;
      this.updateTitle();
    },

    setCropBoxData(data, hackLimit) {
      this.cropper?.cropper.setCropBoxData(data, hackLimit);
    },

    onCropperReady() {
      this.updateCropper();
      this.onZoom("zoomFit");
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
        false
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
      document.activeElement.blur();
      this.cropping = true;
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
      this.cropping = false;
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
      if (!this.cropping && (key === "crop.width" || key === "crop.height")) {
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
      if (!this.cropperReady) return;
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
        this.$t("editImage.title") +
        ` - ${filename} (${width} × ${height} = ${humanFileSize(
          size
        )}) ${zoom}`;
    },

    onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (this.img) this.cropper.cropper.initContainer();
      }, 50);
    },

    async onSave() {
      const { img, outputFolder, imgList } = this;
      const { dir, base, ext } = path.parse(img.path);
      let output;
      if (outputFolder && fs.existsSync(outputFolder)) {
        output = path.join(outputFolder, this.img.name);
      } else {
        output = await showSaveDialog({
          nwworkingdir: dir,
          nwsaveas: base,
          accept: saveAccept,
        }).then(([fileOut]) => {
          if (!saveAcceptRule.test(fileOut)) fileOut += ext;
          return fileOut;
        });
      }
      if (output) {
        output = getOutputPath(output);
        const loading = showLoading({
          lock: true,
          text: this.$t("editImage.saving"),
        });
        await applyEditor(this.imgInfo, output, this).catch((err) => {
          showError(err);
          console.warn(err);
        });
        loading.close();
        img.edited = true;
        // load next image
        if (this.showImgList && img.index < imgList.length - 1) {
          this.loadImage(imgList[img.index + 1]);
        }
        // reload image if input file changed
        else if (comparePaths(output, img.path)) {
          this.loadImage(img);
        }
      }
    },
  },

  async created() {
    // 拖放文件
    handleDropImages((images) => {
      this.setImgList(images.map((item) => item.path));
    }, true);

    // 设置变更
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

    // 多语言
    this.$i18n.locale = getSearches().locale;
    this.updateTitle();

    // 快捷键
    const arrowCodes = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    const zoomKeys = {
      0: "zoomFit",
      1: "zoom1",
      "-": "zoomOut",
      "=": "zoomIn",
    };
    const body = document.body;
    window.addEventListener("keydown", (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toUpperCase();
      if (e.code === "Space" && !this.moveMode) {
        this.moveMode = true;
      } else if (isCtrl && key === "S" && this.img) {
        this.onSave();
      } else if (isCtrl && key === "A" && this.cropperReady) {
        this.cropSizesMenuCallback({ value: 1 });
      } else if (isCtrl && key === "D" && this.cropperReady) {
        this.clearCropBox();
      } else if (isCtrl && zoomKeys[key] && this.cropperReady) {
        this.onZoom(zoomKeys[key]);
      } else if (
        this.cropped &&
        arrowCodes.indexOf(e.code) !== -1 &&
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
            crop.top = isCtrl ? minTop : Math.max(crop.top - step, minTop);
            break;
          case "ArrowDown":
            crop.top = isCtrl ? maxTop : Math.min(crop.top + step, maxTop);
            break;
          case "ArrowLeft":
            crop.left = isCtrl ? minLeft : Math.max(crop.left - step, minLeft);
            break;
          case "ArrowRight":
            crop.left = isCtrl ? maxLeft : Math.min(crop.left + step, maxLeft);
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

    // 窗口大小变更
    window.addEventListener("resize", () => {
      this.onResize();
    });

    // 禁用右键菜单
    window.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      return false;
    });
  },
};
</script>
