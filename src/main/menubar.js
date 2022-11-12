import path from "path";
import i18n, { locales } from "@/i18n";
import { watch } from "vue";

const platform = process.platform;
const isMac = platform === "darwin";

const cwd = process.cwd();
const getIcon = (icon) => path.join(cwd, icon);

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
        icon: isMac ? "" : "editimage",
        cmd: "editImage",
      },
      {
        labelKey: "filterTool.title",
        icon: isMac ? "" : "filter",
        cmd: "filterTool",
      },
      {
        labelKey: "animeTool.title",
        icon: isMac ? "" : "anime",
        cmd: "animeTool",
      },
      {
        labelKey: "icoTool.title",
        icon: isMac ? "" : "ico",
        cmd: "icoTool",
      },
      {
        labelKey: "pdfTool.title",
        icon: isMac ? "" : "pdf",
        cmd: "pdfTool",
      },
      {
        labelKey: "mirageTank.title",
        icon: isMac ? "" : "mirage-tank",
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

function createMenuItems(items) {
  return items.map((item) => {
    const option = { type: "normal", ...item };
    if (!option.label && option.labelKey) {
      option.label = i18n.global.t(option.labelKey);
    }
    if (option.label && !isMac) option.label = " " + option.label;
    if (option.cmd === "locale") {
      option.icon = getIcon(`icons/${platform}/unchecked.png`);
    } else if (option.icon) {
      option.icon = getIcon(`icons/${platform}/${option.icon}.png`);
    }
    if (option.cmd) {
      option.click = () => handler(option);
      if (
        option.cmd === "locale" &&
        option.value === i18n.global.locale.value
      ) {
        option.icon = getIcon(`icons/${platform}/checked.png`);
      }
    }
    if (option.submenu) {
      option.submenu = createMenu(option.submenu);
    }
    const menuItem = new nw.MenuItem(option);
    return menuItem;
  });
}

function createMenu(items, option = { type: "contextmenu" }) {
  const menu = new nw.Menu(option);
  createMenuItems(items).forEach((menuItem) => {
    menu.append(menuItem);
  });
  return menu;
}

function init() {
  if (platform === "darwin") {
    const appmenu = new nw.Menu({ type: "menubar" });
    appmenu.createMacBuiltin(i18n.global.t("appName"));
    const menuItems = createMenuItems(items);
    appmenu.insert(menuItems[1], 2); // option
    appmenu.insert(menuItems[2], 3); // tools
    appmenu.append(menuItems[3]); // help
    nw.Window.get().menu = appmenu;
  } else {
    const menubar = createMenu(items, { type: "menubar" });
    nw.Window.get().menu = menubar;
  }
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
