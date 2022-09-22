<template>
  <div class="viewer">
    <el-form label-width="auto">
      <el-divider>{{ $t("icoTool.icoExtractor") }}</el-divider>

      <el-form-item :label="$t('icoTool.sourceFile')">
        <FilePicker
          v-model="filePath"
          :options="{
            accept: '.exe,.dll,.ocx,.cpl,.lnk',
          }"
          :handleOpen="handleOpenFilePath"
          :placeholder="$t('icoTool.selectSourceFile')"
          v-loading="loadingLnk"
        />
      </el-form-item>

      <el-form-item :label="$t('icoTool.outputFolder')">
        <FilePicker
          v-model="outputFolder"
          :options="{
            nwdirectorydescKey: 'icoTool.chooseOutputFolder',
            nwdirectory: true,
          }"
          :placeholder="$t('icoTool.selectOutputFolder')"
        />
      </el-form-item>

      <div class="toolbar">
        <div style="float: left">
          <el-checkbox
            v-model="newFolder"
            :label="$t('icoTool.newFolder')"
            :title="$t('icoTool.newFolder')"
          />
          <!-- <el-checkbox
            v-model="extractCursors"
            :label="$t('icoTool.extractCursors')"
            :title="$t('icoTool.extractCursors')"
          />
          <el-checkbox
            v-if="extractCursors"
            v-model="asIco"
            :label="$t('icoTool.asIco')"
            :title="$t('icoTool.asIcoTip')"
          /> -->
        </div>
        <el-button
          link
          :icon="FolderOpened"
          :disabled="!outputFolder"
          @click="openOutputFolder"
          >{{ $t("icoTool.openOutputFolder") }}</el-button
        >
        <el-button
          type="primary"
          :disabled="!extractable"
          @click="extractIco"
          >{{ $t("icoTool.extract") }}</el-button
        >
      </div>

      <el-divider style="margin-top: 40px">{{
        $t("icoTool.icoViewer")
      }}</el-divider>

      <el-form-item :label="$t('icoTool.icoFile')">
        <FilePicker
          v-model="icoPath"
          :options="{
            accept: '.ico',
          }"
          :handleOpen="handleOpenIcoPath"
          :placeholder="$t('icoTool.selectIcoFile')"
        />
      </el-form-item>

      <div class="toolbar">
        <div v-if="iconList.length > 0" class="tip">
          {{ $t("icoTool.saveTip") }}
        </div>
        <el-button
          type="primary"
          :disabled="!checkable"
          @click="checkIco(icoPath)"
          >{{ $t("icoTool.check") }}</el-button
        >
      </div>
    </el-form>

    <IconList
      :iconList="iconList"
      :selectedIndex="selectedIndex"
      :emptyText="$t('icoTool.viewerEmptyText')"
      @list-contextmenu="showIconMenu"
      @item-contextmenu="showIconMenu"
      @item-click="selectedIndex = $event"
      style="margin-top: 20px"
    />
  </div>
</template>

<script>
import path from "path";
import fs from "fs";
import { shallowRef } from "vue";
import { FolderOpened } from "@element-plus/icons-vue";
import { showOpenDialog, showSaveDialog } from "nwjs-dialog";
import FilePicker from "@/component/FilePicker.vue";
import IconList from "@/icotool/IconList.vue";
import Contextmenu from "@/contextmenu/contextmenu";
import { viewerListMenu, viewerIconMenu } from "@/contextmenu/icoTool";
import { saveAccept, saveAcceptRule } from "@/util/imageFiles";
import { runIconsext, getShortcutTarget } from "@/util/shell";
import { showLoading, showSuccess, showError } from "@/util/message";
import { sharpToFile } from "@/util/converter";
import {
  lnkRule,
  exeRule,
  icoRule,
  isValidSourceFile,
  isValidFolder,
  getIcons,
} from "./util";

const iconMenu = new Contextmenu(viewerIconMenu);
const listMenu = new Contextmenu(viewerListMenu);

let icons = [];

export default {
  name: "IcoViewer",
  components: { IconList, FilePicker },

  data() {
    return {
      FolderOpened: shallowRef(FolderOpened),

      newFolder: true,
      extractCursors: false,
      asIco: false,
      filePath: "",
      loadingLnk: false,
      outputFolder: "",
      icoPath: "",

      iconList: [],
      selectedIndex: -1,
    };
  },

  computed: {
    extractable() {
      return this.filePath && this.outputFolder && exeRule.test(this.filePath);
    },
    checkable() {
      return this.icoPath && icoRule.test(this.icoPath);
    },
  },

  methods: {
    async handleDropFiles(files) {
      let [{ path: filePath }] = files;
      if (fs.statSync(filePath).isFile()) {
        if (lnkRule.test(filePath)) {
          this.loadingLnk = true;
          await getShortcutTarget(filePath)
            .then((actualPath) => (filePath = actualPath))
            .catch((err) => console.warn(err));
          this.loadingLnk = false;
        }
        if (exeRule.test(filePath)) {
          this.filePath = filePath;
        } else if (icoRule.test(filePath)) {
          this.checkIco(filePath);
        }
      } else {
        this.outputFolder = filePath;
      }
    },

    showIconMenu(e, index) {
      if (typeof index === "number") {
        this.selectedIndex = index;
        iconMenu.popup(e, this.iconMenuCallback, null, index);
      } else {
        listMenu.popup(e, this.iconMenuCallback);
      }
    },
    iconMenuCallback({ value }, index) {
      if (value === "saveAs") {
        const icon = this.iconList[index];
        showSaveDialog({
          nwsaveas: `${icon.name}-${icon.width}x${icon.height}.png`,
          accept: saveAccept,
        }).then(([filePath]) => {
          if (!saveAcceptRule.test(filePath)) filePath += `.png`;
          sharpToFile({ image: icons[index] }, filePath)
            .then(() => {
              showSuccess(this.$t("icoTool.saveSuccess"));
            })
            .catch((err) => {
              showError(this.$t("icoTool.saveError"), err);
            });
        });
      } else if (value === "saveAll") {
        showOpenDialog({
          nwdirectory: true,
          nwdirectorydesc: this.$t("icoTool.chooseOutputFolder"),
        }).then(([dirPath]) => {
          Promise.all(
            icons.map(async (image, index) => {
              const icon = this.iconList[index];
              const filename = `${icon.name}-${icon.width}x${icon.height}.png`;
              const filePath = path.join(dirPath, filename);
              return sharpToFile({ image }, filePath);
            })
          )
            .then(() => {
              showSuccess(this.$t("icoTool.saveSuccess"));
            })
            .catch((err) => {
              showError(this.$t("icoTool.saveError"), err);
            });
        });
      }
    },

    async handleOpenFilePath(filePath) {
      if (lnkRule.test(filePath)) {
        this.loadingLnk = true;
        await getShortcutTarget(filePath)
          .then((actualPath) => (filePath = actualPath))
          .catch(() => {});
        this.loadingLnk = false;
      }
      if (exeRule.test(filePath)) {
        this.filePath = filePath;
      }
    },

    handleOpenIcoPath(filePath) {
      this.checkIco(filePath);
    },

    async checkIco(icoPath) {
      const _icons = await getIcons(icoPath, this);
      icons = _icons.images;
      this.iconList = _icons.icons;
      this.icoPath = icoPath;
      this.selectedIndex = -1;
      return true;
    },

    openOutputFolder() {
      const { outputFolder } = this;
      if (!fs.existsSync(outputFolder)) {
        showError(this.$t("message.notExist", { path: outputFolder }));
        return;
      }
      nw.Shell.openItem(outputFolder);
    },

    async extractIco() {
      const { filePath, outputFolder, extractCursors, asIco, newFolder } = this;
      if (!(await isValidSourceFile(filePath))) {
        showError(`${filePath} ${this.$t("icoTool.notValidSourceFile")}`);
        return false;
      }
      if (!(await isValidFolder(outputFolder))) {
        showError(`${filePath} ${this.$t("icoTool.notValidOutputFolder")}`);
        return false;
      }

      const loading = showLoading({
        lock: true,
        text: this.$t("icoTool.extracting"),
        background: "rgba(0, 0, 0, 0.7)",
      });
      return runIconsext(
        filePath,
        outputFolder,
        extractCursors,
        asIco,
        newFolder
      )
        .then(() => {
          loading.close();
          showSuccess(this.$t("icoTool.extractSuccess"));
          return true;
        })
        .catch((err) => {
          loading.close();
          showError(this.$t("icoTool.extractError"), err);
          return false;
        });
    },
  },

  created() {
    window.addEventListener("click", () => {
      this.selectedIndex = -1;
    });
  },
};
</script>

<style>
.viewer {
  position: absolute;
  top: 10px;
  left: 20px;
  width: calc(100vw - 40px);
  height: calc(100vh - 20px);
  transition: 0.3s;
}

.toolbar {
  text-align: right;
}

.tip {
  float: left;
  font-size: 14px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 16px;
  max-width: 500px;
}
</style>
