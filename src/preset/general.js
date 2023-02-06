/**
 * General Options
 */
import sharp from "sharp";

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
        key: "afterProcessing",
        type: "select",
        default: "none",
        options: [
          {
            labelKey: "general.afterProcessingOptions.none",
            value: "none",
          },
          {
            labelKey: "general.afterProcessingOptions.deleteSourceFile",
            value: "deleteSourceFile",
          },
          {
            labelKey: "general.afterProcessingOptions.moveSourceFileToTrash",
            value: "moveSourceFileToTrash",
          },
        ],
      },
      {
        key: "skipSameFormat",
        type: "boolean",
        default: false,
      },
      {
        key: "concurrently",
        type: "number",
        default: 1,
        step: 1,
        min: 1,
        max: sharp.concurrency(),
        hideIfTask: true,
      },
      {
        key: "timeout",
        type: "number",
        input: true,
        default: 60,
        step: 1,
        min: 0,
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
        key: "keepDirectoryStructure",
        type: "boolean",
        default: true,
        hideIfTask: true,
        lockWhen: (value) => !value.readFolders || !value.outputFolder.trim(),
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
      {
        key: "showTaskPreview",
        type: "boolean",
        default: true,
        hideIfTask: true,
      },
    ],
  },
};
