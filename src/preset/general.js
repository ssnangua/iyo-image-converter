/**
 * General Options
 */
export default {
  type: "general",
  editor: {
    options: [
      {
        key: "output",
        type: "divider",
      },
      {
        key: "outputFolder",
        type: "file",
        default: "",
        dialog: {
          nwdirectorydescKey: "general.chooseOutputFolder",
          nwdirectory: true,
        },
      },
      {
        key: "appendFilename",
        type: "string",
        default: "",
      },
      {
        key: "overwriteOutputFile",
        type: "boolean",
        default: false,
      },
      {
        key: "animatedImage",
        type: "divider",
      },
      {
        key: "outputAnimated",
        type: "boolean",
        default: true,
      },
      {
        key: "extractFrames",
        type: "radio",
        default: "allFrames",
        options: [
          { labelKey: "general.firstFrame", value: "firstFrame" },
          { labelKey: "general.allFrames", value: "allFrames" },
        ],
      },
      {
        key: "newFolder",
        type: "boolean",
        default: true,
        lockWhen: (value) => value.extractFrames === "firstFrame",
      },
      {
        key: "input",
        type: "divider",
        hideIfTask: true,
      },
      {
        key: "readFolders",
        type: "boolean",
        default: false,
        hideIfTask: true,
      },
      {
        key: "gui",
        type: "divider",
        hideIfTask: true,
      },
      {
        key: "completeNotify",
        type: "boolean",
        default: true,
        hideIfTask: true,
      },
      {
        key: "showTaskIndex",
        type: "boolean",
        default: false,
        hideIfTask: true,
      },
    ],
  },
};
