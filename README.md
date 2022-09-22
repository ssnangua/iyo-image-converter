# iYo Image Converter | 哎哟图片转换器

A free native image converter | 一个免费的本地图片转换工具

<img src="screenshots/en_convert.jpg" width="300" />

Base on [sharp](https://sharp.pixelplumbing.com/) and [NW.js](https://nwjs.io/).

[Download](https://github.com/ssnangua/iyo-image-converter/releases) | [Screenshots](./screenshots/) | English Document | [中文文档](README_zh.md)

## Features

- Convert / Tiny image
- Resize / Rotate image
- Add watermark
- Support image formats: `.png`,`.jpg`,`.jpeg`,`.webp`,`.gif`,`.tif`,`.tiff`,`.avif`,`.heif`,`.bmp`,`.ico`,`.svg`, animated GIF/WebP/APNG
- Anime Tool
  - Create animated image
  - Add text
  - Extract frames
- ICO Tool
  - Create multi-size `.ico` image
  - Extract frames
  - Extract `.ico` image from `.exe`,`.dll`,`.ocx`,`.cpl` file

## Development

```bash
# install
yarn

# rebuild sharp
cd node_modules\sharp
nw-gyp configure --target=0.68.1
nw-gyp build --target=0.68.1

# dev (root directory)
yarn dev

# build
yarn build
```
