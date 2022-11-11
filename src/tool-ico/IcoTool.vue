<template>
  <div class="window" :class="{ 'generator-mode': generatorMode }">
    <el-icon class="float-button" @click="generatorMode = !generatorMode">
      <CirclePlusFilled />
    </el-icon>

    <IcoViewer ref="viewer" />

    <IcoGenerator ref="generator" />
  </div>
</template>

<script>
import { CirclePlusFilled } from "@element-plus/icons-vue";
import { getSearches, handleDropFiles } from "@/util/util";
import IcoViewer from "./IcoViewer.vue";
import IcoGenerator from "./IcoGenerator.vue";

export default {
  name: "IcoTool",
  components: { CirclePlusFilled, IcoViewer, IcoGenerator },

  data() {
    return {
      generatorMode: false,
    };
  },

  methods: {
    updateLocale(locale) {
      this.$i18n.locale = locale;
      document.title = this.$t("icoTool.title");
    },
  },

  mounted() {
    const searches = getSearches();

    this.updateLocale(searches.locale);
    process.on("localeChange", this.updateLocale);
    window.addEventListener("beforeunload", () => {
      process.removeAllListeners("localeChange");
    });

    handleDropFiles(async (files) => {
      const ref = this.generatorMode ? "generator" : "viewer";
      this.$refs[ref].handleDropFiles(files);
    });
  },
};
</script>
import IcoGeneratorVue from "./icotool/IcoGenerator.vue"
