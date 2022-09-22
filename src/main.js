import { createApp } from "vue";
// element-ui
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// custom iconfont
import "./assets/iconfont/iconfont.css";
// vxe-table
import "xe-utils";
import VXETable from "vxe-table";
import "vxe-table/lib/style.css";
import VXETablePluginElement from "vxe-table-plugin-element";
import "vxe-table-plugin-element/dist/style.css";
// i18n
import i18n from "./i18n";
// App
import Main from "./Main.vue";

VXETable.use(VXETablePluginElement);

const app = createApp(Main);
app.use(i18n);
app.use(ElementPlus);
app.use(VXETable);
app.mount("#app");
