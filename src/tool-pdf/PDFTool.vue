<template>
  <div class="window">
    <el-form label-width="auto" class="main">
      <el-divider>{{ $t("pdfTool.pdfExtractor") }}</el-divider>

      <el-form-item :label="$t('pdfTool.pdfFile')">
        <FilePicker
          v-model="pdfPath"
          :options="{ accept: '.pdf' }"
          :rule="(value) => /\.pdf/i.test(value)"
          :placeholder="$t('pdfTool.selectPdfFile')"
        />
      </el-form-item>

      <el-form-item :label="$t('pdfTool.outputFolder')">
        <FilePicker
          v-model="outputFolder"
          :options="{
            nwdirectorydescKey: 'pdfTool.chooseOutputFolder',
            nwdirectory: true,
          }"
          :placeholder="$t('pdfTool.selectOutputFolder')"
        />
      </el-form-item>

      <el-form-item :label="$t('pdfTool.extractPassword')">
        <div class="extractor-toolbar">
          <div>
            <el-input v-model="extractPassword" class="option-input"></el-input>
          </div>
          <div>
            <el-button
              link
              :icon="FolderOpened"
              :disabled="!outputFolder"
              @click="openOutputFolder"
              >{{ $t("pdfTool.openOutputFolder") }}</el-button
            >
            <el-button
              type="primary"
              :disabled="!extractable"
              @click="extractImages"
              >{{ $t("pdfTool.extract") }}</el-button
            >
          </div>
        </div>
      </el-form-item>

      <el-divider>{{ $t("pdfTool.pdfGenerator") }}</el-divider>

      <div
        class="generator"
        :class="{ dragenter }"
        @dragenter="dragenter = true"
        @drop.prevent.stop="onDrop"
      >
        <vxe-table
          ref="table"
          :data="images"
          :empty-text="$t('pdfTool.emptyText')"
          class="images"
          :header-cell-style="{
            'text-align': 'center',
            'background-color': '#ffffff',
            padding: '10px 0',
          }"
          :row-class-name="tableRowClassName"
          show-overflow
          height="auto"
          :row-config="{ height: 32 }"
          @cell-click="onTableRowClick"
          :menu-config="{}"
          @cell-menu="onTableRowContextmenu"
        >
          <vxe-column type="seq" width="60"></vxe-column>
          <vxe-column :title="$t('pdfTool.filename')">
            <template #default="{ row }">
              <div class="filename">
                <span :title="row.path" class="image">{{ row.name }}</span>
              </div>
            </template>
          </vxe-column>
        </vxe-table>

        <div class="dragenter-mask" @dragleave="dragenter = false"></div>

        <div class="table-toolbar">
          <div class="btn-group">
            <!-- add -->
            <span
              class="icon-btn"
              @click.stop="onControl('add')"
              :title="$t('pdfTool.addImages')"
            >
              <i class="iconfont icon-f-insert"></i>
            </span>
            <!-- remove -->
            <span
              class="icon-btn"
              :class="{ disabled: selectedCount === 0 }"
              @click.stop="onControl('remove')"
              :title="$t('pdfTool.removeImages')"
            >
              <i class="iconfont icon-f-remove"></i>
            </span>
            <!-- remove -->
            <span
              class="icon-btn"
              :class="{ disabled: images.length === 0 }"
              @click.stop="onControl('clear')"
              :title="$t('pdfTool.clearList')"
            >
              <i class="iconfont icon-f-clear"></i>
            </span>
          </div>

          <!-- sort start -->
          <div class="btn-group" :class="{ disabled: selectedCount === 0 }">
            <!-- move to top -->
            <span
              class="icon-btn"
              @click.stop="onControl('moveToTop')"
              :title="$t('pdfTool.moveToTop')"
            >
              <i
                class="iconfont icon-f-first"
                style="transform: rotate(90deg)"
              ></i>
            </span>
            <!-- move up -->
            <span
              class="icon-btn"
              @click.stop="onControl('moveUp')"
              :title="$t('pdfTool.moveUp')"
            >
              <i
                class="iconfont icon-f-play"
                style="transform: rotate(-90deg)"
              ></i>
            </span>
            <!-- move down -->
            <span
              class="icon-btn"
              @click.stop="onControl('moveDown')"
              :title="$t('pdfTool.moveDown')"
            >
              <i
                class="iconfont icon-f-play"
                style="transform: rotate(90deg)"
              ></i>
            </span>
            <!-- move to bottom -->
            <span
              class="icon-btn"
              @click.stop="onControl('moveToBottom')"
              :title="$t('pdfTool.moveToBottom')"
            >
              <i
                class="iconfont icon-f-last"
                style="transform: rotate(90deg)"
              ></i>
            </span>
          </div>
          <!-- sort end -->
        </div>
      </div>

      <div class="generator-toolbar">
        <div class="generator-setting">
          <div class="option-item">
            <span class="option-label">{{ $t("pdfTool.exportPassword") }}</span>
            <el-input v-model="exportPassword" class="option-input"></el-input>
          </div>
          <div class="option-item">
            <span class="option-label">{{ $t("pdfTool.imageQuality") }}</span>
            <el-input-number
              v-model="imageQuality"
              :step="1"
              :min="1"
              :max="100"
              controls-position="right"
              class="option-input"
            />
          </div>
          <div class="option-item">
            <span class="option-label">{{ $t("pdfTool.margins") }}</span>
            <el-input-number
              v-model="margins"
              :step="1"
              :min="0"
              controls-position="right"
              class="option-input"
            />
          </div>
        </div>
        <div>
          <el-button
            type="primary"
            :disabled="images.length < 1"
            @click="exportPdf"
            >{{ $t("pdfTool.export") }}</el-button
          >
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import fs from "fs-extra";
import path from "path";
import { shallowRef } from "vue";
import { FolderOpened } from "@element-plus/icons-vue";
import { showOpenDialog, showSaveDialog } from "nwjs-dialog";
import { showError } from "@/util/message";
import { getImages, openAccept } from "@/util/imageFiles";
import FilePicker from "@/component/FilePicker.vue";
import { rowMenu } from "./contextmenu";
import { extractImages, exportPdf } from "./util";

export default {
  name: "PDFTool",
  components: { FilePicker },
  data() {
    return {
      FolderOpened: shallowRef(FolderOpened),

      // extractor
      pdfPath: "",
      outputFolder: "",
      extractPassword: "",

      // generator
      tableRowClassName: ({ row }) => {
        return this.selectMap[row.index] ? "selected" : "";
      },
      images: [],
      selectMap: {},
      lastSelectIndex: -1,
      selectedCount: 0,
      dragenter: false,
      pageSize: "auto",
      exportPassword: "",
      imageQuality: 80,
      margins: 0,
    };
  },

  computed: {
    extractable() {
      return this.pdfPath && this.outputFolder && /\.pdf$/i.test(this.pdfPath);
    },
  },

  methods: {
    // extractor
    openOutputFolder() {
      const { outputFolder } = this;
      if (!fs.existsSync(outputFolder)) {
        showError(this.$t("message.notExist", { path: outputFolder }));
        return;
      }
      nw.Shell.openItem(outputFolder);
    },

    async extractImages() {
      const { pdfPath, outputFolder, extractPassword } = this;
      extractImages(pdfPath, outputFolder, extractPassword, this);
    },

    // generator
    onTableRowClick({ row, $event }) {
      const selectMap = this.selectMap;
      const { index } = row;
      if ($event.ctrlKey) {
        selectMap[index] = !selectMap[index];
        this.lastSelectIndex = index;
        this.selectedCount += selectMap[index] ? 1 : -1;
      } else if (
        $event.shiftKey &&
        index !== this.lastSelectIndex &&
        this.lastSelectIndex != -1
      ) {
        this.unselectAll();
        const start = Math.min(index, this.lastSelectIndex);
        const end = Math.max(index, this.lastSelectIndex);
        for (let i = start; i <= end; i++) {
          selectMap[i] = true;
        }
        this.selectedCount = end - start + 1;
      } else {
        this.unselectAll();
        selectMap[index] = true;
        this.lastSelectIndex = index;
        this.selectedCount = 1;
      }
      $event.stopPropagation();
    },

    onTableRowContextmenu(event) {
      const { row, $event } = event;
      if (!this.selectMap[row.index]) {
        this.onTableRowClick(event);
      }
      rowMenu.popup($event, this.rowContextmenuHandler);
      $event.preventDefault();
    },
    rowContextmenuHandler({ cmd }) {
      switch (cmd) {
        case "remove":
          this.spliceImages(cmd);
          break;
        case "clear":
          this.clearList();
          break;
        case "selectAll":
          this.selectAll();
          break;
        case "invertSelection":
          this.invertSelection();
          break;
      }
    },

    selectAll() {
      const selectMap = this.selectMap;
      Object.keys(selectMap).forEach((key) => (selectMap[key] = true));
      this.selectedCount = this.images.length;
      this.lastSelectIndex = this.images.length - 1;
    },
    unselectAll() {
      const selectMap = this.selectMap;
      Object.keys(selectMap).forEach((key) => (selectMap[key] = false));
    },
    invertSelection() {
      this.selectedCount = 0;
      this.lastSelectIndex = -1;
      Object.entries(this.selectMap).forEach(([index, bool]) => {
        this.selectMap[index] = !bool;
        if (!bool) {
          this.selectedCount += 1;
          this.lastSelectIndex = index;
        }
      });
    },

    updateIndex() {
      this.images.forEach((image, index) => (image.index = index));
      this.selectMap = { ...new Array(this.images.length).fill(false) };
    },
    async onDrop(e) {
      this.dragenter = false;
      const images = await getImages(
        Array.from(e.dataTransfer.files).map((file) => file.path),
        true
      );
      this.images = this.images.concat(images);
      this.updateIndex();
    },

    onControl(action) {
      switch (action) {
        case "add":
          this.addImages();
          break;
        case "remove":
          this.spliceImages(action);
          break;
        case "clear":
          this.clearList();
          break;
        case "moveToTop":
          this.spliceImages(action);
          break;
        case "moveUp":
          this.spliceImages(action);
          break;
        case "moveDown":
          this.spliceImages(action);
          break;
        case "moveToBottom":
          this.spliceImages(action);
          break;
      }
    },

    addImages() {
      showOpenDialog({
        multiple: true,
        accept: openAccept,
        returnFormat: "file",
      }).then((images) => {
        this.images = this.images.concat(images);
        this.updateIndex();
      });
    },

    spliceImages(action) {
      const { selectMap, images } = this;
      const select = [];
      let unselect = [];
      for (let i in selectMap) {
        if (selectMap[i]) select.push(images[i]);
        else unselect.push(images[i]);
      }
      if (action !== "remove") {
        if (unselect.length === 0) {
          unselect = select;
        } else {
          select.sort((a, b) => a.index - b.index);
          const indexMap = {
            moveToTop: 0,
            moveUp: Math.max(0, select[0].index - 1),
            moveDown: select[0].index + 1,
            moveToBottom: unselect.length,
          };
          unselect.splice(indexMap[action], 0, ...select);
          this.scrollTo(indexMap[action], select.length);
        }
      }
      this.images = unselect;
      this.updateIndex();
      if (action === "remove") {
        this.lastSelectIndex = -1;
        this.selectedCount = 0;
      } else {
        select.forEach(({ index }) => (this.selectMap[index] = true));
        this.lastSelectIndex = select[0].index;
        this.selectedCount = select.length;
      }
    },
    scrollTo(index, count) {
      setTimeout(() => {
        const table = this.$refs.table.$el;
        const el = table?.querySelector(".vxe-table--body-wrapper");
        if (el) {
          const minTop = (index + count) * 32 - el.offsetHeight;
          const maxTop = index * 32;
          if (el.scrollTop < minTop) el.scrollTop = minTop;
          if (el.scrollTop > maxTop) el.scrollTop = maxTop;
        }
      }, 0);
    },

    clearList() {
      this.images = [];
      this.updateIndex();
      this.lastSelectIndex = -1;
      this.selectedCount = 0;
    },

    exportPdf() {
      const { images, pageSize, exportPassword, imageQuality, margins } = this;
      showSaveDialog({
        nwsaveas: path.parse(images[0].name).name,
        accept: ".pdf",
      }).then(([fileOut]) => {
        if (!/\.pdf$/i.test(fileOut)) fileOut += ".pdf";
        exportPdf(images, fileOut, pageSize, exportPassword, imageQuality, margins, this);
      });
    },
  },

  mounted() {
    const preventDefault = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    window.addEventListener("dragenter", preventDefault);
    window.addEventListener("dragover", preventDefault);
    window.addEventListener("dragleave", preventDefault);
    window.addEventListener("drop", preventDefault);

    window.addEventListener("click", () => {
      this.unselectAll();
      this.lastSelectIndex = -1;
      this.selectedCount = 0;
    });

    window.addEventListener("keyup", (event) => {
      // console.log(event);
      const isCtrl = event.ctrlKey || event.metaKey;
      if (isCtrl && event.code === "KeyA") {
        this.selectAll();
      } else if (event.code === "Delete") {
        this.spliceImages("remove");
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
  width: calc(100vw - 40px);
  height: calc(100vh - 30px);
  background-color: #f2f3f5;
  overflow: hidden;
  padding: 10px 20px 20px 20px;
  display: flex;
  flex-flow: column;
}

.main {
  flex: auto;
  display: flex;
  flex-flow: column;
  overflow: hidden;
}

.el-divider__text {
  background-color: #f2f3f5;
}

.extractor-toolbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  white-space: nowrap;
}

.generator {
  flex: auto;
  display: flex;
  flex-flow: row;
  overflow: hidden;
  position: relative;
}
.dragenter-mask {
  display: none;
  z-index: 9999;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(131, 191, 76, 0.3);
  border: 1.5px solid rgb(131, 191, 76);
}
.generator.dragenter > .dragenter-mask {
  display: block;
}
.generator > .images {
  flex: auto;
  background: #ffffff;
  overflow: hidden;
}
.filename {
  width: 100%;
}

/* table toolbar start */
.table-toolbar {
  width: 40px;
  border: 1px solid #e8eaec;
  border-left: none;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
}
.btn-group {
  display: flex;
  flex-flow: column;
}
.btn-group + .btn-group {
  margin-top: 20px;
}
.icon-btn {
  display: inline-flex;
  width: 16px;
  height: 16px;
  background-color: #ffffff;
  border: 1px solid #dddfe5;
  align-items: center;
  justify-content: center;
  image-rendering: pixelated;
  padding: 4px;
  transition: 0.1s;
}
.icon-btn .iconfont {
  color: #606266;
  font-size: 12px;
}
.icon-btn:hover {
  background-color: #eef5fe;
  border-color: #cee1fd;
}
.icon-btn:active {
  border-color: #649cfa;
}
.icon-btn + .icon-btn {
  margin-top: 5px;
}
.btn-group.disabled,
.icon-btn.disabled {
  pointer-events: none;
  opacity: 0.5;
}
/* table toolbar end */

.generator-toolbar {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  white-space: nowrap;
}
.generator-setting {
  display: flex;
}
.option-item + .option-item {
  margin-left: 20px;
}
.option-label {
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
}
.option-input {
  max-width: 100px;
}

/* vxe-table */
.vxe-body--row:hover {
  background-color: #f5f7fa;
}
.vxe-body--row.selected {
  background-color: #ebedf0;
}
.vxe-table--body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.vxe-table--body-wrapper::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background-color: rgba(144, 147, 153, 0.3);
}
.vxe-header--column .vxe-cell--title {
  white-space: nowrap;
}
.vxe-cell {
  display: inline-flex;
  flex-flow: column;
  align-items: center;
  width: 100%;
}
</style>
