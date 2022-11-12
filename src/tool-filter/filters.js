import fs from "fs-extra";
import path from "path";
import { messages } from "@/i18n";

export function clearCache() {
  for (let module in global.require.cache) {
    if (/filters/.test(module)) {
      delete global.require.cache[module];
    }
  }
}
clearCache();

function isFilterFile(path) {
  return fs.statSync(path).isFile() && /\.js$/i.test(path);
}
function isFilter(module) {
  return typeof module.en === "object" && typeof module.filters === "object";
}

const filtersPath = path.join(process.cwd(), "filters");
export const filters = {};
export const filterGroups = [];
fs.readdirSync(filtersPath).forEach((file) => {
  const groupName = path.parse(file).name;
  const filterPath = path.join(filtersPath, file);
  if (!isFilterFile(filterPath)) return;
  try {
    const module = nw.require(filterPath);
    if (!isFilter(module)) return;
    // console.log(module);
    module.labelKey = `filters.${groupName}.label`;
    for (let filterName in module.filters) {
      const filterKey = `${groupName}.${filterName}`;
      const filter = module.filters[filterName]; // { options, handler}
      Object.assign(filter, {
        groupName,
        filterName,
        filterKey,
        labelKey: `filters.${groupName}.${filterName}.label`,
        path: filterPath,
      });
      for (let locale in messages) {
        if (module[locale]) {
          if (!messages[locale].filters) messages[locale].filters = {};
          messages[locale].filters[groupName] = module[locale];
        }
      }
      const defaultSetting = {};
      if (filter.options) {
        for (let option of filter.options) {
          defaultSetting[option.key] = option.default;
          if (option.options) {
            for (let item of option.options) {
              item.labelKey = `filters.${groupName}.${filterName}.${item.labelKey}`;
            }
          }
        }
      }
      filter.defaultSetting = defaultSetting;
      // for map
      filters[filterKey] = filter;
    }
    // for contextmenu
    filterGroups.push(module);
    filterGroups.sort((a, b) => ((a.index || 0) < (b.index || 0) ? -1 : 1));
  } catch (err) {
    console.warn(err);
  }
});
