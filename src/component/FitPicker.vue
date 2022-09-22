<template>
  <el-select :placeholder="$t('fit.fit')">
    <el-option
      v-for="item in options"
      :key="item"
      :label="$t(`fit.${item}`)"
      :value="item"
    >
      <span style="float: left">{{ $t(`fit.${item}`) }}</span>
      <span style="float: right" class="fit-mode" :class="item">{{ item.value }}</span>
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: "FitPicker",
  props: {
    forceSize: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      options: ["cover", "contain", "fill", "inside", "outside"].slice(
        0,
        this.forceSize ? 3 : 5
      ),
    };
  },
};
</script>

<style>
.el-select-dropdown__item {
  padding: 0 20px;
}
.fit-mode {
  display: inline-block;
  width: 32px;
  height: 32px;
  background-image: url(@/assets/fit-mode.png);
  background-size: 160px 32px;
  margin-left: 20px;
}
.fit-mode.cover {
  background-position-x: 0;
}
.fit-mode.contain {
  background-position-x: -32px;
}
.fit-mode.fill {
  background-position-x: -64px;
}
.fit-mode.inside {
  background-position-x: -96px;
}
.fit-mode.outside {
  background-position-x: -128px;
}
</style>
