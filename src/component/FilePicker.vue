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
      clearable
      @clear="applyChange([], true)"
    >
      <template #append>
        <el-button :icon="FolderOpened" @click="onOpenDialog" />
      </template>
    </el-input>
  </div>
</template>

<script>
import fs from "fs-extra";
import path from "path";
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
    concat: {
      type: Boolean,
      default: false,
    },
    recursive: {
      type: Boolean,
      default: false,
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
        this.$emit("update:modelValue", value);
        this.$emit("change", value);
      },
    },
  },
  methods: {
    onOpenDialog() {
      const { options } = this;
      if (options.nwdirectorydescKey) {
        options.nwdirectorydesc = this.$t(options.nwdirectorydescKey);
      }
      showOpenDialog(options).then((files) => {
        this.applyChange(files);
      });
    },

    onDrop(e) {
      this.dragenter = false;
      const { nwdirectory } = this.options;
      const dirs = [];
      let files = Array.from(e.dataTransfer.files)
        .map((file) => file.path)
        .filter((file) => {
          const isDir = fs.statSync(file).isDirectory();
          if (isDir) dirs.push(file);
          if ((nwdirectory && !isDir) || (!nwdirectory && isDir)) return false;
          if (this.rule && !this.rule(file)) return false;
          return true;
        });
      if (this.options.multiple && this.recursive) {
        dirs.forEach((dir) => {
          files = files.concat(this.recursiveDir(dir));
        });
      }
      this.applyChange(files);
    },

    recursiveDir(dir) {
      let files = [];
      fs.readdirSync(dir).forEach((filename) => {
        const file = path.join(dir, filename);
        if (fs.statSync(file).isDirectory()) {
          files = files.concat(this.recursiveDir(file));
        } else {
          if (this.rule && !this.rule(file)) return false;
          files.push(file);
        }
      });
      return files;
    },

    applyChange(files, isClear = false) {
      const { multiple } = this.options;
      if (this.handleDrop) {
        this.handleDrop(multiple ? files : files[0] || "");
      } else {
        let value;
        if (multiple) {
          if (!isClear && this.concat && this.value.trim()) {
            files = this.value.trim().split("|").concat(files);
            files = Array.from(new Set(files));
          }
          value = files.join("|");
        } else {
          value = files[0] || "";
        }
        this.$emit("update:modelValue", value);
        this.$emit("change", value);
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
