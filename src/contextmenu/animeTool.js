export const zoomValues = [
  { label: "100 %", value: 1 },
  { type: "separator" },
  { label: "10 %", value: 0.1 },
  { label: "25 %", value: 0.25 },
  { label: "50 %", value: 0.5 },
  { label: "75 %", value: 0.75 },
  { label: "100 %", value: 1 },
  { label: "125 %", value: 1.25 },
  { label: "150 %", value: 1.5 },
  { label: "175 %", value: 1.75 },
  { label: "200 %", value: 2 },
  { label: "300 %", value: 3 },
  { label: "400 %", value: 4 },
  { label: "500 %", value: 5 },
  { label: "750 %", value: 7.5 },
  { label: "1000 %", value: 10 },
];

export const sizeValues = [
  { label: "× 2", value: 2 },
  { label: "× 0.5", value: 0.5 },
  { type: "separator" },
  { label: "120 × 90", value: [120, 90] },
  { label: "160 × 120", value: [160, 120] },
  { label: "200 × 150", value: [200, 150] },
  { label: "320 × 240", value: [320, 240] },
  { label: "640 × 480", value: [640, 480] },
  { label: "800 × 600", value: [800, 600] },
  { type: "separator" },
  { label: "90 × 120", value: [90, 120] },
  { label: "120 × 160", value: [120, 160] },
  { label: "150 × 200", value: [150, 200] },
  { label: "240 × 320", value: [240, 320] },
  { label: "480 × 640", value: [480, 640] },
  { label: "600 × 800", value: [600, 800] },
  { type: "separator" },
  { labelKey: "animeTool.other", value: "other" },
];

export const delayValues = [
  { label: "× 2", value: 2, multiple: true },
  { label: "× 0.5", value: 0.5, multiple: true },
  { type: "separator" },
  { labelKey: "animeTool.noDelay", value: 0 },
  { labelKey: "animeTool.pointOneSeconds", value: 100 },
  { label: "0.017 (60 fps)", value: 17 },
  { type: "separator" },
  { label: "0.02", value: 20 },
  { label: "0.05", value: 50 },
  { label: "0.1", value: 100 },
  { label: "0.2", value: 200 },
  { label: "0.5", value: 500 },
  { label: "1.0", value: 1000 },
  { label: "2.0", value: 2000 },
  { label: "5.0", value: 5000 },
  { type: "separator" },
  { labelKey: "animeTool.other", value: "other" },
];

export const loopValues = [
  { labelKey: "animeTool.once", value: 1 },
  { labelKey: "animeTool.threeTimes", value: 3 },
  { labelKey: "animeTool.forever", value: 0 },
  { type: "separator" },
  { labelKey: "animeTool.other", value: "other" },
];

export const insertTo = [
  {
    labelKey: "animeTool.insertEnd",
    value: "insertEnd",
    modifiers: "ctrl",
    key: "o",
  },
  { labelKey: "animeTool.insertFront", value: "insertFront" },
  { labelKey: "animeTool.insertAfter", value: "insertAfter" },
  { labelKey: "animeTool.insertBefore", value: "insertBefore" },
];

export const deleteFrames = [
  { labelKey: "animeTool.deleteFrames", value: "deleteFrames", key: "Delete" },
  { labelKey: "animeTool.deleteAll", value: "deleteAll" },
];

export const frameItem = [
  { labelKey: "animeTool.deleteFrames", value: "delete", key: "Delete" },
  { type: "separator" },
  { labelKey: "animeTool.moveFront", value: "moveFront" },
  { labelKey: "animeTool.moveEnd", value: "moveEnd" },
  { type: "separator" },
  { labelKey: "animeTool.reverseFrames", value: "reverse" },
  { type: "separator" },
  { labelKey: "animeTool.saveAs", value: "saveAs" },
  { type: "separator" },
  {
    labelKey: "animeTool.selectAll",
    value: "selectAll",
    modifiers: "ctrl",
    key: "a",
  },
];

export const saveTypes = [
  { labelKey: "animeTool.gifFormat", value: "gif" },
  { labelKey: "animeTool.webpFormat", value: "webp" },
  { labelKey: "animeTool.apngFormat", value: "png" },
];
