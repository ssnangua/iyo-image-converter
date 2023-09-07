import Contextmenu from "@/util/contextmenu";

const items = [
  {
    labelKey: "joinSplitTool.contextmenu.thisGroup",
    enabled: false,
  },
  {
    labelKey: "joinSplitTool.contextmenu.unjoin",
    cmd: "unjoinThisGroup",
  },
  {
    labelKey: "joinSplitTool.contextmenu.clearSplitLines",
    cmd: "clearThisGroupSplitLines",
  },
  {
    labelKey: "joinSplitTool.contextmenu.joinNextImage",
    cmd: "joinNextImage",
  },
  {
    labelKey: "joinSplitTool.contextmenu.selectBefore",
    cmd: "selectBeforeGroups",
  },
  {
    labelKey: "joinSplitTool.contextmenu.selectAfter",
    cmd: "selectAfterGroups",
  },
  {
    type: "separator",
  },
  {
    labelKey: "joinSplitTool.contextmenu.selectedGroups",
    enabled: false,
  },
  {
    labelKey: "joinSplitTool.contextmenu.unjoin",
    cmd: "unjoinSelectedGroups",
  },
  {
    labelKey: "joinSplitTool.contextmenu.clearSplitLines",
    cmd: "clearSelectedGroupsSplitLines",
  },
  {
    labelKey: "joinSplitTool.contextmenu.remove",
    cmd: "removeSelectedGroups",
    key: "Delete",
  },
  {
    labelKey: "joinSplitTool.contextmenu.selectAll",
    cmd: "selectAllGroups",
    modifiers: "ctrl",
    key: "a",
  },
  {
    labelKey: "joinSplitTool.contextmenu.invertSelection",
    cmd: "invertGroupsSelection",
  },
  {
    type: "separator",
  },
  {
    labelKey: "joinSplitTool.contextmenu.selectedImages",
    enabled: false,
  },
  {
    labelKey: "joinSplitTool.contextmenu.remove",
    cmd: "removeSelectedImages",
    modifiers: "alt",
    key: "Delete",
  },
  {
    labelKey: "joinSplitTool.contextmenu.selectAll",
    cmd: "selectAllImages",
    modifiers: "alt",
    key: "a",
  },
  {
    labelKey: "joinSplitTool.contextmenu.invertSelection",
    cmd: "invertImagesSelection",
  },
];

export default new Contextmenu(items);
