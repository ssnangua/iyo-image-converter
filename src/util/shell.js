import path from "path";
import os from "os";
import fs from "fs-extra";
import { exec, execFile } from "child_process";
import { promisify } from "util";

const execp = promisify(exec);

const cwd = process.cwd();
const bin = {
  iconsext: path.join(cwd, "bin/iconsext.exe"),
  fontlist: path.join(cwd, "bin/fontlist"),
  trash_win32: path.join(cwd, "bin/windows-trash.exe"),
  trash_darwin: path.join(cwd, "bin/macos-trash"),
};

// https://www.nirsoft.net/utils/iconsext.html
export function runIconsext(sourceFile, saveFolder, cursors, asIco, newFolder) {
  if (newFolder) {
    const { name } = path.parse(sourceFile);
    saveFolder = path.join(saveFolder, name);
    fs.ensureDirSync(saveFolder);
  }
  let command = `"${bin.iconsext}" /save "${sourceFile}" "${saveFolder}" -icons`;
  if (cursors) command += " -cursors";
  if (asIco) command += " -asico";
  return execp(command);
}

// https://github.com/felixrieseberg/windows-shortcuts-ps
export function getShortcutTarget(lnkFile = "") {
  if (process.platform !== "win32") {
    return Promise.reject(new Error("Platform is not Windows"));
  }
  const normalizedFile = path.normalize(path.resolve(lnkFile));
  const getCOM = `(New-Object -COM WScript.Shell)`;
  const command = `${getCOM}.CreateShortcut('${normalizedFile}').TargetPath;`;
  // https://blog.csdn.net/x356982611/article/details/80285930
  return execp(`chcp 65001|powershell.exe -command "${command}"`).then(
    ({ stdout }) => {
      const result = stdout.split("\r\n").filter((v) => !!v);
      return result?.[0];
    }
  );
}

// https://github.com/oldj/node-font-list/blob/master/libs/win32/getByPowerShell.js
const listFontCmd = `chcp 65001|powershell -command "chcp 65001|Out-Null;Add-Type -AssemblyName PresentationCore;$families=[Windows.Media.Fonts]::SystemFontFamilies;foreach($family in $families){$name='';if(!$family.FamilyNames.TryGetValue([Windows.Markup.XmlLanguage]::GetLanguage('zh-cn'),[ref]$name)){$name=$family.FamilyNames[[Windows.Markup.XmlLanguage]::GetLanguage('en-us')]}echo $name}"`;
export function listFontWin32() {
  return execp(listFontCmd).then(({ stdout }) => {
    return stdout
      .split("\n")
      .map((ln) => ln.trim())
      .filter((f) => !!f);
  });
}

// https://github.com/oldj/node-font-list/blob/master/libs/darwin/index.js
const font_exceptions = ["iconfont"];
function tryToGetFonts(s) {
  let fonts = [];
  let m = s.match(/\(([\s\S]+)\)/);
  if (m) {
    fonts = m[1]
      .split("\n")
      .map((i) => i.trim())
      .map((i) => i.replace(/,$/, ""));
  }
  return fonts;
}
function listFontDarwin() {
  return new Promise((resolve, reject) => {
    execFile(
      bin.fontlist,
      { maxBuffer: 1024 * 1024 * 10 },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        let fonts = [];
        if (stdout) {
          fonts = fonts.concat(tryToGetFonts(stdout));
        }
        if (stderr) {
          fonts = fonts.concat(tryToGetFonts(stderr));
        }
        fonts = Array.from(new Set(fonts)).filter(
          (i) => i && !font_exceptions.includes(i)
        );
        resolve(fonts);
      }
    );
  });
}

export function listFont() {
  if (process.platform === "darwin") return listFontDarwin();
  else return listFontWin32();
}

// https://github.com/sindresorhus/trash
const isOlderThanMountainLion = Number(os.release().split(".")[0]) < 12;
export function trash(input) {
  if (process.platform === "darwin" && isOlderThanMountainLion) {
    return fs.remove(input);
  }
  const _bin =
    process.platform === "darwin" ? bin.trash_darwin : bin.trash_win32;
  return execp(`${_bin} "${path.resolve(input)}"`);
}
