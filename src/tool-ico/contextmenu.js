import Contextmenu from "@/util/contextmenu";

/**
 * viewer
 */
const viewerIconItems = [
  { labelKey: "icoTool.saveAs", value: "saveAs" },
  { type: "separator" },
  { labelKey: "icoTool.saveAll", value: "saveAll" },
];

const viewerListItems = [{ labelKey: "icoTool.saveAll", value: "saveAll" }];

/**
 * generator
 */
const generatorIconItems = [
  { labelKey: "icoTool.delete", value: "delete", key: "Delete" },
  { type: "separator" },
  { labelKey: "icoTool.openImages", value: "openImages" },
  { type: "separator" },
  { labelKey: "icoTool.deleteAll", value: "deleteAll" },
];

const generatorListItems = [
  { labelKey: "icoTool.openImages", value: "openImages" },
  { type: "separator" },
  { labelKey: "icoTool.deleteAll", value: "deleteAll" },
];
const generatorListItemsNoData = [
  { labelKey: "icoTool.openImages", value: "openImages" },
];

export const iconSizesItems = [
  { label: "8 × 8", value: 8 },
  { label: "10 × 10", value: 10 },
  { label: "14 × 14", value: 14 },
  { label: "16 × 16", value: 16 },
  { label: "24 × 24", value: 24 },
  { label: "32 × 32", value: 32 },
  { label: "40 × 40", value: 40 },
  { label: "48 × 48", value: 48 },
  { label: "64 × 64", value: 64 },
  { label: "72 × 72", value: 72 },
  { label: "80 × 80", value: 80 },
  { label: "96 × 96", value: 96 },
  { label: "128 × 128", value: 128 },
  { label: "256 × 256", value: 256 },
];

export const vIconMenu = new Contextmenu(viewerIconItems);
export const vListMenu = new Contextmenu(viewerListItems);

export const gIconMenu = new Contextmenu(generatorIconItems);
export const gListMenu = new Contextmenu(generatorListItems);
export const gIconSizesMenu = new Contextmenu(iconSizesItems);
export const gListMenuNoData = new Contextmenu(generatorListItemsNoData);
