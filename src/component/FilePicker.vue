<template>
  <div style="width: 100%">
    <el-input
      :model-value="value"
      :placeholder="placeholder"
      @change="
        $emit('update:modelValue', value);
        $emit('change', value);
      "
      @input="value = $event"
      class="file-picker"
      :class="{ dragenter }"
      @dragenter="dragenter = true"
      @dragleave="dragenter = false"
      @drop.prevent.stop="onDrop"
    >
      <template #append>
        <el-button :icon="FolderOpened" @click="onOpenDialog" />
      </template>
    </el-input>
  </div>
</template>

<script>
import fs from "fs-extra";
import { shallowRef } from "vue";
import { FolderOpened } from "@element-plus/icons-vue";
import { showOpenDialog } from "nwjs-dialog";

export default {
  name: "FilePicker",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    rule: {
      type: Function,
    },
    handleOpen: {
      type: Function,
    },
    handleDrop: {
      type: Function,
    },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      FolderOpened: shallowRef(FolderOpened),
      value: "",
      dragenter: false,
    };
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(value) {
        this.value = value;
      },
    },
  },
  methods: {
    onOpenDialog() {
      const { options } = this;
      if (options.nwdirectorydescKey) {
        options.nwdirectorydesc = this.$t(options.nwdirectorydescKey);
      }
      showOpenDialog(options).then(([filePath]) => {
        if (this.handleOpen) this.handleOpen(filePath);
        else {
          this.$emit("update:modelValue", filePath);
          this.$emit("change", filePath);
        }
      });
    },
    onDrop(e) {
      this.dragenter = false;
      const filePath = e.dataTransfer.files[0].path;
      const { nwdirectory } = this.options;
      const isDir = fs.statSync(filePath).isDirectory();
      if ((nwdirectory && !isDir) || (!nwdirectory && isDir)) return;
      if (this.rule && !this.rule(filePath)) return;
      if (this.handleDrop) this.handleDrop(filePath);
      else {
        this.$emit("update:modelValue", filePath);
        this.$emit("change", filePath);
      }
    },
  },
};
</script>

<style>
.file-picker {
  cursor: default;
}

.file-picker .el-input-group__append:hover {
  --el-input-border-color: #c0c4cc;
  border-left: 1px solid #c0c4cc;
}

.file-picker.dragenter .el-input__wrapper {
  background-color: #f2f9ec;
  box-shadow: 0 0 0 1px #83bf4c inset;
}
</style>
