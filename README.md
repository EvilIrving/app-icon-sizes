# Icon Maker

A cross-platform desktop application for generating app icons for multiple platforms. Built with Tauri, React, and TypeScript.

## Features

- **Multi-platform Support**: Generate icons for iOS, macOS, Android, Chrome Extension, and custom image sets
- **Simple Workflow**: Select an image → Choose platform → Export
- **High Quality**: Uses Canvas API with high-quality image smoothing
- **Native Experience**: Built with Tauri for small bundle size and native performance
- **Customizable**: Support for custom filenames and scale presets

## Supported Platforms

### iOS & macOS App Icon
Complete app icon set with **43 sizes** organized by device:

**iPhone** (8 sizes)
- Icon-60 @2x, @3x (60mm, 120mm, 180mm)
- Icon-20 @2x, @3x (notification)
- Icon-29 @2x, @3x (settings)
- Icon-40 @2x, @3x (spotlight)

**iPad** (9 sizes)
- Icon-76 @1x, @2x
- Icon-83.5 @2x (Pro)
- Icon-20 @1x, @2x
- Icon-29 @1x, @2x
- Icon-40 @1x, @2x

**watchOS** (7 sizes)
- Icon-40, 44, 50, 86, 98, 108 @2x
- Icon-1024 (App Store)

**macOS** (11 sizes)
- Icon-16, 32, 64, 128, 256, 512, 1024 @1x, @2x

### Android
- mipmap-mdpi (48×48)
- mipmap-hdpi (72×72)
- mipmap-xhdpi (96×96)
- mipmap-xxhdpi (144×144)
- mipmap-xxxhdpi (192×192)
- **Custom filename support** (default: `ic_launcher`)

### Image Sets Generator
Generate 1x/2x/3x or 1x/2x/3x/4x image sets:
- **3x mode**: base, @2x, @3x
- **4x mode**: base, @2x, @3x, @4x
- **Custom filename support** (default: `image`)
- Includes Contents.json for asset catalogs

### Chrome Extension
- 16×16, 32×32, 48×48, 128×128

## Prerequisites

- **Node.js** 18+ and pnpm
- **Rust** (for Tauri builds) - Install from [rustup.rs](https://rustup.rs)
- **Xcode Command Line Tools** (macOS) or **Visual Studio Build Tools** (Windows)

## Installation

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

## Project Structure

```
icon-maker/
├── src/                      # Frontend source
│   ├── core/
│   │   ├── presets.ts        # Platform configurations
│   │   ├── resize.ts         # Image resize utilities
│   │   └── exporter.ts       # ZIP export logic
│   ├── components/           # React components
│   ├── App.tsx               # Main application
│   └── App.css               # Styles
├── src-tauri/                # Tauri backend
│   ├── src/
│   │   └── main.rs           # Rust entry point
│   ├── tauri.conf.json       # Tauri configuration
│   └── Cargo.toml            # Rust dependencies
├── package.json
└── vite.config.ts
```

## Usage

1. **Launch the application** using `pnpm tauri dev` (development) or run the built app
2. **Select an image** by clicking the upload area or dragging and dropping (recommended: 1024×1024 PNG)
3. **Choose a platform** from the available presets
4. **Configure options** (if applicable):
   - Android: Change the filename (default: `ic_launcher`)
   - Image Sets: Select 3x or 4x scale preset, change filename (default: `image`)
5. **Preview** the generated icons in the preview grid (grouped by device for iOS & macOS)
6. **Click Export** to generate and save the ZIP file

## Technical Details

- **Frontend**: React 18 + TypeScript + Vite
- **Desktop Framework**: Tauri 2.x
- **Image Processing**: HTML Canvas API with high-quality smoothing
- **ZIP Generation**: JSZip
- **File Access**: Tauri Dialog and FS plugins

## Building for Distribution

### macOS
```bash
pnpm tauri build --target aarch64-apple-darwin  # Apple Silicon
pnpm tauri build --target x86_64-apple-darwin   # Intel
```

### Windows
```bash
pnpm tauri build --target x86_64-pc-windows-msvc
```

Built applications will be in `src-tauri/target/release/bundle/`.

## License

MIT
