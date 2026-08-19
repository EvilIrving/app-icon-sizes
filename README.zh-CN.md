# Icon Sizes

**一张 PNG 进去，各平台图标尺寸出来。**

做 App 要准备一堆图标尺寸？把原图丢进来，勾上平台，导出一个压缩包就行。免费桌面应用，支持 Mac 和 Windows。

[![Release](https://img.shields.io/github/v/release/EvilIrving/app-icon-sizes)](https://github.com/EvilIrving/app-icon-sizes/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[网站](https://evilirving.github.io/app-icon-sizes/zh/)** · **[下载](https://github.com/EvilIrving/app-icon-sizes/releases/latest)** · **[English](README.md)** · **[English site](https://evilirving.github.io/app-icon-sizes/)**

![Icon Sizes](zh.png)

## 这是什么？

上架 App 时，每个平台都要同一张图标的很多尺寸。Icon Sizes 帮你一次做完。

1. 打开软件
2. 拖进你的图标原图（建议 1024×1024 的 PNG）
3. 勾上要用的平台
4. 导出一个压缩包，结束

完全免费。装一次，以后随时用。

## 能导出什么？

- iPhone / iPad / Mac 应用图标
- 安卓启动图标
- 多倍图（1x / 2x / 3x 等）
- Chrome 扩展图标
- 网站图标（favicon）
- 商店图

界面支持中文和英文。

## 安装

去 [GitHub Releases](https://github.com/EvilIrving/app-icon-sizes/releases/latest) 下载最新版：

| 电脑 | 下哪个文件 |
|---|---|
| Mac（Apple 芯片） | `.dmg` |
| Windows | `.msi` 或 `.exe` |

Mac 版已经过苹果公证，像普通软件一样双击安装即可。

## 怎么用？

1. 下载并安装
2. 打开 Icon Sizes
3. 把 PNG 拖进软件
4. 在左侧勾选平台
5. 预览一下，然后导出压缩包

## 想自己编译？（可选）

一般用户直接下载安装包就够了。

如果你想自己编译，需要 Node.js 18+、pnpm 和 Rust。Mac 还要装 Xcode 命令行工具，Windows 要装 Visual Studio Build Tools。具体步骤见 [CONTRIBUTING.md](CONTRIBUTING.md)。

```bash
pnpm install
pnpm tauri build
```

## 参与贡献

想修 bug 或加功能？看 [CONTRIBUTING.md](CONTRIBUTING.md)。安全相关见 [SECURITY.md](SECURITY.md)。

如果这个工具帮到你，点个 GitHub Star，能让更多人找到它。

## 许可证

[MIT](LICENSE)
