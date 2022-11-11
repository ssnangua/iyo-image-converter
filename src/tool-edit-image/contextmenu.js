import Contextmenu from "@/util/contextmenu";

const cropSizes = [
  { labelKey: "editImage.originalSize", value: "original" },
  { label: "120 × 90", value: [120, 90] },
  { label: "160 × 120", value: [160, 120] },
  { label: "200 × 150", value: [200, 150] },
  { label: "320 × 240", value: [320, 240] },
  { label: "640 × 480", value: [640, 480] },
  { label: "800 × 600", value: [800, 600] },
  { label: "1024 × 768", value: [1024, 768] },
  { label: "1200 × 900", value: [1200, 900] },
  { label: "1280 × 800", value: [1280, 800] },
  { label: "1280 × 1024", value: [1280, 1024] },
  { label: "1366 × 768", value: [1366, 768] },
  { label: "1600 × 1200", value: [1600, 1200] },
  { label: "1920 × 1080", value: [1920, 1080] },
  { label: "2048 × 1536", value: [2048, 1536] },
  { label: "3200 × 1800", value: [3200, 1800] },
  { label: "3840 × 2160", value: [3840, 2160] },
  { label: "25 %", value: 0.25 },
  { label: "33 %", value: 1 / 3 },
  { label: "50 %", value: 0.5 },
  { label: "67 %", value: 2 / 3 },
  { label: "75 %", value: 0.75 },
  { label: "100 %", value: 1 },
];

export const cropSizesMenu = new Contextmenu(cropSizes);
