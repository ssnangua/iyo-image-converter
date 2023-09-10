<template>
  <div class="generator">
    <el-divider>{{ $t("icoTool.icoGenerator") }}</el-divider>

    <IconList
      :iconList="iconList"
      :selectedIndex="selectedIndex"
      :emptyText="$t('icoTool.generatorEmptyText')"
      @list-contextmenu="showIconMenu"
      @item-contextmenu="showIconMenu"
      @item-click="selectIcon($event)"
    />

    <div class="options">
      <el-form label-width="auto" class="generator-form">
        <el-form-item
          :label="$t('icoTool.borderRadius')"
          :class="{ disabled: !selectedIcon }"
        >
          <el-slider
            v-model="setting.borderRadius"
            :step="1"
            :min="0"
            :max="100"
            :format-tooltip="percentFormat"
            style="margin: 0 5px"
          />
        </el-form-item>

        <el-form-item
          :label="$t('icoTool.iconMargin')"
          :class="{ disabled: !selectedIcon }"
        >
          <el-slider
            v-model="setting.iconMargin"
            :step="1"
            :min="0"
            :max="(selectedIcon && selectedIcon.size / 2) || 128"
            style="margin: 0 5px"
          />
        </el-form-item>

        <el-form-item
          :label="$t('icoTool.imageZoom')"
          :class="{ disabled: !selectedIcon }"
        >
          <el-slider
            v-model="setting.imageZoom"
            :step="1"
            :min="-99"
            :max="99"
            :format-tooltip="percentFormat"
            style="margin: 0 5px"
          />
        </el-form-item>

        <el-form-item
          :label="$t('icoTool.offsetX')"
          :class="{ disabled: !selectedIcon }"
        >
          <el-slider
            v-model="setting.offsetX"
            :step="1"
            :min="-99"
            :max="99"
            :format-tooltip="percentFormat"
            style="margin: 0 5px"
          />
        </el-form-item>

        <el-form-item
          :label="$t('icoTool.offsetY')"
          :class="{ disabled: !selectedIcon }"
        >
          <el-slider
            v-model="setting.offsetY"
            :step="1"
            :min="-99"
            :max="99"
            :format-tooltip="percentFormat"
            style="margin: 0 5px"
          />
        </el-form-item>

        <el-form-item
          :label="$t('icoTool.fit')"
          :class="{ disabled: !selectedIcon }"
        >
          <FitPicker v-model="setting.fit" :forceSize="true" />
        </el-form-item>

        <el-form-item
          :label="$t('icoTool.kernel')"
          :class="{ disabled: !selectedIcon }"
        >
          <el-select v-model="setting.kernel" placeholder=" ">
            <el-option
              v-for="option in kernelOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="preview-wrapper">
        <div style="flex: auto; width: 100%; text-align: left">
          <el-button :disabled="!selectedIcon" @click="resetOption">{{
            $t("icoTool.reset")
          }}</el-button>
        </div>

        <div
          v-if="curIcon"
          class="icon-size size-select"
          @click="showIconSizesMenu"
          style="margin-bottom: 5px"
        >
          {{ curIcon.size + " × " + curIcon.size }}
          <i class="iconfont icon-expand"></i>
        </div>
        <div class="preview" :class="{ showbg: !!curIcon }">
          <img
            v-if="curIcon"
            :src="curIcon.base64"
            class="preview-icon"
            :style="{
              width: curIcon.size + 'px',
              height: curIcon.size + 'px',
            }"
          />
        </div>
        <div style="margin: 20px 0 10px; width: 100%; text-align: right">
          <el-button
            :disabled="!selectedIcon"
            type="primary"
            @click="exportDialog = true"
          >
            {{ $t("icoTool.export") }}
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="exportDialog"
      :title="$t('icoTool.extractSizes')"
      :width="400"
      class="extract-dialog"
    >
      <div>
        <el-checkbox-group v-model="extractSizes">
          <el-checkbox
            v-for="option in extractSizesOptions"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="extract-dialog-footer">
        <div class="extract-dialog-toolbar">
          <el-link :underline="false" @click="setExtractSizes('all')">
            {{ $t("icoTool.selectAll") }}
          </el-link>
          <el-link :underline="false" @click="setExtractSizes('clear')">
            {{ $t("icoTool.unselectAll") }}
          </el-link>
          <el-link :underline="false" @click="setExtractSizes('default')">
            {{ $t("icoTool.selectDefault") }}
          </el-link>
        </div>
        <el-button type="primary" @click="extract">
          {{ $t("icoTool.export") }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from "path";
import sharp from "sharp";
import BMP from "sharp-bmp";
import { fileTypeFromFile } from "file-type";
import { showSaveDialog, showOpenDialog } from "nwjs-dialog";
import { openAccept, openAcceptRule } from "@/util/imageFiles";
import { sharpToBase64 } from "@/util/converter";
import { showLoading, showSuccess, showError } from "@/util/message";
import FitPicker from "@/component/FitPicker.vue";
import {
  defaultSetting,
  getIconSize,
  getIcons,
  processIcon,
  sharpsToIco,
} from "./util";
import IconList from "./IconList.vue";
import {
  gIconMenu,
  gListMenu,
  gListMenuNoData,
  gIconSizesMenu,
  iconSizesItems,
} from "./contextmenu";

const allExtractSizes = iconSizesItems.map((size) => size.value);
const defExtractSizes = [16, 24, 32, 48, 64, 72, 96, 128, 256];

let icons = [];

export default {
  name: "IcoGenerator",

  components: { IconList, FitPicker },

  data() {
    return {
      iconList: [],
      selectedIndex: -1,
      selectedIcon: null,
      curIcon: null,

      kernelOptions: [
        { label: "nearest", value: "nearest" },
        { label: "cubic", value: "cubic" },
        { label: "mitchell", value: "mitchell" },
        { label: "lanczos2", value: "lanczos2" },
        { label: "lanczos3", value: "lanczos3" },
      ],
      percentFormat: (value) => `${value}%`,
      setting: { size: 0, ...defaultSetting },

      exportDialog: false,
      extractSizesOptions: iconSizesItems,
      extractSizes: [...defExtractSizes],
    };
  },

  watch: {
    setting: {
      deep: true,
      handler(setting) {
        if (this.selectedIcon) {
          Object.assign(this.selectedIcon, setting);
          this.selectIcon(this.selectedIndex);
        }
      },
    },
  },

  methods: {
    async handleDropFiles(files) {
      for (let { path: filePath } of files) {
        if (openAcceptRule.test(filePath)) {
          const name = path.parse(filePath).name;
          const { ext } = await fileTypeFromFile(filePath);
          if (ext === "ico") {
            const _icons = await getIcons(filePath, this);
            if (_icons) {
              icons.push(..._icons.images);
              this.iconList.push(..._icons.icons);
            }
          } else {
            const image =
              ext === "bmp" ? BMP.sharpFromBmp(filePath) : sharp(filePath);
            const { width, height } = await image.metadata();
            const size = getIconSize(width, height);
            const base64 = await sharpToBase64(image);
            const icon = {
              ...defaultSetting,
              name,
              width,
              height,
              size,
              base64,
            };
            icons.push(image);
            this.iconList.push(icon);
          }
        }
      }
      if (!this.selectedIcon) {
        this.selectIcon(0);
      }
    },

    async selectIcon(index) {
      const icon = this.iconList[index];
      if (!icon) return;
      this.selectedIndex = index;
      this.selectedIcon = icon;
      let {
        size,
        imageZoom,
        iconMargin,
        borderRadius,
        offsetX,
        offsetY,
        fit,
        kernel,
      } = icon;
      Object.assign(this.setting, {
        size,
        imageZoom,
        iconMargin,
        borderRadius,
        offsetX,
        offsetY,
        fit,
        kernel,
      });

      const image = icons[index];
      const result = await processIcon(icon, image);
      const base64 = await sharpToBase64(result);
      this.curIcon = { size, base64 };
    },

    showIconMenu(e, index) {
      if (typeof index === "number") {
        this.selectIcon(index);
        gIconMenu.popup(e, this.iconMenuCallback, null, index);
      } else if (this.iconList.length > 0) {
        gListMenu.popup(e, this.iconMenuCallback);
      } else {
        gListMenuNoData.popup(e, this.iconMenuCallback);
      }
    },
    iconMenuCallback({ value }, index) {
      if (value === "delete") {
        this.iconList.splice(index, 1);
        icons.splice(index, 1);
        if (icons.length > 0) {
          this.selectIcon(Math.min(index, icons.length - 1));
        } else {
          this.selectedIndex = -1;
          this.selectedIcon = null;
          this.curIcon = null;
          this.setting = { size: 0, ...defaultSetting };
        }
      } else if (value === "deleteAll") {
        this.iconList = [];
        icons = [];
        this.selectedIndex = -1;
        this.selectedIcon = null;
        this.curIcon = null;
        this.setting = { size: 0, ...defaultSetting };
      } else if (value === "openImages") {
        showOpenDialog({
          multiple: true,
          accept: openAccept,
          returnFormat: "file",
        }).then((imageFiles) => {
          this.handleDropFiles(imageFiles);
        });
      }
    },

    showIconSizesMenu(e) {
      gIconSizesMenu.popup(e, this.iconSizesMenuCallback);
    },
    iconSizesMenuCallback({ value }) {
      this.setting.size = value;
    },

    resetOption() {
      Object.assign(this.selectedIcon, defaultSetting);
      this.selectIcon(this.selectedIndex);
    },

    setExtractSizes(type) {
      if (type === "all") {
        this.extractSizes = [...allExtractSizes];
      } else if (type === "clear") {
        this.extractSizes = [];
      } else if (type === "default") {
        this.extractSizes = [...defExtractSizes];
      }
    },

    extract() {
      const icon = this.iconList[0];
      showSaveDialog({
        nwsaveas: `${icon.name}.ico`,
        accept: "*.ico",
      }).then(async ([filePath]) => {
        if (!filePath) filePath = `${icon.name}.ico`;
        if (!/\.ico$/i.test(filePath)) filePath += ".ico";

        const loading = showLoading({
          lock: true,
          text: this.$t("icoTool.extracting"),
        });
        const _icons = [];
        const _sizeMap = {};
        for (let i = 0; i < icons.length; i++) {
          const icon = this.iconList[i];
          const image = icons[i];
          _icons.push({
            icon,
            image,
            processed: await processIcon(icon, image),
          });
          _sizeMap[icon.size] = true;
        }
        _icons.sort((a, b) => a.icon.size - b.icon.size);
        const { extractSizes } = this;
        for (let size of extractSizes) {
          if (!_sizeMap[size]) {
            const { icon, image } =
              _icons.find(({ icon }) => icon && icon.size > size) ||
              _icons[_icons.length - 1];
            _icons.push({
              processed: await processIcon(
                {
                  ...icon,
                  size,
                  iconMargin: Math.floor((icon.iconMargin * size) / icon.size),
                },
                image
              ),
            });
          }
        }
        _icons.sort((a, b) => b.size - a.size);
        await sharpsToIco(
          _icons.map(({ processed }) => processed),
          filePath
        )
          .then(() => {
            showSuccess(this.$t("icoTool.exportSuccess"));
          })
          .catch((err) => {
            showError(this.$t("icoTool.exportError"), err);
          });
        loading.close();
        this.exportDialog = false;
      });
    },
  },

  created() {
    window.addEventListener("keyup", (event) => {
      if (icons.length === 0) return;
      const isCtrl = event.ctrlKey || event.metaKey;
      switch (event.code) {
        case "ArrowLeft":
          this.selectIcon(isCtrl ? 0 : Math.max(0, this.selectedIndex - 1));
          break;
        case "ArrowRight":
          this.selectIcon(
            isCtrl
              ? icons.length - 1
              : Math.min(icons.length - 1, this.selectedIndex + 1)
          );
          break;
        case "Delete":
          this.iconMenuCallback({ value: "delete" }, this.selectedIndex);
          break;
      }
    });
  },
};
</script>

<style>
.generator {
  position: absolute;
  top: 10px;
  left: calc(100vw + 20px);
  width: calc(100vw - 40px);
  height: calc(100vh - 20px);
  transition: 0.3s;
  display: flex;
  flex-flow: column;
}
.options {
  display: flex;
  margin-top: 20px;
  flex: auto;
}
.generator-form {
  flex: auto;
}
.generator-form .el-form-item {
  margin-bottom: 8px;
}
.generator-form .disabled {
  opacity: 0.5;
  pointer-events: none;
  filter: grayscale(1);
}

.el-checkbox {
  margin-right: 10px;
}
.el-checkbox__label {
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-scrollbar__view {
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: flex-end;
}

.preview-wrapper {
  margin-left: 20px;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: flex-end;
}
.preview {
  width: 128px;
  height: 128px;
  border: var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview.showbg {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC);
  image-rendering: pixelated;
}
.preview-icon {
  max-width: 128px;
  max-height: 128px;
  image-rendering: initial;
  outline: 1px dashed #000000;
}

.size-select {
  display: inline-flex;
  color: var(--text-color);
  border: 1px solid rgba(0, 0, 0, 0);
  align-items: center;
  justify-content: center;
  padding: 5px;
  transition: 0.1s;
}
.size-select:hover {
  background-color: var(--bg-hover);
}
.size-select:active {
  background-color: var(--bg-active);
}

.extract-dialog .el-dialog__body {
  padding: 10px 20px 20px;
}
.extract-dialog-footer {
  margin-top: 20px;
  text-align: right;
}
.extract-dialog-toolbar {
  line-height: 32px;
  float: left;
}
.extract-dialog-toolbar .el-link + .el-link {
  margin-left: 10px;
}
</style>
