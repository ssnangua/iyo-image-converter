import fs from "fs-extra";
import path from "path";
import { createI18n } from "vue-i18n";
import setting from "./preset/setting";

const languagesPath = path.join(process.cwd(), "languages");
/**
 * Load locale messages
 *
 * The loaded `JSON` locale messages is pre-compiled by `@intlify/vue-i18n-loader`, which is integrated into `vue-cli-plugin-i18n`.
 * See: https://github.com/intlify/vue-i18n-loader#rocket-i18n-resource-pre-compilation
 */
function loadLocaleMessages() {
  // const locales = require.context(
  //   "./locales",
  //   true,
  //   /[A-Za-z0-9-_,\s]+\.json$/i
  // );
  // const messages = {};
  // locales.keys().forEach((key) => {
  //   const matched = key.match(/([A-Za-z0-9-_]+)\./i);
  //   if (matched && matched.length > 1) {
  //     const locale = matched[1];
  //     messages[locale] = locales(key).default;
  //   }
  // });
  const messages = {};
  fs.readdirSync(languagesPath).forEach((file) => {
    const locale = path.parse(file).name;
    messages[locale] = fs.readJSONSync(path.join(languagesPath, `${file}`));
  });
  return messages;
}

export const messages = loadLocaleMessages();

export const locales = Object.entries(messages).map(([locale, message]) => {
  return {
    label: message.languageName,
    value: locale,
  };
});

export default createI18n({
  legacy: false,
  locale: setting.locale,
  globalInjection: true,
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  missingWarn: false,
  fallbackWarn: false,
  warnHtmlMessage: false,
  missing: () => "",
  messages,
});
