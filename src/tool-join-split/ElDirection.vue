<template>
  <el-button-group>
    <el-button
      :type="modelValue === 'horizontal' ? 'primary' : ''"
      :disabled="disabled"
      :title="$t('joinSplitTool.horizontal')"
      @click="$emit('update:modelValue', 'horizontal')"
    >
      <i class="iconfont icon-paging" style="transform: rotate(90deg)"></i>
    </el-button>
    <el-button
      :type="modelValue === 'vertical' ? 'primary' : ''"
      :disabled="disabled"
      :title="$t('joinSplitTool.vertical')"
      @click="$emit('update:modelValue', 'vertical')"
    >
      <i class="iconfont icon-paging"></i>
    </el-button>
  </el-button-group>
</template>

<script>
export default {
  name: "ElDirection",
  props: {
    modelValue: String, // "horizontal"|"vertical"
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
};
</script>
