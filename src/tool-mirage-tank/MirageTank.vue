<template>
  <div class="window">
    <div>
      <OptionsEditor
        v-if="config"
        :config="config"
        :setting="setting"
        :unobtrusive="false"
      />
      <div class="options">
        <div class="option-item">
          <div class="option-label">{{ $t("mirageTank.fAlpha") }}</div>
          <div class="option-value">
            <el-slider
              v-model="setting.fAlpha"
              :step="0.01"
              :min="0"
              :max="1"
            />
          </div>
        </div>
        <div class="option-item">
          <div class="option-label">{{ $t("mirageTank.bAlpha") }}</div>
          <div class="option-value">
            <el-slider
              v-model="setting.bAlpha"
              :step="0.01"
              :min="0"
              :max="1"
            />
          </div>
        </div>
        <div class="option-item">
          <div class="option-label">{{ $t("mirageTank.bBrightness") }}</div>
          <div class="option-value">
            <el-slider
              v-model="setting.bBrightness"
              :step="0.01"
              :min="0"
              :max="1"
            />
          </div>
        </div>
      </div>
      <div class="toolbar">
        <el-button @click="onSwapImages">{{
          $t("mirageTank.swapImages")
        }}</el-button>
        <el-button @click="onResetOptions">{{
          $t("mirageTank.resetOptions")
        }}</el-button>
        <el-button
          style="float: right"
          type="primary"
          :disabled="!setting.fImg || !setting.bImg"
          @click="onSave"
          >{{ $t("mirageTank.save") }}</el-button
        >
      </div>
    </div>

    <div ref="preview" class="preview">
      <div class="canvas-box white-canvas">
        <ImageCanvas
          ref="whiteCanvas"
          :style="{
            width: canvas.width + 'px',
            height: canvas.height + 'px',
          }"
        />
      </div>
      <div class="canvas-box black-canvas">
        <ImageCanvas
          ref="blackCanvas"
          :style="{
            width: canvas.width + 'px',
            height: canvas.height + 'px',
          }"
        />
      </div>
    </div>
  </div>
</template>

<script>
import sharp from "sharp";
import { shallowRef } from "vue";
import { MoreFilled, Close } from "@element-plus/icons-vue";
import { showSaveDialog } from "nwjs-dialog";
import { getImageInfo, getFrames } from "@/util/converter";
import { getSearches } from "@/util/util";
import { openAccept, openAcceptRule } from "@/util/imageFiles";
import { showError, showLoading } from "@/util/message";
import OptionsEditor from "@/component/OptionsEditor.vue";
import ImageCanvas from "@/component/ImageCanvas.vue";
import { mirageTank } from "./util";

let wCvs, bCvs;
const fImg = { path: "", name: "", width: 0, height: 0, pixels: null };
const bImg = { path: "", name: "", width: 0, height: 0, pixels: null };
const imgInfo = { width: 0, height: 0, pixels: null };
let timer;

async function getPixels(input, width, height) {
  let image = (await getFrames(input)).frames[0];
  const meta = await image.metadata();
  if (meta.width !== width || meta.height !== height) {
    image.png().resize({
      width,
      height,
      fit: "contain",
      background: "#FFFFFF",
    });
    image = sharp(await image.toBuffer());
  }
  const buffer = await image.ensureAlpha().raw().toBuffer();
  return new Uint8ClampedArray(buffer.buffer);
}

export default {
  name: "MirageTank",
  components: { OptionsEditor, ImageCanvas },
  data() {
    return {
      MoreFilled: shallowRef(MoreFilled),
      Close: shallowRef(Close),
      config: {
        type: "mirageTank",
        editor: {
          options: [
            {
              key: "fImg",
              type: "file",
              placeholder: "placeholder",
              dialog: {
                accept: openAccept,
              },
              rule: (value) => openAcceptRule.test(value),
            },
            {
              key: "bImg",
              type: "file",
              placeholder: "placeholder",
              dialog: {
                accept: openAccept,
              },
              rule: (value) => openAcceptRule.test(value),
            },
          ],
        },
      },
      setting: {
        fImg: "",
        bImg: "",
        fAlpha: 0.5,
        bAlpha: 0.5,
        bBrightness: 0.5,
      },
      canvas: {
        width: 0,
        height: 0,
      },
    };
  },

  watch: {
    setting: {
      deep: true,
      async handler(setting) {
        if (fImg.path !== setting.fImg || bImg.path !== setting.bImg) {
          await this.updateImg();
        }
        this.draw();
      },
    },
  },

  methods: {
    async updateImg() {
      const { setting } = this;

      if (fImg.path !== setting.fImg) {
        if (setting.fImg) {
          const { width, height, name } = await getImageInfo(setting.fImg);
          Object.assign(fImg, { path: setting.fImg, name, width, height });
        } else {
          Object.assign(fImg, { path: "", width: 0, height: 0, pixels: null });
        }
      }
      if (bImg.path !== setting.bImg) {
        if (setting.bImg) {
          const { width, height, name } = await getImageInfo(setting.bImg);
          Object.assign(bImg, { path: setting.bImg, name, width, height });
        } else {
          Object.assign(bImg, { path: "", width: 0, height: 0, pixels: null });
        }
      }

      const iw = Math.max(fImg.width || 0, bImg.width || 0);
      const ih = Math.max(fImg.height || 0, bImg.height || 0);
      Object.assign(imgInfo, { width: iw, height: ih });

      if (fImg.path) fImg.pixels = await getPixels(fImg.path, iw, ih);
      if (bImg.path) bImg.pixels = await getPixels(bImg.path, iw, ih);

      wCvs.setCanvasSize(iw, ih);
      bCvs.setCanvasSize(iw, ih);

      this.updateCanvasEl();
      this.updateTitle();
    },

    draw() {
      if (!imgInfo.width) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const { width, height } = imgInfo;
        const { pixels: fdata } = fImg;
        const { pixels: bdata } = bImg;
        const pixels = mirageTank(fdata || bdata, bdata || fdata, this.setting);
        imgInfo.pixels = pixels;
        wCvs.drawPixels(pixels, width, height);
        bCvs.drawPixels(pixels, width, height);
      }, 100);
    },

    updateTitle() {
      if (!imgInfo.width) return;
      const { width, height } = imgInfo;
      document.title = this.$t("mirageTank.title") + ` - ${width} × ${height}`;
    },

    updateCanvasEl() {
      if (!imgInfo.width) return;
      const { offsetWidth, offsetHeight: ch } = this.$refs.preview;
      const { width: iw, height: ih } = imgInfo;
      const cw = (offsetWidth - 10) * 0.5;
      const scale = Math.min(cw / iw, ch / ih);
      Object.assign(this.canvas, {
        width: Math.round(iw * scale),
        height: Math.round(ih * scale),
      });
    },

    onSwapImages() {
      const { fImg, bImg } = this.setting;
      Object.assign(this.setting, { fImg: bImg, bImg: fImg });
    },

    onResetOptions() {
      Object.assign(this.setting, {
        fAlpha: 0.5,
        bAlpha: 0.5,
        bBrightness: 0.5,
      });
    },

    onSave() {
      showSaveDialog({
        nwworkingdir: imgInfo.dirname,
        nwsaveas: `${fImg.name}_${bImg.name}.png`,
        accept: ".png",
      }).then(async ([filePath]) => {
        if (!/\.png$/i.test(filePath)) filePath += ".png";
        const loading = showLoading({
          lock: true,
          text: this.$t("mirageTank.processing"),
        });
        const { pixels, width, height } = imgInfo;
        sharp(pixels, { raw: { width, height, channels: 4 } })
          .png()
          .toFile(filePath)
          .then(() => {
            loading.close();
          })
          .catch((err) => {
            loading.close();
            showError(err);
          });
      });
    },
  },

  async mounted() {
    wCvs = this.$refs.whiteCanvas;
    bCvs = this.$refs.blackCanvas;

    this.$i18n.locale = getSearches().locale;
    this.updateTitle();

    window.addEventListener("resize", this.updateCanvasEl);
    this.updateCanvasEl();

    const preventDefault = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    window.addEventListener("contextmenu", preventDefault);
    window.addEventListener("dragenter", preventDefault);
    window.addEventListener("dragover", preventDefault);
    window.addEventListener("dragleave", preventDefault);
    window.addEventListener("drop", preventDefault);
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

.el-form-item {
  margin-bottom: 10px;
}

.el-slider__marks-text {
  background: #f2f3f5 !important;
}

.options {
  display: flex;
  height: 66px;
}
.option-item {
  flex: auto;
  white-space: nowrap;
  overflow: hidden;
}
.option-item + .option-item {
  margin-left: 20px;
}
.option-label {
  line-height: 32px;
  color: #606266;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.option-value {
  padding: 0 12px;
  display: flex;
}

.toolbar {
  margin-top: 10px;
}

.preview {
  flex: auto;
  display: flex;
  flex-flow: row;
  margin-top: 10px;
}
.canvas-box {
  width: calc(50vw - 15px);
  background-color: #cdd0d6;
  outline: 1px solid #a8abb2;
  position: relative;
  overflow: hidden;
}
.canvas-box + .canvas-box {
  margin-left: 10px;
}
.canvas-box > canvas {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.white-canvas {
  background-color: #ffffff;
}
.black-canvas {
  background-color: #000000;
}
</style>
