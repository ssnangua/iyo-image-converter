<template>
  <el-scrollbar>
    <div class="icon-list">
      <AsideFormatIcon
        v-for="format in formats"
        :key="format.type"
        :format="format"
        :selected="format.type === curFormat.type"
        @click="$emit('format-changed', format)"
        @contextmenu="onFormatContextmenu(format, $event)"
        @mouseenter="$emit('format-tips', format.type)"
        @mouseleave="$emit('format-tips', '')"
      />
    </div>
  </el-scrollbar>
</template>

<script>
import AsideFormatIcon from "./AsideFormatIcon.vue";
import { formatMenu } from "./contextmenu";

export default {
  name: "AsideFormats",
  components: {
    AsideFormatIcon,
  },
  props: {
    formats: Array,
    curFormat: Object,
  },
  methods: {
    onFormatContextmenu(format, $event) {
      this.$emit("format-changed", format);
      if (format.editor) {
        formatMenu.popup($event, ({ cmd }) => {
          // console.log(cmd, format);
          if (cmd === "globalSetting") {
            this.$emit("format-setting", format);
          }
        });
        $event.preventDefault();
      }
    },
  },
};
</script>

<style scoped>
.icon-list {
  padding: 10px;
  /* text-align: center; */
}

.icon + .icon {
  margin-top: 5px;
}
</style>
