<template>
  <el-badge
    :type="badgeType"
    :value="count"
    :max="999"
    :hidden="disabled || count === 0"
  >
    <el-button :type="buttonType" @click="$emit('click')" :disabled="disabled">
      {{ label }}
    </el-button>
  </el-badge>
</template>

<script>
export default {
  name: "BadgeButton",
  props: {
    badgeType: {
      type: String,
      default: "info",
    },
    buttonType: {
      type: String,
      default: "primary",
    },
    label: String,
    count: Number,
    max: {
      type: Number,
      default: 999,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click"],
};
</script>

<style>
.el-badge__content.is-fixed {
  right: initial;
  left: calc(var(--el-badge-size) / 2);
  transform: translateY(-50%) translateX(-100%);
}
</style>
