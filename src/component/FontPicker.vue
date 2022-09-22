<template>
  <el-select :placeholder="$t('fit.fit')">
    <el-option v-for="item in fontList" :key="item" :label="item" :value="item">
      <span :style="{ 'font-family': item }">{{ item }}</span>
    </el-option>
  </el-select>
</template>

<script>
import { listFont } from "@/util/shell";

let fontList;
const listFontPromise = listFont()
  .then((fonts) => {
    fonts.sort();
    fontList = fonts;
    return fonts;
  })
  .catch(() => (fontList = ["Arial"]));

export default {
  name: "FontPicker",
  data() {
    return {
      fontList: fontList || ["Arial"],
    };
  },
  created() {
    if (!fontList) {
      listFontPromise.then((fontList) => (this.fontList = fontList));
    }
  },
};
</script>

<style>
/* .el-select-dropdown__item {
  padding: 0 20px;
} */
</style>
