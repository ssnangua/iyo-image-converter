import { createApp } from "vue";
// element-ui
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// custom iconfont
import "@/assets/iconfont/iconfont.css";
// i18n
import i18n from "@/i18n";
// vxe-table
import "xe-utils";
import VXETable from "vxe-table";
import "vxe-table/lib/style.css";
import VXETablePluginElement from "vxe-table-plugin-element";
import "vxe-table-plugin-element/dist/style.css";

VXETable.setup({
  // 对组件内置的提示语进行国际化翻译
  i18n: (key, args) => i18n.global.t(key, args),
});

VXETable.use(VXETablePluginElement);

export default (rootComponent, rootProps) => {
  const app = createApp(rootComponent, rootProps);
  app.use(i18n);
  app.use(ElementPlus);
  app.use(VXETable);
  app.mount("#app");
  return app;
};
