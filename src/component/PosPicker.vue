<template>
  <div class="pos-picker">
    <div
      v-for="pos in options"
      :key="pos"
      class="pos"
      :class="[
        pos,
        modelValue === pos ? 'selected' : '',
        pos === 'random' || pos === 'repeat' ? 'with-label' : '',
      ]"
      @click="
        $emit('update:modelValue', pos);
        $emit('change', pos);
      "
    >
      <span v-if="pos === 'random'">{{ $t("posPicker.random") }}</span>
      <span v-else-if="pos === 'repeat'">{{ $t("posPicker.repeat") }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "PosPicker",
  props: ["modelValue"],
  emits: ["update:modelValue", "change"],
  data() {
    return {
      options: [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "center",
        "random",
        "repeat",
      ],
    };
  },
};
</script>

<style scoped>
.pos-picker {
  position: relative;
  width: 150px;
  height: 100px;
  background-color: #f0f2f5;
  border: 1.5px solid #dcdfe6;
}
.pos-picker .pos {
  position: absolute;
  width: 50px;
  height: 20px;
  /* background-color: #ebedf0; */
  background-color: #f0f2f5;
  border: 1.5px dashed #dcdfe6;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
}
.pos-picker .pos:hover {
  background-color: #a0cfff;
  border-color: #409eff;
}
.pos-picker .pos.selected {
  background-color: #a0cfff;
  border-color: #409eff;
  border-style: solid;
}
.pos.top-left {
  top: 5px;
  left: 5px;
}
.pos.top-right {
  top: 5px;
  right: 5px;
}
.pos.bottom-left {
  bottom: 5px;
  left: 5px;
}
.pos.bottom-right {
  bottom: 5px;
  right: 5px;
}
.pos.center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.pos.with-label {
  width: initial;
  min-width: 50px;
  text-align: center;
  line-height: 20px;
  padding: 0 5px;
  white-space: nowrap;
}
.pos.repeat {
  top: 0;
  left: 180px;
}
.pos.random {
  top: 30px;
  left: 180px;
}
.disabled .pos.selected {
  opacity: 0.2;
  filter: grayscale(1);
}
</style>
