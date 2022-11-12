import Contextmenu from "@/util/contextmenu";
import { formats } from "@/preset/formats";

const isMac = process.platform === "darwin";
const moreToolsItems = [
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
];

/**
 * format
 */
const foramtItems = [
  {
    labelKey: "formats.globalSetting",
    icon: "setting",
    cmd: "globalSetting",
  },
];

/**
 * task
 */
const formatTypes = formats.map((f) => {
  return {
    labelKey: `${f.type}.name`,
    cmd: "convertTo",
    value: f.type,
  };
});

const taskItems = [
  {
    labelKey: "tasks.outputSetting",
    icon: "setting",
    cmd: "outputSetting",
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
    icon: "remove",
    cmd: "removeTask",
    key: "Delete",
  },
  {
    labelKey: "tasks.resetTaskState",
    icon: "reset",
    cmd: "resetTaskState",
  },
  {
    labelKey: "tasks.clearTaskList",
    icon: "clear",
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
    modifiers: "ctrl",
    key: "a",
  },
  {
    labelKey: "tasks.invertSelection",
    icon: "invertselection",
    cmd: "invertSelection",
  },
];

const multiTasksItems = [
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
    icon: "remove",
    cmd: "removeTask",
  },
  {
    labelKey: "tasks.resetTaskState",
    icon: "reset",
    cmd: "resetTaskState",
  },
  {
    labelKey: "tasks.clearTaskList",
    icon: "clear",
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
    modifiers: "ctrl",
    key: "a",
  },
  {
    labelKey: "tasks.invertSelection",
    icon: "invertselection",
    cmd: "invertSelection",
  },
];

/**
 * modifier
 */
const resizePixels = [
  { label: "120 × 90", value: [120, 90] },
  { label: "160 × 120", value: [160, 120] },
  { label: "200 × 150", value: [200, 150] },
  { label: "320 × 240", value: [320, 240] },
  { label: "400 × 300", value: [400, 300] },
  { label: "640 × 480", value: [640, 480] },
  { label: "800 × 600", value: [800, 600] },
  { label: "1024 × 600", value: [1024, 600] },
  { label: "1024 × 768", value: [1024, 768] },
  { label: "1200 × 900", value: [1200, 900] },
  { label: "1280 × 800", value: [1280, 800] },
  { label: "1280 × 1024", value: [1280, 1024] },
  { label: "1366 × 768", value: [1366, 768] },
  { label: "1440 × 900", value: [1440, 900] },
  { label: "1600 × 1200", value: [1600, 1200] },
  { label: "1920 × 1080", value: [1920, 1080] },
  { label: "2048 × 1536", value: [2048, 1536] },
  { label: "3200 × 1800", value: [3200, 1800] },
  { label: "3840 × 2160", value: [3840, 2160] },
];

const resizePercent = [
  { label: "25 %", value: [25, 25] },
  { label: "33 %", value: [33, 33] },
  { label: "50 %", value: [50, 50] },
  { label: "67 %", value: [67, 67] },
  { label: "75 %", value: [75, 75] },
  { label: "150 %", value: [150, 150] },
  { label: "200 %", value: [200, 200] },
  { label: "300 %", value: [300, 300] },
  { label: "400 %", value: [400, 400] },
  { label: "500 %", value: [500, 500] },
];

const rotateAngles = [
  { label: "-180", value: -180 },
  { label: "-135", value: -135 },
  { label: "-90", value: -90 },
  { label: "-45", value: -45 },
  { label: "0", value: 0 },
  { label: "45", value: 45 },
  { label: "90", value: 90 },
  { label: "135", value: 135 },
  { label: "180", value: 180 },
];

export const moreToolsMenu = new Contextmenu(moreToolsItems);

export const formatMenu = new Contextmenu(foramtItems);

export const taskMenu = new Contextmenu(taskItems);
export const multiTasksMenu = new Contextmenu(multiTasksItems);

export const pixelsMenu = new Contextmenu(resizePixels);
export const percentMenu = new Contextmenu(resizePercent);
export const anglesMenu = new Contextmenu(rotateAngles);
