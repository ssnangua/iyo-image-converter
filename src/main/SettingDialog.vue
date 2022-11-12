<template>
  <div class="setting-dialog">
    <el-dialog
      :model-value="visible"
      :title="$t('setting.title')"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      width="80%"
      top="0"
      @open="onOpen"
      @closed="onCancel"
    >
      <div class="setting-wrapper">
        <div class="tabs">
          <el-scrollbar ref="tabs">
            <div
              v-for="tab in tabs"
              :key="tab.type"
              :style="{ color: tab.color }"
              @click="setActiveTab(tab.type, false)"
              class="tab"
              :class="{ selected: tab.type === activeTab }"
            >
              {{ $t(`${tab.type}.name`) }}
            </div>
          </el-scrollbar>
        </div>
        <div class="content">
          <el-scrollbar ref="content">
            <OptionsEditor
              v-if="tabsMap.general"
              v-show="activeTab === 'general'"
              ref="general"
              :config="generalOptions"
              :setting="value.general"
              :isTask="!!tasks"
            />
            <ModifierEditor
              v-if="tabsMap.modifier"
              v-show="activeTab === 'modifier'"
              ref="modifier"
              :setting="value.modifier"
            ></ModifierEditor>
            <OptionsEditor
              v-if="tabsMap.watermark"
              v-show="activeTab === 'watermark'"
              ref="watermark"
              :config="watermarkOptions"
              :setting="value.watermark"
            />
            <template v-for="tab in tabs">
              <OptionsEditor
                v-if="tab.editor && tabsMap[tab.type]"
                v-show="activeTab === tab.type"
                :ref="tab.type"
                :config="tab"
                :setting="value[tab.type]"
                :key="tab.type"
              />
            </template>
          </el-scrollbar>
        </div>
      </div>

      <!-- footer -->
      <template #footer>
        <span class="dialog-footer">
          <span style="float: left">
            <el-button type="danger" @click="onResetAll">{{
              $t("setting.resetAll")
            }}</el-button>
            <el-button @click="onReset">{{
              $t("setting.reset") + $t(`${activeTab}.name`)
            }}</el-button>
          </span>
          <el-button @click="$emit('close-setting')">{{
            $t("setting.cancel")
          }}</el-button>
          <el-button type="primary" @click="onConfirm" class="confirm">{{
            $t("setting.confirm")
          }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import clone from "clone";
import { formats } from "@/preset/formats";
import generalOptions from "@/preset/general";
import watermarkOptions from "@/preset/watermark";
import { defaultSetting } from "@/preset/setting";
import OptionsEditor from "@/component/OptionsEditor.vue";
import ModifierEditor from "./ModifierEditor.vue";

const baseTabs = [
  { type: "general" },
  { type: "modifier" },
  { type: "watermark" },
];
const allTabs = baseTabs.concat(formats.filter((item) => item.editor));

const tabsMap = allTabs.reduce((map, format) => {
  map[format.type] = false;
  return map;
}, {});

export default {
  name: "SettingDialog",
  components: { OptionsEditor, ModifierEditor },
  props: {
    setting: Object,
    visible: Boolean,
    tasks: Array,
  },
  data() {
    return {
      activeTab: "general",
      generalOptions,
      watermarkOptions,
      tabs: allTabs,
      tabsMap,
      value: {},
    };
  },
  methods: {
    setActiveTab(tabName, autoScroll = true) {
      this.tabsMap[tabName] = true;
      this.activeTab = tabName;
      this.$nextTick(() => {
        this.$refs.content?.setScrollTop(0);
        if (autoScroll) {
          const index = this.tabs.findIndex((tab) => tab.type === tabName);
          this.$refs.tabs?.setScrollTop(32 * index + 8);
        }
      });
    },
    onOpen() {
      if (this.tasks) {
        const tabs = allTabs.slice(0, 3);
        const { general, modifier, watermark, format, options } = this.tasks[0];
        const value = { general, modifier, watermark };
        const typesMap = {};
        this.tasks.forEach((task) => (typesMap[task.format.type] = true));
        if (Object.keys(typesMap).length === 1 && format.editor) {
          tabs.push(format);
          value[format.type] = options;
          this.$nextTick(() => this.setActiveTab(format.type));
        }
        this.tabs = tabs;
        this.value = clone(value);
      } else {
        this.tabs = allTabs;
        this.value = clone(this.setting);
      }
    },
    onResetAll() {
      if (confirm(this.$t("setting.resetAllConfirm"))) {
        const value = clone(defaultSetting);
        this.resetExclude(value.general);
        this.value = value;
      }
    },
    onReset() {
      const type = this.activeTab;
      const value = clone(defaultSetting[type]);
      if (type === "general") this.resetExclude(value);
      this.value[type] = value;
    },
    resetExclude(value) {
      Object.assign(value, {
        outputFolder: this.value.general.outputFolder,
      });
    },
    onConfirm() {
      if (this.tasks) {
        Object.keys(this.value).forEach((type) => {
          const editor = this.$refs[type];
          type = /general|modifier|watermark/.test(type) ? type : "options";
          if (editor) this.value[type] = (editor[0] || editor).getValue();
        });
      } else {
        allTabs.forEach((tab) => {
          const editor = this.$refs[tab.type];
          if (editor) this.value[tab.type] = (editor[0] || editor).getValue();
        });
      }
      this.$emit("confirm", this.value);
    },
    onCancel() {
      this.$emit("cancel");
    },
  },
  mounted() {
    this.setActiveTab("general", false);
  },
};
</script>

<style>
.setting-dialog .el-dialog {
  top: 50%;
  transform: translateY(-50%);
  max-width: 800px;
}
.setting-dialog .el-dialog__body {
  padding: 10px 20px;
}
.setting-dialog .el-button {
  cursor: default;
}
.setting-dialog .el-button {
  min-width: 60px;
}
.setting-dialog .el-button + .el-button {
  margin-left: 10px;
}

.setting-wrapper {
  display: flex;
  height: calc(70vh - 60px);
  border: var(--border);
}
.setting-wrapper .tabs {
  background-color: #f2f3f5;
  border-right: var(--border);
  flex-shrink: 0;
}
.setting-wrapper .tabs .el-scrollbar__view {
  padding: 8px 0;
}
.setting-wrapper .tab {
  white-space: nowrap;
  text-align: center;
  padding: 8px 20px;
  transition: 0.1s;
}
.setting-wrapper .tab:hover {
  background-color: #dcdfe6;
}
.setting-wrapper .tab.selected {
  background-color: #ffffff;
  outline: var(--border);
}

.setting-wrapper .content {
  flex: auto;
}
.setting-wrapper .content .el-scrollbar__view {
  padding: 20px;
}
</style>
