import i18n, { locales } from "@/i18n";
import { watch } from "vue";

const items = [
  {
    labelKey: "menubar.file.file",
    submenu: [
      {
        labelKey: "menubar.file.exit",
        icon: "exit",
        cmd: "exit",
      },
    ],
  },
  {
    labelKey: "menubar.option.option",
    submenu: [
      {
        labelKey: "menubar.option.locale",
        icon: "language",
        submenu: locales.map((locale) => {
          return {
            labelKey: locale.value,
            label: locale.label,
            cmd: "locale",
            value: locale.value,
          };
        }),
      },
      {
        type: "separator",
      },
      {
        labelKey: "menubar.option.option",
        icon: "setting",
        cmd: "option",
      },
    ],
  },
  {
    labelKey: "menubar.tools.tools",
    submenu: [
      {
        labelKey: "editImage.title",
        icon: "editimage",
        cmd: "editImage",
      },
      {
        labelKey: "filterTool.title",
        icon: "filter",
        cmd: "filterTool",
      },
      {
        labelKey: "animeTool.title",
        icon: "anime",
        cmd: "animeTool",
      },
      {
        labelKey: "icoTool.title",
        icon: "ico",
        cmd: "icoTool",
      },
      {
        labelKey: "pdfTool.title",
        icon: "pdf",
        cmd: "pdfTool",
      },
      {
        labelKey: "mirageTank.title",
        icon: "mirage-tank",
        cmd: "mirageTank",
      },
    ],
  },
  {
    labelKey: "menubar.help.help",
    submenu: [
      {
        labelKey: "menubar.help.homePage",
        icon: "github",
        cmd: "homePage",
      },
      {
        type: "separator",
      },
      {
        labelKey: "menubar.help.about",
        icon: "icon",
        cmd: "about",
      },
    ],
  },
];

let handler = () => {};

function createMenu(items, option = { type: "contextmenu" }) {
  const menu = new nw.Menu(option);
  items.forEach((item) => {
    const option = { type: "normal", ...item };
    if (!option.label && option.labelKey) {
      option.label = i18n.global.t(option.labelKey);
    }
    if (option.label) option.label = " " + option.label;
    if (option.icon) {
      option.icon = `icons/${option.icon}.png`;
    }
    if (option.cmd) {
      option.click = () => handler(option);
      if (
        option.cmd === "locale" &&
        option.value === i18n.global.locale.value
      ) {
        option.icon = "icons/checked.png";
      }
    }
    if (option.submenu) {
      option.submenu = createMenu(option.submenu);
    }
    const menuItem = new nw.MenuItem(option);
    menu.append(menuItem);
  });
  return menu;
}

function init() {
  nw.Window.get().menu = createMenu(items, { type: "menubar" });
}

init();

watch(i18n.global.locale, () => {
  init();
});

export default {
  callback(cb) {
    handler = cb;
  },
};
