<template>
  <div class="window">
    <div class="header">
      <el-button type="primary" class="icon-btn" @click="onOpen">
        <i class="iconfont icon-image"></i>
        <span>{{ $t("filterTool.open") }}</span>
      </el-button>
      <el-button
        text
        class="icon-btn"
        :disabled="filters.length === 0"
        @click="batchSetting.visible = true"
      >
        <i class="iconfont icon-images"></i>
        <span>{{ $t("filterTool.batch") }}</span>
      </el-button>

      <div class="filter-control">
        <el-button
          type="primary"
          round
          :icon="Plus"
          @click="filtersListVisible = true"
          style="float: left"
          >{{ $t("filterTool.addFilter") }}</el-button
        >
      </div>
    </div>

    <div class="body">
      <!-- preview start -->
      <div
        ref="preview"
        class="preview"
        @mousewheel="setZoom(canvas.zoom * ($event.deltaY < 0 ? 1.1 : 0.9))"
        @mousedown="onStartMove"
      >
        <!-- canvas start -->
        <ImageCanvas
          ref="canvas"
          :width="canvas.ctxWidth"
          :height="canvas.ctxHeight"
          :style="{
            width: canvas.width + 'px',
            height: canvas.height + 'px',
            left: canvas.left + 'px',
            top: canvas.top + 'px',
          }"
        />
        <!-- canvas end -->

        <!-- zoom tool bar start -->
        <div v-if="hasImage" class="zoom-tool">
          <span
            class="icon-btn"
            @click="setZoom(canvas.zoom + 0.1)"
            :title="$t('zoomTool.zoomIn')"
            ><i class="iconfont icon-zoom-in"></i
          ></span>
          <span
            class="icon-btn"
            @click="setZoom(canvas.zoom - 0.1)"
            :title="$t('zoomTool.zoomOut')"
            ><i class="iconfont icon-zoom-out"></i
          ></span>
          <span
            class="icon-btn"
            @click="setZoom(1 / scaleFactor)"
            :title="$t('zoomTool.zoom1')"
            ><i class="iconfont icon-zoom-1"></i
          ></span>
          <span
            class="icon-btn"
            @click="setZoom(canvas.fitZoom)"
            :title="$t('zoomTool.zoomFit')"
            ><i class="iconfont icon-zoom-fit"></i
          ></span>
        </div>
        <!-- zoom tool bar end -->

        <div v-else class="no-image">
          {{ $t("filterTool.noImage") }}
        </div>
      </div>
      <!-- preview end -->

      <!-- added filter list start -->
      <div class="added-filters">
        <el-scrollbar v-if="filters.length > 0" class="filter-list">
          <div
            v-for="(item, index) in filters"
            :key="item.name + '-' + index"
            class="filter-item"
            :class="{ disabled: !item.enable }"
          >
            <div class="filter-item-title">
              <span>{{ $t(`filters.${item.filterKey}.label`) }}</span>
              <span class="filter-item-control">
                <el-button
                  v-if="index > 0"
                  text
                  :icon="Top"
                  @click="onMoveFilter(index, -1)"
                  class="control-btn"
                ></el-button>
                <el-button
                  v-if="index < filters.length - 1"
                  text
                  :icon="Bottom"
                  @click="onMoveFilter(index, 1)"
                  class="control-btn"
                ></el-button>
                <el-button
                  v-if="item.config.editor.options.length > 0"
                  text
                  :icon="RefreshLeft"
                  @click="onResetFilter(item)"
                  class="control-btn"
                ></el-button>
                <el-button
                  text
                  :icon="Delete"
                  @click="onRemoveFilter(index)"
                  class="control-btn"
                ></el-button>
                <el-button
                  text
                  :icon="item.enable ? View : Hide"
                  @click="item.enable = !item.enable"
                  class="control-btn"
                ></el-button>
              </span>
            </div>
            <div class="editor" v-if="item.config.editor.options?.length > 0">
              <OptionsEditor
                :config="item.config"
                :setting="item.options"
                :unobtrusive="false"
              />
            </div>
          </div>
        </el-scrollbar>
        <div v-else class="filter-list no-filter">
          {{ $t("filterTool.noFilter") }}
        </div>
        <div class="footer">
          <el-button type="primary" @click="onSave" :disabled="!hasImage">{{
            $t("filterTool.save")
          }}</el-button>
        </div>
      </div>
      <!-- added filter list end -->
    </div>

    <el-drawer
      v-model="filtersListVisible"
      direction="rtl"
      custom-class="drawer-panel"
      modal-class="drawer-modal"
      :with-header="false"
      :size="300"
      @close="onPreviewFilter(null)"
    >
      <el-scrollbar class="all-filters">
        <div
          v-for="(item, index) in allFilters"
          :key="item.labelKey"
          class="all-filters-item"
          :class="{
            'is-group': item.isGroup,
            'is-child': item.isChild,
            'is-filter': item.isFilter,
            'is-added': item.isAdded,
            selected: item.filterKey === previewFilter,
          }"
          @click="onPreviewFilter(item)"
        >
          <span v-if="item.isFilter" class="has-options">
            <i v-if="item.hasOptions" class="iconfont icon-options"></i>
          </span>
          <span>{{ $t(item.labelKey) }}</span>
          <span v-if="item.isFilter" class="filter-add">
            <el-button
              v-if="!item.isAdded"
              size="small"
              :icon="Plus"
              @click.stop="onAddFilter(index)"
              class="add-btn"
            >
              {{ $t("filterTool.add") }}
            </el-button>
            <span v-else class="added-text">{{ $t("filterTool.added") }}</span>
          </span>
        </div>
      </el-scrollbar>
    </el-drawer>

    <el-dialog
      v-model="batchSetting.visible"
      :title="$t('filterTool.batch')"
      :close-on-click-modal="false"
      width="80%"
      custom-class="dialog"
      @open="batchSetting.batchFilesValue = ''"
    >
      <el-form label-width="auto" style="width: 100%">
        <el-form-item :label="$t('filterTool.batchFiles')">
          <div style="width: 100%">
            <FilePicker
              :options="{
                accept: openAccept,
                multiple: true,
              }"
              :rule="(value) => openAcceptRule.test(value)"
              :concat="true"
              :recursive="true"
              :placeholder="$t('filterTool.selectImages')"
              v-model="batchSetting.batchFilesValue"
              @change="onBatchFilesChange"
            />
          </div>
          <div class="description">
            {{
              $t("filterTool.batchFiles_desc", {
                count: batchSetting.batchFiles.length,
              })
            }}
          </div>
        </el-form-item>

        <el-form-item :label="$t('filterTool.outputFolder')">
          <div style="width: 100%">
            <FilePicker
              :options="{
                nwdirectorydescKey: 'filterTool.chooseOutputFolder',
                nwdirectory: true,
              }"
              v-model="batchSetting.outputFolder"
            />
          </div>
          <div class="description">
            {{ $t("filterTool.outputFolder_desc") }}
          </div>
        </el-form-item>

        <el-form-item :label="$t('filterTool.overwriteOutputFile')">
          <div style="width: 100%">
            <el-switch v-model="batchSetting.overwrite"></el-switch>
          </div>
          <div class="description">
            {{ $t("filterTool.overwriteOutputFile_desc") }}
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <!-- <el-button @click="batchSetting.visible = false">
            {{ $t("filterTool.cancel") }}
          </el-button> -->
          <el-button
            type="primary"
            @click="onBatch"
            :disabled="batchSetting.batchFiles.length === 0"
          >
            {{ $t("filterTool.start") }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import path from "path";
import fs from "fs-extra";
import clone from "clone";
import sharp from "sharp";
import { shallowRef } from "vue";
import { showOpenDialog, showSaveDialog } from "nwjs-dialog";
import {
  FolderOpened,
  Files,
  Plus,
  Top,
  Bottom,
  View,
  Hide,
  RefreshLeft,
  Delete,
} from "@element-plus/icons-vue";
import { getFrames, getImageInfo, sharpToFile } from "@/util/converter";
import {
  handleDropImages,
  openAccept,
  saveAccept,
  openAcceptRule,
  saveAcceptRule,
} from "@/util/imageFiles";
import { showError, showLoading } from "@/util/message";
import setting from "@/preset/setting";
import {
  getCurrentScreen,
  getSearches,
  humanFileSize,
  getOutputPath,
} from "@/util/util";
import ImageCanvas, { getPixels } from "@/component/ImageCanvas.vue";
import OptionsEditor from "@/component/OptionsEditor.vue";
import FilePicker from "@/component/FilePicker.vue";
import { filters, filterGroups } from "./filters";

const { scaleFactor } = getCurrentScreen();

const allFilters = [];
filterGroups.forEach((group) => {
  const filters = Object.values(group.filters);
  const isChild = filters.length > 1;
  if (isChild) {
    allFilters.push({
      labelKey: group.labelKey,
      isGroup: true,
    });
  }
  filters.forEach(({ labelKey, filterKey, options }) => {
    allFilters.push({
      labelKey,
      filterKey,
      isChild,
      isFilter: true,
      isAdded: false,
      hasOptions: options && options.length > 0,
    });
  });
});

function hasTransparent(pixels) {
  for (var i = 0, n = pixels.length; i < n; i += 4) {
    if (pixels[i + 3] < 255) return true;
  }
  return false;
}

let imgInfo, pixels;
let previewEl, canvas, timer;
let sx, sy, se;

export default {
  name: "FilterTool",
  components: { ImageCanvas, OptionsEditor, FilePicker },
  data() {
    return {
      FolderOpened: shallowRef(FolderOpened),
      Files: shallowRef(Files),
      Plus: shallowRef(Plus),
      Top: shallowRef(Top),
      Bottom: shallowRef(Bottom),
      View: shallowRef(View),
      Hide: shallowRef(Hide),
      RefreshLeft: shallowRef(RefreshLeft),
      Delete: shallowRef(Delete),
      hasImage: false,
      scaleFactor,
      canvas: {
        zoom: 0,
        fitZoom: 0,
        zoomed: false,
        ctxWidth: 0,
        ctxHeight: 0,
        width: 0,
        height: 0,
        letf: 0,
        top: 0,
      },
      filters: [],
      allFilters,
      filtersListVisible: false,
      previewFilter: null,
      openAccept,
      openAcceptRule,
      batchSetting: {
        visible: false,
        overwrite: setting.general.overwriteOutputFile,
        outputFolder: setting.general.outputFolder,
        batchFilesValue: "",
        batchFiles: [],
      },
    };
  },

  watch: {
    filters: {
      deep: true,
      handler() {
        this.draw();
      },
    },
  },

  methods: {
    onOpen() {
      showOpenDialog({ accept: openAccept }).then(([image]) => {
        this.loadImage(image);
      });
    },

    onBatchFilesChange(value) {
      this.batchSetting.batchFiles = value.length > 0 ? value.split("|") : [];
    },

    async onBatch() {
      this.batchSetting.visible = false;
      const { overwrite, outputFolder, batchFiles } = this.batchSetting;
      if (outputFolder && !fs.existsSync(outputFolder)) {
        showError(this.$t("filterTool.invalidOutputFolder"));
        return;
      }
      const loading = showLoading({
        lock: true,
        text: this.$t("filterTool.processing"),
      });
      for (let i = 0, total = batchFiles.length; i < total; i++) {
        const image = batchFiles[i];
        let fileOut = outputFolder
          ? path.join(outputFolder, path.basename(image))
          : image;
        if (!overwrite) fileOut = getOutputPath(fileOut);
        await this.saveImage(image, fileOut).catch((err) => console.warn(err));
        loading.setText(
          this.$t("filterTool.processing") + " " + `${i + 1} / ${total}`
        );
      }
      loading.close();
    },

    async loadImage(input) {
      imgInfo = await getImageInfo(input);
      imgInfo.input = input;
      pixels = await getPixels(input, imgInfo.width, imgInfo.height);

      this.hasImage = true;

      const { width, height } = imgInfo;
      Object.assign(this.canvas, {
        ctxWidth: width,
        ctxHeight: height,
        zoomed: false,
      });
      this.onResize();
      this.draw();
    },

    draw() {
      clearTimeout(timer);
      timer = setTimeout(() => this._draw(), 100);
    },
    _draw() {
      if (pixels) {
        let _pixels = Uint8ClampedArray.from(pixels);
        const { width, height } = imgInfo;
        _pixels = this.applyFilters(_pixels, width, height);
        canvas.drawPixels(_pixels, width, height);
      }
    },
    applyFilters(pixels, width, height) {
      const added = this.filters.concat([]);
      const filterKey = this.previewFilter;
      if (filterKey) {
        const filter = added.find((item) => item.filterKey === filterKey);
        if (!filter) {
          added.push({
            filterKey,
            enable: true,
            options: filters[filterKey].defaultSetting,
          });
        }
      }
      for (let item of added) {
        if (!item.enable) continue;
        pixels = filters[item.filterKey].handler(
          { data: pixels, width, height },
          item.options
        );
      }
      return pixels;
    },

    onPreviewFilter(item) {
      if (item) {
        if (item.isFilter) {
          this.previewFilter = item.filterKey;
          this.draw();
        }
      } else {
        this.previewFilter = null;
        this.draw();
      }
    },
    onAddFilter(index) {
      this.allFilters[index].isAdded = true;
      const { filterKey } = this.allFilters[index];
      const filter = {
        index,
        filterKey,
        enable: true,
        config: {
          type: `filters.${filterKey}`,
          editor: {
            options: filters[filterKey].options || [],
          },
        },
        options: clone(filters[filterKey].defaultSetting),
      };
      this.filters.push(filter);
      // this.filtersListVisible = false;
    },
    onRemoveFilter(index) {
      this.allFilters[this.filters[index].index].isAdded = false;
      this.filters.splice(index, 1);
    },
    onMoveFilter(index, direction) {
      const item = this.filters[index + direction];
      this.filters[index + direction] = this.filters[index];
      this.filters[index] = item;
      // this.draw();
    },

    onResetFilter(filter) {
      filter.options = clone(filters[filter.filterKey].defaultSetting);
    },

    setZoom(zoom, zoomed = true) {
      if (!imgInfo) return;
      const { width: iw, height: ih } = imgInfo;
      const { offsetWidth: ow, offsetHeight: oh } = previewEl;
      const { width: cw, height: ch, left: cl, top: ct } = this.canvas;
      const width = Math.round(iw * zoom);
      const height = Math.round(ih * zoom);
      let left, top;
      if (width <= ow) {
        left = Math.round((ow - width) * 0.5);
      } else {
        left = ow * 0.5 - ((ow * 0.5 - Math.min(0, cl)) / cw) * width;
        if (left > 0) left = 0;
        if (left < ow - width) left = ow - width;
      }
      if (height <= oh) {
        top = Math.round((oh - height) * 0.5);
      } else {
        top = oh * 0.5 - ((oh * 0.5 - Math.min(0, ct)) / ch) * height;
        if (top > 0) top = 0;
        if (top < oh - height) top = oh - height;
      }
      Object.assign(this.canvas, {
        zoom,
        zoomed,
        width,
        height,
        left,
        top,
      });
      this.updateTitle();
    },

    onStartMove($event) {
      if (this.canvas.zoom <= this.canvas.fitZoom) return;
      se = $event;
      sx = this.canvas.left;
      sy = this.canvas.top;
      window.addEventListener("mousemove", this.onMove);
      window.addEventListener("mouseup", this.onStopMove);
    },
    onMove($event) {
      const { offsetWidth, offsetHeight } = previewEl;
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

    onResize() {
      if (!imgInfo) return;
      const { width, height } = imgInfo;
      const { offsetWidth, offsetHeight } = previewEl;
      let zoom = Math.min(offsetWidth / width, offsetHeight / height);
      this.canvas.fitZoom = zoom;
      if (!this.canvas.zoomed) {
        if (zoom * scaleFactor > 1) zoom = 1 / scaleFactor;
        this.canvas.zoom = zoom;
      }
      this.setZoom(this.canvas.zoom, this.canvas.zoomed);
    },

    onSave() {
      return showSaveDialog({
        nwworkingdir: imgInfo.dirname,
        nwsaveas: imgInfo.filename,
        accept: saveAccept,
      }).then(async ([filePath]) => {
        if (!saveAcceptRule.test(filePath)) filePath += `.${imgInfo.ext}`;
        const loading = showLoading({
          lock: true,
          text: this.$t("filterTool.saving"),
        });
        this.saveImage(imgInfo.input, filePath, ({ total, encoded }) => {
          loading.setText(
            this.$t("filterTool.saving") + " " + `${encoded} / ${total}`
          );
        })
          .then(() => loading.close())
          .catch((err) => {
            loading.close();
            showError(err);
            console.warn(err);
          });
      });
    },

    async saveImage(input, fileOut, progress) {
      const { width, height, pages } = await getImageInfo(input);
      if (pages > 1) {
        let { frames, sizes, ...options } = await getFrames(input);
        let transparent = false;
        frames = await Promise.all(
          frames.map(async (frame, index) => {
            const { buffer } = await frame.ensureAlpha().raw().toBuffer();
            let pixels = new Uint8ClampedArray(buffer);
            const { width: w, height: h } = sizes
              ? sizes[index]
              : { width, height };
            pixels = this.applyFilters(pixels, w, h);
            transparent = transparent || hasTransparent(pixels);
            return sharp(pixels, {
              raw: { width: w, height: h, channels: 4 },
            }).png();
          })
        );
        return sharpToFile(
          { frames },
          fileOut,
          { transparent, ...options },
          progress
        );
      } else {
        let pixels = await getPixels(input, width, height);
        pixels = this.applyFilters(pixels, width, height);
        const image = sharp(pixels, {
          raw: { width, height, channels: 4 },
        });
        return sharpToFile({ image }, fileOut);
      }
    },

    updateTitle() {
      if (!imgInfo) return;
      const { filename, width, height, size, pages } = imgInfo;
      let info = `${width} × ${height} = ${humanFileSize(size)}`;
      if (pages > 1) info += `, ${pages} ` + this.$t("filterTool.frames");
      const _zoom = Math.round(this.canvas.zoom * 100 * scaleFactor) + "%";
      document.title =
        this.$t("filterTool.title") + ` - ${filename} (${info}) ${_zoom}`;
    },
  },

  async mounted() {
    this.$i18n.locale = getSearches().locale;
    this.updateTitle();

    previewEl = this.$refs.preview;
    canvas = this.$refs.canvas;

    window.addEventListener("resize", this.onResize);

    handleDropImages(([image]) => {
      if (image) this.loadImage(image.path);
    });

    window.addEventListener("contextmenu", (e) => {
      if (e.target.tagName !== "INPUT") {
        e.preventDefault();
        return false;
      }
    });
  },
};
</script>

<style>
* {
  -webkit-user-drag: none;
  user-select: none;
}
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
}
.window {
  width: calc(100vw - 20px);
  height: calc(100vh - 20px);
  background-color: #f2f3f5;
  overflow: hidden;
  padding: 10px;
  display: flex;
  flex-flow: column;
}

.icon-btn {
  padding: 0 10px;
}
.iconfont + span {
  margin-left: 5px;
}
.filter-control {
  float: right;
}

.body {
  margin-top: 10px;
  flex: auto;
  display: flex;
  overflow: hidden;
}

.preview {
  flex: auto;
  background-color: #cdd0d6;
  border: 1px solid #a8abb2;
  position: relative;
  overflow: hidden;
  /* display: flex;
  align-items: center;
  justify-content: center; */
}
.preview canvas {
  position: absolute;
}

.zoom-tool {
  z-index: 100;
  padding: 8px 4px;
  position: absolute;
  left: 4px;
  bottom: 4px;
  opacity: 0.3;
  transition: 0.1s;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}
.zoom-tool:hover {
  opacity: 1;
}
.zoom-tool .icon-btn:hover {
  color: #649cfa;
}

.added-filters {
  width: 300px;
  margin-left: 10px;
  display: flex;
  flex-flow: column;
}
.filter-list {
  flex: auto;
}
.filter-item {
  border-radius: 4px;
  overflow: hidden;
  transition: 0.1s;
}
.filter-item.disabled {
  opacity: 0.3;
}
.filter-item + .filter-item {
  margin-top: 10px;
}
.filter-item-title {
  padding: 10px;
  background-color: #cdd0d6;
  font-size: 14px;
  font-weight: bold;
}
.filter-item-control {
  float: right;
}
.control-btn {
  padding: 4px;
  height: initial;
}
.control-btn + .control-btn {
  margin-left: 4px;
}

.editor {
  padding: 10px;
  background-color: #ffffff;
  overflow: hidden;
}
.filter-item.disabled .editor {
  pointer-events: none;
}
.el-form {
  width: 260px;
  height: auto !important;
  display: flex;
  flex-flow: column;
}
.el-form-item {
  flex: auto;
}

.drawer-panel {
  border-left: var(--border);
}
.drawer-modal {
  background-color: rgba(0, 0, 0, 0.0001);
}
.el-drawer__body {
  padding: 20px 0;
}
.all-filters-item {
  padding: 8px 20px;
  font-size: 14px;
  position: relative;
}
.is-group {
  font-weight: bold;
}
.all-filters-item + .is-group {
  margin-top: 20px;
}
/* .is-child {
  padding-left: 40px;
} */
.is-filter:hover {
  background: #f6f7fa;
  cursor: pointer;
}
.is-added {
  opacity: 0.3;
  pointer-events: none;
}
.is-filter.selected {
  background: #ecedf0;
}
.has-options {
  display: inline-block;
  width: 30px;
}
.filter-add {
  position: absolute;
  right: 5px;
  top: 5px;
}
.add-btn {
  display: none;
}
.is-filter:hover .add-btn,
.is-filter.selected .add-btn {
  display: inline-block;
}
.added-text {
  font-size: 12px;
  padding: 6px 12px;
  line-height: 24px;
}

.footer {
  margin-top: 10px;
  text-align: right;
}

.no-image {
  font-size: 14px;
  color: #606266;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.no-filter {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #606266;
  outline: 1px solid #a8abb2;
  outline-offset: -1px;
}

.dialog {
  max-width: 800px;
}
.el-dialog__body {
  padding: 10px 20px 0px;
}
.description {
  color: #909399;
  line-height: 24px;
  word-break: break-word;
}
</style>
