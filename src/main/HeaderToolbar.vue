<template>
  <div class="toolbar">
    <span>
      <el-button text @click="$emit('show-setting')">
        <i class="iconfont icon-setting"></i>
        {{ $t("toolbar.option") }}
      </el-button>
      <el-divider direction="vertical" />
      <el-button text @click="$emit('show-edit-image')">
        <img src="@/assets/editimage.png" class="button-icon" />
        <!-- <i class="iconfont icon-edit-image"></i> -->
        {{ $t("editImage.title") }}
      </el-button>
      <el-button
        text
        :icon="MoreFilled"
        @click="$emit('show-more-tools', $event)"
      ></el-button>
    </span>
    <span>
      <el-button text :disabled="processing" @click="$emit('add-tasks')"
        ><i class="iconfont icon-f-insert" style="font-size: 12px"></i
        >{{ $t("toolbar.add") }}</el-button
      >
      <el-divider direction="vertical" />
      <el-button
        text
        :disabled="!hasSelectedTask || processing"
        @click="$emit('remove-tasks')"
        ><i class="iconfont icon-f-remove" style="font-size: 12px"></i
        >{{ $t("toolbar.remove") }}</el-button
      >
      <el-button
        text
        :disabled="!hasTask || processing"
        @click="$emit('clear-tasks')"
        ><i class="iconfont icon-f-clear" style="font-size: 12px"></i
        >{{ $t("toolbar.clear") }}</el-button
      >
      <el-divider direction="vertical" />
      <el-button
        text
        type="danger"
        :disabled="!processing"
        @click="$emit('stop-convert')"
        class="stop"
        ><i class="iconfont icon-stop"></i>{{ $t("toolbar.stop") }}</el-button
      >
      <el-button
        text
        type="primary"
        :disabled="progress.processed >= progress.total || processing"
        @click="$emit('start-convert')"
        class="start"
        ><i class="iconfont icon-playfill"></i
        >{{ $t("toolbar.start") }}</el-button
      >
    </span>
  </div>
</template>

<script>
import { shallowRef } from "vue";
import {
  DocumentAdd,
  DocumentRemove,
  DocumentDelete,
  MoreFilled,
} from "@element-plus/icons-vue";

export default {
  name: "HeaderToolbar",
  props: {
    hasTask: Boolean,
    hasSelectedTask: Boolean,
    progress: Object,
    processing: Boolean,
  },
  data() {
    return {
      DocumentAdd: shallowRef(DocumentAdd),
      DocumentRemove: shallowRef(DocumentRemove),
      DocumentDelete: shallowRef(DocumentDelete),
      MoreFilled: shallowRef(MoreFilled),
    };
  },
};
</script>

<style>
.toolbar {
  display: flex;
  justify-content: space-between;
  white-space: nowrap;
  overflow: hidden;
}

.toolbar .el-button {
  padding: 8px;
  cursor: default;
  /* border-radius: 0; */
}

.stop,
.start {
  font-weight: bold;
}

.el-button + .el-button {
  margin-left: 0;
}

.el-button.is-text:not(.is-disabled):focus {
  --el-fill-color-light: var(--el-transfer-border-color);
}

.el-button.is-text:not(.is-disabled):hover {
  --el-fill-color-light: #dcdfe6;
}

.el-button.is-text:not(.is-disabled):active {
  --el-fill-color: #cdd0d6;
}

.iconfont {
  margin-right: 6px;
}
.button-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  image-rendering: pixelated;
}
</style>
