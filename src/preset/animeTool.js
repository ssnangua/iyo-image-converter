export default {
  type: "animeTool",
  editor: {
    options: [
      {
        key: "transparent",
        type: "boolean",
        default: false,
      },
      {
        key: "background",
        type: "color",
        default: "",
        showAlpha: false,
        lockWhen: ({ transparent, resizeType, fit }) =>
          transparent || (resizeType === "zoom" && fit !== "contain"),
      },
      {
        key: "resizeTo",
        type: "radio",
        default: "largestFrame",
        options: [
          { labelKey: "animeTool.largestFrame", value: "largestFrame" },
          { labelKey: "animeTool.smallestFrame", value: "smallestFrame" },
          { labelKey: "animeTool.customSize", value: "customSize" },
        ],
      },
      {
        key: "resizeType",
        type: "radio",
        default: "zoom",
        options: [
          { labelKey: "animeTool.zoom", value: "zoom" },
          { labelKey: "animeTool.crop", value: "crop" },
        ],
      },
      {
        key: "fit",
        type: "fitMode",
        default: "contain",
        forceSize: true,
        lockWhen: (value) => value.resizeType !== "zoom",
      },
      {
        key: "kernel",
        type: "select",
        default: "lanczos3",
        options: [
          {
            label: "Nearest",
            value: "nearest",
          },
          {
            label: "Cubic",
            value: "cubic",
          },
          {
            label: "Mitchell",
            value: "mitchell",
          },
          {
            label: "Lanczos2",
            value: "lanczos2",
          },
          {
            label: "Lanczos3",
            value: "lanczos3",
          },
        ],
        lockWhen: (value) => value.resizeType !== "zoom",
      },
      {
        key: "colorFormat",
        type: "radio",
        default: "rgb565",
        options: [
          {
            label: "rgb565",
            value: "rgb565",
            descKey: "colorFormat.rgb565",
          },
          {
            label: "rgb444",
            value: "rgb444",
            descKey: "colorFormat.rgb444",
          },
          {
            label: "rgba4444",
            value: "rgba4444",
            descKey: "colorFormat.rgb4444",
          },
        ],
      },
      {
        key: "maxColors",
        type: "number",
        default: 256,
        step: 1,
        min: 1,
        max: 256,
      },
    ],
  },
};
