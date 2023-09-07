import { createApp } from "vue";
// element-ui
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// custom iconfont
import "@/assets/iconfont/iconfont.css";
// i18n
import i18n from "@/i18n";

export default (rootComponent, rootProps) => {
  const app = createApp(rootComponent, rootProps);
  app.use(i18n);
  app.use(ElementPlus);
  app.mount("#app");
  return app;
};
