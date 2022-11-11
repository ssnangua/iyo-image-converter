import path from "path";
import fs from "fs-extra";

export function getCurrentScreen() {
  for (let screen of nw.Screen.screens) {
    if (
      screen.work_area.x === window.screen.availLeft &&
      screen.work_area.y === window.screen.availTop
    )
      return screen;
  }
}

export function formatDate(date, format = "yyyy-MM-dd hh:mm:ss") {
  const o = {
    "y+": date.getFullYear(),
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
  };
  for (let k in o) {
    if (new RegExp(`(${k})`).test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : `0${o[k]}`.substr(-RegExp.$1.length)
      );
    }
  }
  return format;
}

export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => `0${v}`.substr(-2)).join(":");
}

export function humanFileSize(size, digits = 2) {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (
    Number((size / Math.pow(1024, i)).toFixed(digits)) +
    " " +
    ["B", "KB", "MB", "GB", "TB"][i]
  );
}

export function comparePaths(path1, path2) {
  path1 = path.resolve(path1);
  path2 = path.resolve(path2);
  if (process.platform == "win32")
    return path1.toLowerCase() === path2.toLowerCase();
  return path1 === path2;
}

export function isUndefined(v) {
  return typeof v === "undefined";
}

export function parseColor(c) {
  if (/^rgba/.test(c)) {
    // eslint-disable-next-line
    const [_, r, g, b, alpha] = c.match(/rgba\((.*?), (.*?), (.*?), (.*?)\)/);
    return { r: +r, g: +g, b: +b, alpha: +alpha };
  }
  return c;
}

const baseURL =
  location.protocol === "chrome-extension:" ? "/dist" : location.origin;
const winMap = {};
export function openPage(page, searches, options = {}) {
  const { id } = options;
  const win = id && winMap[id];
  if (win) {
    if (typeof win === "object") win.focus();
    return;
  }
  if (id) winMap[id] = true;

  let url = `${baseURL}/${page}`;
  if (searches && Object.keys(searches).length > 0) {
    url += "?" + new URLSearchParams(searches).toString();
  }
  nw.Window.open(
    url,
    {
      ...options,
      position: "center",
      show: false,
      new_instance: true,
      mixed_context: true,
    },
    (win) => {
      win.on("loaded", () => {
        win.show();
        win.focus();
      });
      if (id) {
        winMap[id] = win;
        win.on("closed", () => delete winMap[id]);
      }
    }
  );
}

export function getOutputPath(outputPath) {
  const { dir, name, ext } = path.parse(outputPath);
  let output = outputPath;
  let temp = name;
  while (fs.existsSync(output)) {
    const index = Number((/~(\d+)$/.test(temp) && RegExp.$1) || 0) + 1;
    temp = `${name}~${index}`;
    output = path.join(dir, temp + ext);
  }
  return output;
}

export function getSearches(url) {
  const search = url ? new URL(url).search : location.search;
  return search
    .substring(1)
    .split("&")
    .reduce((o, s) => {
      const [k, v] = s.split("=");
      o[k] = v;
      return o;
    }, {});
}

function preventDefault(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}
export function handleDropFiles(callback) {
  window.addEventListener("dragenter", preventDefault);
  window.addEventListener("dragover", preventDefault);
  window.addEventListener("dragleave", preventDefault);
  window.addEventListener("drop", preventDefault);
  window.addEventListener("drop", (e) => {
    const files = Array.from(e.dataTransfer.files);
    callback(files);
  });
}
