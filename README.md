# Icon Sizes

**One PNG in. Every icon size out.**

Need app icons for iPhone, Android, Chrome, and more? Drop in one image, pick the platforms, export a zip. Free desktop app for Mac and Windows.

[![Release](https://img.shields.io/github/v/release/EvilIrving/app-icon-sizes)](https://github.com/EvilIrving/app-icon-sizes/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Website](https://evilirving.github.io/app-icon-sizes/)** · **[Download](https://github.com/EvilIrving/app-icon-sizes/releases/latest)** · **[中文说明](README.zh-CN.md)** · **[中文站点](https://evilirving.github.io/app-icon-sizes/zh/)**

![Icon Sizes](en.png)

## What is this?

When you ship an app, every store and platform wants the same icon in many sizes. Icon Sizes does that for you.

1. Open the app
2. Drop in your icon image (1024×1024 PNG works best)
3. Tick the platforms you need
4. Export one zip and you're done

It's free. Install once, use whenever.

## What can it export?

- iPhone / iPad / Mac app icons
- Android launcher icons
- Image sets (1x / 2x / 3x, and more)
- Chrome extension icons
- Website icons (favicon)
- Store images

The interface supports English and 中文.

## Install

Get the latest version from [GitHub Releases](https://github.com/EvilIrving/app-icon-sizes/releases/latest):

| Computer | File to download |
|---|---|
| Mac (Apple silicon) | `.dmg` |
| Windows | `.msi` or `.exe` |

On Mac, the app is signed and notarized by Apple, so you can open it like a normal app.

## How to use

1. Download and install
2. Open Icon Sizes
3. Drop your PNG into the app
4. Select platforms on the left
5. Preview the sizes, then export the zip

## Build from source (optional)

Most people can stop at the download above.

If you want to build it yourself, you need Node.js 18+, pnpm, and Rust. On Mac also install Xcode Command Line Tools; on Windows install Visual Studio Build Tools. Steps are in [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
pnpm install
pnpm tauri build
```

## Contributing

Want to help fix a bug or add something? See [CONTRIBUTING.md](CONTRIBUTING.md). Security notes: [SECURITY.md](SECURITY.md).

If this tool helps you, a GitHub star makes it easier for others to find.

## License

[MIT](LICENSE)
