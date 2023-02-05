<template>
  <vxe-table
    :data="tasks"
    :empty-text="$t('tasks.emptyText')"
    class="tasks"
    :header-cell-style="{
      'text-align': 'center',
      'background-color': '#F2F3F5',
      padding: '10px 0',
    }"
    :cell-style="{ 'text-align': 'center' }"
    :row-class-name="tableRowClassName"
    show-overflow
    :row-config="{ height: 82 }"
    @cell-click="onTableRowClick"
    :menu-config="{}"
    @cell-menu="onTableRowContextmenu"
  >
    <vxe-column
      v-if="setting.general.showTaskIndex"
      type="seq"
      width="60"
    ></vxe-column>
    <vxe-column :title="$t('tasks.preview')" width="100">
      <template #default="{ row }">
        <el-image :src="row.outputUrl || row.url" fit="contain" class="preview" />
      </template>
    </vxe-column>
    <vxe-column :title="$t('tasks.input')">
      <template #default="{ row }">
        <div>
          <span :title="row.input" class="input">{{ row.filename }}</span>
        </div>
        <div>
          <span class="size">{{ formatSize(row.size) }}</span>
          <span class="buttons">
            <el-button
              size="small"
              key="view-source-file"
              :title="$t('tasks.viewSourceFile')"
              @click.stop="viewFile(row.input)"
            >
              <i class="iconfont icon-openfile"></i>
            </el-button>
            <el-button
              size="small"
              key="open-source-folder"
              :icon="FolderOpened"
              :title="$t('tasks.openSourceFolder')"
              @click.stop="openFolder(row.input)"
            ></el-button>
            <el-button
              size="small"
              key="input-image-file-info"
              :icon="InfoFilled"
              :title="$t('tasks.imageFileInfo')"
              @click.stop="onImageInfo(row.input)"
            ></el-button>
          </span>
        </div>
      </template>
    </vxe-column>
    <vxe-column :title="$t('tasks.output')" width="160">
      <template #default="{ row }">
        <div>
          <span class="output" :style="{ color: row.format.color }">
            {{ $t(`${row.format.type}.name`) }}
          </span>
        </div>
        <div>
          <span v-if="row.state === 'completed'" class="size">
            {{ formatSize(row.outputSize) }}
          </span>
          <span class="buttons">
            <el-button
              size="small"
              key="view-output-file"
              :disabled="row.state !== 'completed'"
              :title="$t('tasks.viewOutputFile')"
              @click.stop="viewFile(row.output)"
            >
              <i class="iconfont icon-openfile"></i>
            </el-button>
            <el-button
              size="small"
              key="open-output-folder"
              :disabled="row.state !== 'completed'"
              :icon="FolderOpened"
              :title="$t('tasks.openOutputFolder')"
              @click.stop="openFolder(row.output)"
            ></el-button>
            <el-button
              size="small"
              key="output-image-file-info"
              :disabled="row.state !== 'completed'"
              :icon="InfoFilled"
              :title="$t('tasks.imageFileInfo')"
              @click.stop="onImageInfo(row.output)"
            ></el-button>
            <el-button
              size="small"
              key="output-setting"
              :disabled="processing || row.state !== 'waiting'"
              :title="$t('tasks.outputSetting')"
              @click.stop="$emit('output-setting', [row])"
            >
              <i class="iconfont icon-setting"></i>
            </el-button>
          </span>
        </div>
      </template>
    </vxe-column>
    <vxe-column :title="$t('tasks.state')" prop="state" width="160">
      <template #default="{ row }">
        <div class="state" :class="row.state">
          <el-icon v-if="row.state === 'processing'" class="is-loading">
            <Loading />
          </el-icon>
          <span class="state-text" :class="row.state">
            {{ $t(`tasks.${row.state}`) }}
          </span>
        </div>
        <div>
          <span v-if="row.state === 'completed'" class="size">
            <el-icon class="result-icon">
              <Top v-if="row.outputSize > row.size" class="gt" />
              <Bottom v-else class="lt" />
            </el-icon>
            {{ getSizeDiff(row) }}
          </span>
          <span class="buttons">
            <el-button
              size="small"
              key="error-info"
              v-if="row.error"
              :icon="QuestionFilled"
              :title="$t('tasks.error')"
              @click.stop="onShowError(row)"
            ></el-button>
            <el-button
              size="small"
              key="reset-task-state"
              :icon="RefreshLeft"
              :disabled="
                processing ||
                (row.state !== 'completed' && row.state !== 'failed')
              "
              :title="$t('tasks.resetTaskState')"
              @click.stop="resetTasks([row])"
            ></el-button>
            <el-button
              size="small"
              key="remove-task"
              :icon="DocumentRemove"
              :disabled="processing"
              :title="$t('tasks.removeTask')"
              @click.stop="$emit('remove-task', [row])"
            ></el-button>
          </span>
        </div>
      </template>
    </vxe-column>
  </vxe-table>
</template>

<script>
import { shallowRef } from "vue";
import {
  InfoFilled,
  FolderOpened,
  DocumentRemove,
  RefreshLeft,
  QuestionFilled,
  Loading,
  Top,
  Bottom,
} from "@element-plus/icons-vue";
import { taskMenu, multiTasksMenu } from "./contextmenu";
import fs from "fs-extra";
import { humanFileSize } from "@/util/util";
import { getImageInfo } from "@/util/converter";

let lastSelectIndex = -1;
let selectedCount = 0;

export default {
  name: "MainTasks",
  components: { Loading, Top, Bottom },
  props: {
    setting: Object,
    tasks: Array,
    processing: Boolean,
  },
  watch: {
    tasks: {
      immediate: true,
      handler(tasks) {
        this.selectMap = { ...new Array(tasks.length).fill(false) };
        lastSelectIndex = -1;
        selectedCount = 0;
      },
    },
  },
  data() {
    return {
      InfoFilled: shallowRef(InfoFilled),
      FolderOpened: shallowRef(FolderOpened),
      DocumentRemove: shallowRef(DocumentRemove),
      RefreshLeft: shallowRef(RefreshLeft),
      QuestionFilled: shallowRef(QuestionFilled),
      tableRowClassName: ({ row }) => {
        return this.selectMap[row.index] ? "selected" : "";
      },
      selectMap: {},
    };
  },
  methods: {
    formatSize(size) {
      return humanFileSize(size);
    },
    getSizeDiff(task) {
      if (task.state === "completed") {
        const diff = Math.abs(task.outputSize - task.size);
        const percentage = Math.round((diff / task.size) * 100);
        return `${humanFileSize(diff, 2)} (${percentage}%)`;
      }
      return "";
    },

    onTableRowClick({ row, $event }) {
      const selectMap = this.selectMap;
      const { index } = row;
      if ($event.ctrlKey) {
        selectMap[index] = !selectMap[index];
        lastSelectIndex = index;
        selectedCount += selectMap[index] ? 1 : -1;
      } else if (
        $event.shiftKey &&
        index !== lastSelectIndex &&
        lastSelectIndex != -1
      ) {
        this.unselectAll();
        const start = Math.min(index, lastSelectIndex);
        const end = Math.max(index, lastSelectIndex);
        for (let i = start; i <= end; i++) {
          selectMap[i] = true;
        }
        selectedCount = end - start + 1;
      } else {
        this.unselectAll();
        selectMap[index] = true;
        lastSelectIndex = index;
        selectedCount = 1;
      }
      this.$emit("selected-changed", selectedCount);
      $event.stopPropagation();
    },

    onTableRowContextmenu(event) {
      const { row, $event } = event;
      if (!this.selectMap[row.index]) {
        this.onTableRowClick(event);
      }
      if (selectedCount === 1) {
        taskMenu.popup(
          $event,
          (item) => this.taskContextmenuHandler([row], item),
          this.getTaskContextmenuEnabled(row)
        );
      } else {
        const processing = this.processing;
        multiTasksMenu.popup(
          $event,
          (item) => this.taskContextmenuHandler(this.getSelectedTasks(), item),
          {
            removeTask: !processing,
            resetTaskState: !processing,
            clearTaskList: !processing,
          }
        );
      }
      $event.preventDefault();
    },

    getTaskContextmenuEnabled(task) {
      const processing = this.processing;
      const waiting = task.state === "waiting";
      const completed = task.state === "completed";
      const failed = task.state === "failed";
      return {
        outputSetting: !processing && waiting,
        viewOutputFile: completed,
        viewOutputFileInfo: completed,
        openOutputFolder: completed,
        removeTask: !processing,
        resetTaskState: !processing && (completed || failed),
        clearTaskList: !processing,
      };
    },

    taskContextmenuHandler(tasks, { cmd, value }) {
      const [task] = tasks;
      switch (cmd) {
        case "outputSetting":
          this.$emit("output-setting", tasks);
          break;
        case "viewSourceFile":
          this.viewFile(task.input);
          break;
        case "viewOutputFile":
          this.viewFile(task.output);
          break;
        case "viewSourceFileInfo":
          this.onImageInfo(task.input);
          break;
        case "viewOutputFileInfo":
          this.onImageInfo(task.output);
          break;
        case "openSourceFolder":
          this.openFolder(task.input);
          break;
        case "openOutputFolder":
          this.openFolder(task.output);
          break;
        case "removeTask":
          this.$emit("remove-task", tasks);
          break;
        case "resetTaskState":
          this.resetTasks(tasks);
          break;
        case "clearTaskList":
          this.$emit("clear-tasks");
          break;
        case "convertTo":
          this.$emit("convert-to", tasks, value);
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
      selectedCount = this.tasks.length;
      lastSelectIndex = this.tasks.length - 1;
      this.$emit("selected-changed", selectedCount);
    },

    unselectAll() {
      const selectMap = this.selectMap;
      Object.keys(selectMap).forEach((key) => (selectMap[key] = false));
    },

    invertSelection() {
      selectedCount = 0;
      lastSelectIndex = -1;
      Object.entries(this.selectMap).forEach(([index, bool]) => {
        this.selectMap[index] = !bool;
        if (!bool) {
          selectedCount += 1;
          lastSelectIndex = index;
        }
      });
      this.$emit("selected-changed", selectedCount);
    },

    getSelectedCount() {
      return selectedCount;
    },

    getSelectedTasks() {
      return Object.entries(this.selectMap)
        .filter((index_selected) => index_selected[1])
        .map(([index]) => this.tasks[index]);
    },

    resetTasks(tasks) {
      tasks.forEach((task) => {
        task.output = "";
        task.error = "";
        task.state = "waiting";
      });
      this.$emit("tasks-state-changed");
    },

    viewFile(filePath) {
      if (fs.existsSync(filePath)) {
        nw.Shell.openItem(filePath);
      } else {
        alert(this.$t("message.notExist", { path: filePath }));
      }
    },

    openFolder(filePath) {
      if (fs.existsSync(filePath)) {
        nw.Shell.openItem(filePath);
      } else {
        alert(this.$t("message.notExist", { path: filePath }));
      }
    },

    onImageInfo(filePath) {
      if (!fs.existsSync(filePath)) {
        alert(this.$t("message.notExist", { path: filePath }));
        return;
      }
      getImageInfo(filePath)
        .then((info) => {
          // console.log(info);
          const pages = info.pages
            ? `（${info.pages} ${this.$t("imageInfo.pages")}）`
            : "";
          const infoList = [
            `${this.$t("imageInfo.filename")}：${info.filename}`,
            `${this.$t("imageInfo.location")}：${info.location}`,
            `${this.$t("imageInfo.type")}：${info.type}`,
            `${this.$t("imageInfo.size")}：${humanFileSize(info.size)}`,
            `${this.$t("imageInfo.date")}：${info.date}`,
            `${this.$t("imageInfo.attributes")}：${info.width}×${
              info.height
            }${pages}`,
          ];
          if (info.density) {
            const inchWidth = (info.width / info.density).toFixed(2);
            const inchHeight = (info.height / info.density).toFixed(2);
            const printSize = `${this.$t(
              "imageInfo.printSize"
            )}：${inchWidth}×${inchHeight} ${this.$t("imageInfo.inch")}，DPI：${
              info.density
            }`;
            infoList.push(printSize);
          }
          alert(infoList.join("\r\n"));
        })
        .catch((err) => {
          alert(err);
        });
    },

    checkInput(task) {
      if (!fs.existsSync(task.input)) {
        alert(this.$t("message.notExist", { path: task.input }));
        return false;
      }
      return true;
    },

    onShowError(task) {
      alert(task.error);
    },
  },

  created() {
    window.addEventListener("click", () => {
      this.$nextTick(() => {
        if (selectedCount > 0) {
          this.unselectAll();
          lastSelectIndex = -1;
          selectedCount = 0;
          this.$emit("selected-changed", selectedCount);
        }
      });
    });

    window.addEventListener("keyup", (event) => {
      // console.log(event);
      const isCtrl = event.ctrlKey || event.metaKey;
      if (isCtrl && event.code === "KeyA") {
        this.selectAll();
      } else if (event.code === "Delete") {
        this.$emit("remove-task", this.getSelectedTasks());
      }
    });
  },
};
</script>

<style>
.tasks .vxe-body--row:hover {
  background-color: #f5f7fa;
}

.tasks .vxe-body--row.selected {
  background-color: #ebedf0;
}

/* .vxe-table--body-wrapper {
  margin-right: 3px;
} */
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

.tasks .vxe-cell {
  display: inline-flex;
  flex-flow: column;
  align-items: center;
  width: 100%;
}

.preview {
  width: 100px;
  height: 50px;
}
.input {
  cursor: help;
  font-weight: bold;
}
.output {
  font-weight: bold;
}
.size {
  color: #909399;
  line-height: 28px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}
.buttons .el-button {
  padding: 4px;
  cursor: default;
  /* border-radius: 0; */
}
.buttons .el-button.is-disabled {
  opacity: 0.5;
}
.tasks .iconfont {
  margin: 0;
}
.buttons .el-button + .el-button {
  margin-left: 2px;
}
.buttons {
  line-height: 28px;
  white-space: nowrap;
  display: none;
}

.tasks .vxe-body--row:hover .size {
  display: none;
}
.tasks .vxe-body--row:hover .buttons {
  display: inline-block;
}

.state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
.state-text {
  overflow: hidden;
  text-overflow: ellipsis;
}
.state-text.completed {
  color: #67c23a;
}
.state-text.failed {
  color: #f56c6c;
}
.state .is-loading {
  margin-right: 2px;
}
.state.processing {
  color: #909399;
}

.result-icon {
  margin-right: 2px;
}
.gt {
  color: #f56c6c;
}
.lt {
  color: #67c23a;
}
</style>
