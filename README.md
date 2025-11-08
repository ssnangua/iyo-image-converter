# 哎哟图片转换器 V2

基于 Electron + React + Ant Design 重写，目前只实现了图片格式转换。

## 项目结构

```bash
├── 📁pakcages                # 依赖包
├── 📁scripts                 # 脚本
├── 📁src                     # 源码目录
│   ├── 📁common              # 公共模块
│   ├── 📁ipc                 # 通信模块
│   ├── 📁main                # 主进程
│   ├── 📁preload             # 预加载脚本
│   ├── 📁renderer/src        # 渲染进程
│   │   ├── 📁assets          # 资源样式
│   │   ├── 📁common          # 公共模块（渲染进程）
│   │   ├── 📁components      # 组件
│   │   │   ├── 📁form        # Schema表单
│   │   │   └── 📁table       # 虚拟表格
│   │   └── 📁stores          # 状态管理
│   ├── 📁settings            # 设置
│   │   └── 📁schemas         # 设置Schema
│   └── 📁worker              # 工作线程
└── ...
```

## 开发

```bash
# 初始化
pnpm install

# 构建依赖包
pnpm build:packages

# 开发
pnpm dev

# 构建
pnpm build:win
pnpm build:mac
pnpm build:linux
```
