import path from "path";
import i18n from "@/i18n";
import { watch } from "vue";

const platform = process.platform;
const isMac = platform === "darwin";

const cwd = process.cwd();
const getIcon = (icon) => path.join(cwd, icon);

window.addEventListener("contextmenu", (e) => {
  if (e.target.tagName !== "INPUT") {
    e.preventDefault();
    return false;
  }
});

export default class {
  constructor(items) {
    this.items = items;
    this.update();

    watch(i18n.global.locale, () => {
      this.update();
    });
  }
  update() {
    this.cmdMap = {};
    this.menu = this.getMenu(this.items);
  }
  popup(e, callback, enabledMap, data) {
    if (enabledMap) {
      Object.entries(enabledMap).forEach(([cmd, enabled]) => {
        const { item, menuItem } = this.cmdMap[cmd];
        menuItem.enabled = enabled;
        if (item.icon) {
          const off = enabled ? "" : "-off";
          const icon = `icons/${platform}/${item.icon}${off}.png`;
          menuItem.icon = getIcon(icon);
        }
      });
    }
    this.data = data;
    this.callback = callback;
    this.menu.popup(e.clientX, e.clientY);
  }
  getMenu(items) {
    return this.createMenu(
      items.map((item) => {
        const option = { type: "normal", ...item };
        if (!item.label && item.labelKey) {
          option.label = i18n.global.t(item.labelKey);
        }
        if (item.icon) {
          if (option.label && !isMac) option.label = " " + option.label;
          option.icon = getIcon(`icons/${platform}/${item.icon}.png`);
        }
        option.click = () => this.callback(item, this.data);
        if (item.submenu) {
          option.submenu = this.getMenu(item.submenu);
        }
        return { item, option };
      })
    );
  }
  createMenu(items) {
    const menu = new nw.Menu({ type: "contextmenu" });
    items.forEach(({ item, option }) => {
      const menuItem = new nw.MenuItem(option);
      if (item.cmd) this.cmdMap[item.cmd] = { item, menuItem };
      menu.append(menuItem);
    });
    return menu;
  }
}
