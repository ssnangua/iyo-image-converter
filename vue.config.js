const { defineConfig } = require("@vue/cli-service");
const path = require("path");

module.exports = defineConfig({
  pages: {
    main: {
      entry: "src/main/main.js",
      template: "public/index.html",
      filename: "main.html",
    },
    editImage: {
      entry: "src/tool-edit-image/editImage.js",
      template: "public/index.html",
      filename: "edit-image.html",
    },
    icoTool: {
      entry: "src/tool-ico/icoTool.js",
      template: "public/index.html",
      filename: "ico-tool.html",
    },
    animeTool: {
      entry: "src/tool-anime/animeTool.js",
      template: "public/index.html",
      filename: "anime-tool.html",
    },
    filterTool: {
      entry: "src/tool-filter/filterTool.js",
      template: "public/index.html",
      filename: "filter-tool.html",
    },
    pdfTool: {
      entry: "src/tool-pdf/pdfTool.js",
      template: "public/index.html",
      filename: "pdf-tool.html",
    },
    mirageTank: {
      entry: "src/tool-mirage-tank/mirageTank.js",
      template: "public/index.html",
      filename: "mirage-tank.html",
    },
  },

  productionSourceMap: false,

  // transpileDependencies: true,
  publicPath: "",

  // chainWebpack: (config) => {
  //   config.optimization.delete("splitChunks");
  // },

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
