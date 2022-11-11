import Contextmenu from "@/util/contextmenu";

const rowItems = [
  {
    labelKey: "pdfTool.removeImages",
    icon: "remove",
    cmd: "remove",
    key: "Delete",
  },
  {
    labelKey: "pdfTool.clearList",
    icon: "clear",
    cmd: "clear",
  },
  {
    type: "separator",
  },
  {
    labelKey: "pdfTool.selectAll",
    icon: "selectall",
    cmd: "selectAll",
    modifiers: "ctrl",
    key: "a",
  },
  {
    labelKey: "pdfTool.invertSelection",
    icon: "invertselection",
    cmd: "invertSelection",
  },
];

export const rowMenu = new Contextmenu(rowItems);
