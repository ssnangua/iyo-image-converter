<template>
  <div class="color-picker">
    <el-input
      :model-value="value"
      @change="
        $emit('update:modelValue', value);
        $emit('change', value);
      "
      @input="value = $event"
      clearable
      @clear="
        $emit('update:modelValue', '');
        $emit('change', '');
      "
    >
      <template #prepend>
        <el-color-picker
          ref="colorPicker"
          :model-value="modelValue"
          @change="
            $emit('update:modelValue', $event);
            $emit('change', $event);
          "
          :predefine="predefine"
          :show-alpha="showAlpha"
          :key="showAlpha ? 1 : 0"
          size="small"
        />
      </template>
    </el-input>
  </div>
</template>

<script>
export default {
  name: "ColorPicker",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    showAlpha: {
      type: Boolean,
      default: false,
    },
    predefine: {
      type: Array,
      default: () => ["#FFFFFF", "#000000"],
    },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      value: "",
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
};
</script>

<style>
.color-picker {
  display: inline-block;
}
.color-picker .el-input-group__prepend {
  padding: 0 4px;
}
.color-picker .el-color-picker__trigger {
  border: none;
}
.el-color-predefine__color-selector {
  outline: 1px solid #a8abb2;
}
.el-color-dropdown__btns {
  margin-top: 0;
}
</style>
