<template>
  <div class="rect-input">
    <div class="rect-bound">
      <div class="box"></div>
      <div v-for="pos in options" :key="pos" :class="['pos', pos]">
        <!-- <div class="label">{{ $t("rectInput." + pos) }}</div> -->
        <el-input-number
          v-model="innerValue[pos]"
          :step="1"
          :step-strictly="true"
          :min="0"
          :max="100000"
          controls-position="right"
          :disabled="getDisabled(pos)"
          @change="
            $emit('update:modelValue', innerValue);
            $emit('change', innerValue);
          "
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RectInput",
  props: ["modelValue", "width", "height"],
  emits: ["update:modelValue", "change"],
  watch: {
    modelValue: {
      immediate: true,
      handler(value) {
        Object.assign(this.innerValue, value);
      },
    },
  },
  data() {
    return {
      innerValue: { top: 0, right: 0, bottom: 0, left: 0 },
      options: ["top", "right", "bottom", "left"],
    };
  },
  methods: {
    getDisabled(pos) {
      const { width, height } = this;
      const { top, right, bottom, left } = this.innerValue;
      return !!(
        (pos === "top" && bottom && height) ||
        (pos === "right" && left && width) ||
        (pos === "bottom" && top && height) ||
        (pos === "left" && right && width)
      );
    },
  },
};
</script>

<style scoped>
.rect-bound {
  position: relative;
  width: 250px;
  height: 132px;
  /* background-color: #f0f2f5; */
}
.rect-bound .box {
  position: absolute;
  top: 15px;
  right: 15px;
  bottom: 15px;
  left: 15px;
  border: 1.5px dashed #dcdfe6;
  /* background-color: #ffffff; */
}
.rect-bound .pos {
  position: absolute;
}
.rect-bound .pos .el-input-number {
  width: 100px;
}
.rect-bound .pos .label {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.5;
}
.pos.top {
  top: 0;
  left: 75px;
}
.pos.right {
  top: 50px;
  left: 150px;
}
.pos.bottom {
  top: 100px;
  left: 75px;
}
.pos.left {
  top: 50px;
  left: 0px;
}
</style>
