<template>
  <el-container class="window">
    <el-header class="header">
      <HeaderToolbar
        :hasTask="hasTask"
        :hasSelectedTask="hasSelectedTask"
        :processing="processing"
        @show-setting="showSetting()"
        @show-edit-image="openEditImage"
        @show-filter-tool="openFilterTool"
        @show-more-tools="showMoreTools"
        @add-tasks="onAddTasks"
        @remove-tasks="onRemoveTasks"
        @clear-tasks="onClearTasks"
        @stop-convert="onStopConvert"
        @start-convert="onStartConvert"
      />
    </el-header>
    <el-container class="content">
      <el-aside class="aside">
        <AsideFormats
          :height="mainHeight"
          :formats="formats"
          :curFormat="curFormat"
          @format-changed="curFormat = $event"
          @format-setting="onFormatSetting"
          @format-tips="tips = $event && $t(`${$event}.tips`)"
        />
      </el-aside>
      <el-main class="main" ref="main">
        <MainTasks
          ref="tasks"
          :setting="setting"
          :tasks="tasks"
          :processing="processing"
          :height="mainHeight"
          @output-setting="onOutputSetting"
          @selected-changed="onSelectedChanged"
          @remove-task="onRemoveTasks"
          @clear-tasks="onClearTasks"
          @tasks-state-changed="onTasksStateChanged"
          @convert-to="onConvertTo"
        />
      </el-main>
    </el-container>
    <el-footer class="footer">
      <FooterInfobar
        ref="infobar"
        :completeNotify="setting.general.completeNotify"
        :info="info || $t(`${curFormat.type}.tips`)"
        :tips="tips"
        :progress="progress"
        @complete-notify-changed="setting.general.completeNotify = $event"
      />
    </el-footer>
    <SettingDialog
      ref="settingDialog"
      :visible="settingVisible"
      :setting="setting"
      :tasks="settingTasks"
      @confirm="onSettingConfirm"
      @close-setting="settingVisible = false"
      @cancel="onSettingCancel"
    />
  </el-container>
</template>

<script>
import os from "os";
import url from "url";
import clone from "clone";
import { showOpenDialog } from "nwjs-dialog";
import { formats, formatsMap } from "@/preset/formats";
import setting, { writeSetting } from "@/preset/setting";
import { openAccept, handleDropImages } from "@/util/imageFiles";
import converter from "@/util/converter";
import appIcon from "@/assets/icon.png";
import { openPage } from "@/util/util";
import HeaderToolbar from "./HeaderToolbar.vue";
import AsideFormats from "./AsideFormats.vue";
import MainTasks from "./MainTasks.vue";
import FooterInfobar from "./FooterInfobar.vue";
import SettingDialog from "./SettingDialog.vue";
import menubar from "./menubar";
import { moreToolsMenu } from "./contextmenu";

let tasksMap = {};
let taskKey = 0;
function getTasksFromMap() {
  return Object.values(tasksMap).map((task, index) => {
    task.index = index;
    task.selected = false;
    return task;
  });
}

export default {
  name: "AppMain",
  components: {
    HeaderToolbar,
    AsideFormats,
    MainTasks,
    FooterInfobar,
    SettingDialog,
  },
  data() {
    return {
      formats,
      curFormat: formats[0],
      setting: clone(setting),
      mainHeight: 0,
      tasks: [],
      processing: false,
      hasSelectedTask: false,
      info: "",
      tips: "",
      progress: {
        processed: 0,
        total: 0,
      },
      settingVisible: false,
      settingTasks: null,
    };
  },
  computed: {
    hasTask() {
      return this.tasks.length > 0;
    },
  },
  methods: {
    resize() {
      this.mainHeight = this.$refs.main.$el.offsetHeight;
    },

    showSetting(type, tasks) {
      this.settingTasks = tasks;
      this.settingVisible = true;
      if (type) this.$refs.settingDialog.setActiveTab(type);
    },

    onFormatSetting(format) {
      this.showSetting(format.type);
    },

    addTasks(imageFiles) {
      const format = this.curFormat;
      const setting = this.setting;
      imageFiles.forEach((file) => {
        tasksMap[taskKey] = {
          key: taskKey,
          url: url.pathToFileURL(file.path).toString(),
          input: file.path,
          filename: file.name,
          size: file.size,
          ext: undefined,
          animated: undefined,
          toAnimated: undefined,
          state: "waiting",
          format,
          general: clone(setting.general),
          modifier: clone(setting.modifier),
          watermark: clone(setting.watermark),
          inputOptions: undefined,
          options: clone(setting[format.type]),
          output: undefined,
          outputSize: undefined,
          error: undefined,
        };
        taskKey += 1;
      });
      this.tasks = getTasksFromMap();
      this.progress.total = this.tasks.length;
    },

    onOutputSetting(tasks) {
      this.showSetting("general", tasks);
    },

    onAddTasks() {
      showOpenDialog({
        multiple: true,
        accept: openAccept,
        returnFormat: "file",
      }).then((imageFiles) => {
        this.addTasks(imageFiles);
      });
    },

    onRemoveTasks(tasks) {
      if (!tasks) tasks = this.$refs.tasks.getSelectedTasks();
      tasks.forEach((task) => delete tasksMap[task.key]);
      this.tasks = getTasksFromMap();
      this.hasSelectedTask = false;
      this.progress.total = this.tasks.length;
      this.onTasksStateChanged();
    },

    onClearTasks() {
      tasksMap = {};
      this.tasks = [];
      this.hasSelectedTask = false;
      this.progress.total = this.tasks.length;
      this.onTasksStateChanged();
      this.$refs.infobar.showTime = false;
    },

    onSelectedChanged(selectedCount) {
      this.hasSelectedTask = selectedCount > 0;
      this.info =
        selectedCount > 0
          ? this.$t("infobar.selected", { count: selectedCount })
          : "";
    },

    onConvertTo(tasks, type) {
      const format = formatsMap[type];
      const setting = this.setting;
      tasks.forEach((task) => {
        Object.assign(task, {
          state: "waiting",
          format: clone(format),
          options: clone(setting[format.type]),
          animated: undefined,
          toAnimated: undefined,
          output: undefined,
          outputSize: undefined,
          error: undefined,
        });
      });
      this.onTasksStateChanged();
    },

    onTasksStateChanged() {
      const waitingTasks = this.tasks.filter(
        (task) => task.state === "waiting"
      );
      this.progress.processed = this.tasks.length - waitingTasks.length;
    },

    onStartConvert() {
      if (this.progress.processed === this.progress.total) return;
      this.processing = true;
      this.$refs.infobar.startTimer();
      converter.start(
        this.setting,
        this.tasks,
        (index, total, task) => {
          if (
            task.state === "completed" ||
            task.state === "failed" ||
            task.state === "ignored"
          ) {
            this.progress = { processed: this.progress.processed + 1, total };
            // all tasks processed
            if (index === total - 1) {
              this.onStopConvert();
              this.completeNotify();
            }
          } else {
            // task.state === "processing"
          }
        },
        this
      );
    },

    onStopConvert() {
      converter.stop();
      this.processing = false;
      this.$refs.infobar.stopTimer();
    },

    completeNotify() {
      if (this.setting.general.completeNotify) {
        new window.Notification(this.$t("appName"), {
          body: [
            this.$t("message.taskComplete"),
            `${this.$t("message.elapsedTime")}：${this.$refs.infobar.time}`,
          ].join("\r\n"),
          icon: appIcon,
        });
      }
    },

    onSettingConfirm(value) {
      if (this.settingTasks) {
        this.settingTasks.forEach((task) => {
          Object.assign(task, value);
        });
      } else {
        this.setting = value;
        writeSetting(this.setting);
      }
      this.settingVisible = false;
    },

    onSettingCancel() {
      this.settingVisible = false;
    },

    openEditImage() {
      openPage(
        "edit-image.html",
        {
          locale: this.$i18n.locale,
        },
        {
          id: "iyo-edit-image",
          title: this.$t("editImage.title"),
          icon: "icons/win32/editimage.png",
          min_width: 480,
          min_height: 400,
        }
      );
    },

    openFilterTool() {
      openPage(
        "filter-tool.html",
        {
          locale: this.$i18n.locale,
        },
        {
          id: "iyo-filter-tool",
          title: this.$t("filterTool.title"),
          icon: "icons/win32/filter.png",
          min_width: 720,
          min_height: 480,
        }
      );
    },

    showMoreTools(e) {
      moreToolsMenu.popup(e, ({ cmd }) => {
        switch (cmd) {
          case "animeTool":
            this.openAnimeTool();
            break;
          case "icoTool":
            this.openIcoTool();
            break;
          case "pdfTool":
            this.openPdfTool();
            break;
          case "mirageTank":
            this.openMirageTank();
            break;
        }
      });
    },

    openAnimeTool() {
      openPage(
        "anime-tool.html",
        {
          locale: this.$i18n.locale,
        },
        {
          id: "iyo-anime-tool",
          title: this.$t("animeTool.title"),
          icon: "icons/win32/anime.png",
          width: 600,
          height: 360,
          min_width: 480,
          min_height: 400,
        }
      );
    },

    openIcoTool() {
      openPage(
        "ico-tool.html",
        {
          locale: this.$i18n.locale,
        },
        {
          id: "iyo-ico-tool",
          title: this.$t("icoTool.title"),
          icon: "icons/win32/ico.png",
          width: 600,
          height: 492,
          resizable: false,
        }
      );
    },

    openPdfTool() {
      openPage(
        "pdf-tool.html",
        {
          locale: this.$i18n.locale,
        },
        {
          id: "iyo-pdf-tool",
          title: this.$t("pdfTool.title"),
          icon: "icons/win32/pdf.png",
          width: 740,
          height: 580,
          min_width: 740,
          min_height: 580,
        }
      );
    },

    openMirageTank() {
      openPage(
        "mirage-tank.html",
        {
          locale: this.$i18n.locale,
        },
        {
          id: "iyo-mirage-tank",
          title: this.$t("mirageTank.title"),
          icon: "icons/win32/mirage-tank.png",
          width: 600,
          height: 492,
          min_width: 480,
          min_height: 400,
        }
      );
    },

    getTitle() {
      return `${this.$t("appName")} - ${nw.App.manifest.version}`;
    },
  },

  mounted() {
    document.title = this.getTitle();

    menubar.callback((data) => {
      switch (data.cmd) {
        case "exit":
          nw.App.quit();
          break;
        case "locale":
          // i18n
          this.$i18n.locale = data.value;
          // title
          document.title = this.getTitle();
          // info
          this.onSelectedChanged(this.$refs.tasks.getSelectedCount());
          // emit
          process.emit("localeChange", data.value);
          // write setting
          this.setting.locale = data.value;
          writeSetting(this.setting);
          break;
        case "option":
          this.showSetting();
          break;
        case "editImage":
          this.openEditImage();
          break;
        case "filterTool":
          this.openFilterTool();
          break;
        case "animeTool":
          this.openAnimeTool();
          break;
        case "icoTool":
          this.openIcoTool();
          break;
        case "pdfTool":
          this.openPdfTool();
          break;
        case "mirageTank":
          this.openMirageTank();
          break;
        case "homePage":
          nw.Shell.openExternal(
            "https://github.com/ssnangua/iyo-image-converter"
          );
          break;
        case "about":
          {
            const ver = process.versions;
            const osInfo = [os.version(), os.arch(), os.release()].join(" ");
            alert(
              [
                this.$t("appName"),
                "",
                `${this.$t("about.version")}：${nw.App.manifest.version}`,
                `${this.$t("about.nwjs")}：${ver.nw}`,
                `${this.$t("about.chromium")}：${ver.chromium}`,
                `${this.$t("about.nodejs")}：${ver.node}`,
                `${this.$t("about.v8")}：${ver.v8}`,
                `${this.$t("about.os")}：${osInfo}`,
              ].join("\r\n")
            );
          }
          break;
      }
    });

    this.resize();
    window.addEventListener("resize", this.resize);

    handleDropImages(
      (imageFiles) => {
        if (this.settingVisible) return;
        if (imageFiles.length > 0) {
          this.addTasks(imageFiles);
        }
      },
      () => this.setting.general.readFolders
    );

    // const win = nw.Window.get();
    // win.on("close", () => {
    //   nw.App.closeAllWindows();
    //   win.close(true);
    // });
  },
};
</script>

<style>
html,
body,
#app,
.window {
  width: 100%;
  height: 100%;
  margin: 0;
  background-color: #ffffff;
  overflow: hidden;
}

* {
  user-select: none;
  -webkit-user-drag: none;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

:root {
  --border: 1px solid var(--el-border-color);
}

.header {
  /* border-top: var(--border); */
  border-bottom: var(--border);
  height: 52px;
  padding: 10px;
}

.content {
  overflow: auto;
}

.aside {
  border-right: var(--border);
  width: 90px;
  background-color: #f2f3f5;
}

.main {
  padding: 0;
  background-color: white;
}

.footer {
  border-top: var(--border);
  height: 32px;
  padding: 0;
  background-color: #f2f3f5;
}
</style>
