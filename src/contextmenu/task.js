import { formats } from "@/preset/formats";
const formatTypes = formats.map((f) => {
  return {
    labelKey: `${f.type}.name`,
    cmd: "convertTo",
    value: f.type,
  };
});

export const taskItems = [
  {
    labelKey: "tasks.outputSetting",
    icon: "setting",
    cmd: "outputSetting",
  },
  {
    labelKey: "tasks.editImage",
    icon: "editimage",
    cmd: "editImage",
  },
  {
    labelKey: "tasks.viewSourceFile",
    icon: "openfile",
    cmd: "viewSourceFile",
  },
  {
    labelKey: "tasks.viewOutputFile",
    icon: "openfile",
    cmd: "viewOutputFile",
  },
  {
    labelKey: "tasks.imageFileInfo",
    submenu: [
      {
        labelKey: "tasks.viewSourceFile",
        icon: "imagefileinfo",
        cmd: "viewSourceFileInfo",
      },
      {
        labelKey: "tasks.viewOutputFile",
        icon: "imagefileinfo",
        cmd: "viewOutputFileInfo",
      },
    ],
  },
  {
    type: "separator",
  },
  {
    labelKey: "tasks.openSourceFolder",
    icon: "folderopened",
    cmd: "openSourceFolder",
  },
  {
    labelKey: "tasks.openOutputFolder",
    icon: "folderopened",
    cmd: "openOutputFolder",
  },
  {
    type: "separator",
  },
  {
    labelKey: "tasks.removeTask",
    icon: "removetask",
    cmd: "removeTask",
  },
  {
    labelKey: "tasks.resetTaskState",
    icon: "resettaskstate",
    cmd: "resetTaskState",
  },
  {
    labelKey: "tasks.clearTaskList",
    icon: "cleartasks",
    cmd: "clearTaskList",
  },
  {
    type: "separator",
  },
  {
    labelKey: "tasks.convertTo",
    submenu: formatTypes,
  },
  {
    type: "separator",
  },
  {
    labelKey: "tasks.selectAll",
    icon: "selectall",
    cmd: "selectAll",
  },
  {
    labelKey: "tasks.invertSelection",
    icon: "invertselection",
    cmd: "invertSelection",
  },
];

export const multiTasksItems = [
  {
    labelKey: "tasks.outputSetting",
    icon: "setting",
    cmd: "outputSetting",
  },
  {
    type: "separator",
  },
  {
    labelKey: "tasks.removeTask",
    icon: "removetask",
    cmd: "removeTask",
  },
  {
    labelKey: "tasks.resetTaskState",
    icon: "resettaskstate",
    cmd: "resetTaskState",
  },
  {
    labelKey: "tasks.clearTaskList",
    icon: "cleartasks",
    cmd: "clearTaskList",
  },
  {
    type: "separator",
  },
  {
    labelKey: "tasks.convertTo",
    submenu: formatTypes,
  },
  {
    type: "separator",
  },
  {
    labelKey: "tasks.selectAll",
    icon: "selectall",
    cmd: "selectAll",
  },
  {
    labelKey: "tasks.invertSelection",
    icon: "invertselection",
    cmd: "invertSelection",
  },
];
