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
        key: "image",
        type: "file",
        default: "",
        dialog: {
          accept: openAccept,
        },
        lockWhen: (value) => value.enable === false,
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
    ],
  },
};
