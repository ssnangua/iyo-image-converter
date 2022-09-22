const { defineConfig } = require("@vue/cli-service");
const path = require("path");

module.exports = defineConfig({
  pages: {
    main: {
      entry: "src/main.js",
      template: "public/index.html",
      filename: "main.html",
      title: "　",
    },
    editor: {
      entry: "src/editor.js",
      template: "public/index.html",
      filename: "editor.html",
      title: "　",
    },
    icoTool: {
      entry: "src/icoTool.js",
      template: "public/index.html",
      filename: "icotool.html",
      title: "　",
    },
    animeTool: {
      entry: "src/animeTool.js",
      template: "public/index.html",
      filename: "animetool.html",
      title: "　",
    },
  },

  productionSourceMap: false,

  // transpileDependencies: true,
  publicPath: "",

  chainWebpack: (config) => {
    config.optimization.delete("splitChunks");
  },

  configureWebpack: {
    target: "electron-renderer",
    node: {
      __dirname: true,
    },
    module: {
      rules: [
        {
          test: /\.node$/,
          loader: "node-loader",
          options: {
            name(resourcePath) {
              return path.basename(resourcePath);
            },
          },
        },
      ],
    },
  },

  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true,
    },
  },
});
