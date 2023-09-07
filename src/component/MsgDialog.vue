<template>
  <el-dialog class="msg-dialog">
    <div v-if="message">
      <div style="line-height: 36px">
        <el-icon
          v-if="type === 'info'"
          color="#909399"
          style="font-size: 36px; float: left; margin-right: 10px"
        >
          <InfoFilled />
        </el-icon>
        <el-icon
          v-else-if="type === 'warning'"
          color="#E6A23C"
          style="font-size: 36px; float: left; margin-right: 10px"
        >
          <WarningFilled />
        </el-icon>
        <el-icon
          v-else-if="type === 'error'"
          color="#F56C6C"
          style="font-size: 36px; float: left; margin-right: 10px"
        >
          <CircleCloseFilled />
        </el-icon>
        <el-icon
          v-else-if="type === 'success'"
          color="#67C23A"
          style="font-size: 36px; float: left; margin-right: 10px"
        >
          <SuccessFilled />
        </el-icon>
        {{ message }}
      </div>
    </div>
    <slot></slot>
    <template #footer>
      <div style="text-align: right">
        <el-checkbox
          v-if="checkboxText"
          :model-value="checked"
          :label="checkboxText"
          @change="$emit('checked-change')"
          style="float: left"
        />
        <slot name="footer" style="float: left"></slot>
        <el-button
          v-if="showConfirmButton"
          ref="confirm"
          type="primary"
          @click="$emit('confirm')"
        >
          {{ confirmText || $t("message.confirm") }}
        </el-button>
        <el-button
          v-if="showCancelButton"
          ref="cancel"
          @click="$emit('cancel')"
        >
          {{ cancelText || $t("message.cancel") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import {
  InfoFilled,
  WarningFilled,
  CircleCloseFilled,
  SuccessFilled,
} from "@element-plus/icons-vue";

export default {
  name: "MsgDialog",
  components: {
    InfoFilled,
    WarningFilled,
    CircleCloseFilled,
    SuccessFilled,
  },
  props: {
    type: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    checkboxText: {
      type: String,
      default: "",
    },
    checked: {
      type: Boolean,
      default: false,
    },
    showConfirmButton: {
      type: Boolean,
      default: true,
    },
    showCancelButton: {
      type: Boolean,
      default: true,
    },
    confirmText: {
      type: String,
      default: "",
    },
    cancelText: {
      type: String,
      default: "",
    },
  },
  emits: ["checked-change", "confirm", "cancel"],
  methods: {
    autofocus() {
      const button = this.$refs.confirm || this.$refs.cancel;
      if (button) button.$el.focus();
    },
  },
};
</script>

<style>
.msg-dialog {
  width: 400px;
}
.msg-dialog .el-dialog__body {
  padding: 10px 20px 0;
}
.msg-dialog .el-button {
  min-width: 60px;
}
</style>
