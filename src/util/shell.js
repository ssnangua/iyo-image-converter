import path from "path";
import fs from "fs-extra";
import { exec } from "child_process";
import { promisify } from "util";

const execp = promisify(exec);

const bin = {
  iconsext: "bin/iconsext.exe",
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
export function listFont() {
  return execp(listFontCmd).then(({ stdout }) => {
    return stdout
      .split("\n")
      .map((ln) => ln.trim())
      .filter((f) => !!f);
  });
}
