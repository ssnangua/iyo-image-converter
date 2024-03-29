import { openAccept } from "@/util/imageFiles";

export default {
  type: "watermark",
  editor: {
    options: [
      {
        key: "enable",
        type: "boolean",
        default: false,
      },
      {
        key: "type",
        type: "radio",
        default: "text",
        options: [
          { labelKey: "watermark.typeText", value: "text" },
          { labelKey: "watermark.typeImage", value: "image" },
        ],
        lockWhen: (value) => value.enable === false,
      },
      {
        key: "text",
        type: "styled-text",
        default: "",
        lockWhen: (value) => value.enable === false,
        hideWhen: (value) => value.type !== "text",
      },
      {
        key: "image",
        type: "file",
        default: "",
        dialog: {
          accept: openAccept,
        },
        lockWhen: (value) => value.enable === false,
        hideWhen: (value) => value.type !== "image",
      },
      {
        key: "position",
        type: "pos",
        default: "top-left",
        lockWhen: (value) => value.enable === false,
      },
      {
        key: "marginX",
        type: "number",
        default: 0,
        input: true,
        step: 1,
        min: 0,
        max: 100000,
        lockWhen: (value) => value.enable === false,
      },
      {
        key: "marginY",
        type: "number",
        default: 0,
        input: true,
        step: 1,
        min: 0,
        max: 100000,
        lockWhen: (value) => value.enable === false,
      },
      {
        key: "opacity",
        type: "number",
        default: 1,
        step: 0.01,
        min: 0,
        max: 1,
        marks: { 0.1: "0.1", 0.2: "0.2", 0.5: "0.5", 0.75: "0.75" },
        lockWhen: (value) => value.enable === false,
      },
      {
        key: "angle",
        type: "number",
        default: 0,
        step: 1,
        min: -180,
        max: 180,
        marks: {
          "-135": "-135",
          "-90": "-90",
          "-45": "-45",
          0: "0",
          45: "45",
          90: "90",
          135: "135",
        },
        lockWhen: (value) => value.enable === false,
      },
    ],
  },
};
