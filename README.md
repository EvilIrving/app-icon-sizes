# Icon Maker

A desktop app that generates app icons for multiple platforms from a single source image. Built with Tauri, React, and TypeScript.

**[🇨🇳 中文版本](README.zh-CN.md)**

## What it does

Drop in a 1024×1024 PNG, pick your target platforms, and get back a ZIP with all the sizes you need. No web service, no uploading to sketchy websites—runs locally on your machine.

**Supported outputs:**
- iOS & macOS app icons (43 sizes across iPhone, iPad, watchOS, macOS)
- Android launcher icons (mdpi through xxxhdpi)
- Image sets with 1x/2x/3x or 1x/2x/3x/4x scales
- Chrome extension icons

## Platform details

### iOS & macOS

Generates the full set of 43 icon sizes:

**iPhone** – 8 sizes including app icons (60pt @2x/@3x), notifications (20pt), settings (29pt), and spotlight search (40pt)

**iPad** – 9 sizes covering standard iPad, iPad Pro (83.5pt @2x), and the same auxiliary sizes as iPhone

**watchOS** – 7 sizes for Apple Watch complications and the 1024pt App Store icon

**macOS** – 11 sizes from 16pt up to 1024pt

### Android

Exports to the standard mipmap folders:
- mipmap-mdpi (48×48)
- mipmap-hdpi (72×72)
- mipmap-xhdpi (96×96)
- mipmap-xxhdpi (144×144)
- mipmap-xxxhdpi (192×192)

You can customize the filename (defaults to `ic_launcher`).

### Image Sets

For iOS asset catalogs or Android drawable resources. Pick 3x scale (base, @2x, @3x) or 4x scale (adds @4x). Includes Contents.json for iOS. Filename is customizable.

### Chrome Extension

Four sizes: 16×16, 32×32, 48×48, 128×128

## Getting started

You'll need:
- Node.js 18+ and pnpm
- Rust (for Tauri builds) – install from [rustup.rs](https://rustup.rs)
- Xcode Command Line Tools (macOS) or Visual Studio Build Tools (Windows)

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

## How the code is organized

```
icon-maker/
├── src/                      # Frontend
│   ├── core/
│   │   ├── presets.ts        # Platform configs
│   │   ├── resize.ts         # Image resizing
│   │   └── exporter.ts       # ZIP generation
│   ├── components/           # UI components
│   ├── App.tsx               # Main app
│   └── App.css
├── src-tauri/                # Tauri backend
│   ├── src/
│   │   └── main.rs
│   ├── tauri.conf.json
│   └── Cargo.toml
├── package.json
└── vite.config.ts
```

## Using the app

1. Start with `pnpm tauri dev` or run the built app
2. Drop a source image onto the upload area (1024×1024 PNG works best)
3. Pick your platforms from the sidebar
4. Tweak any options:
   - Android: set a custom filename
   - Image Sets: choose 3x or 4x scale, set filename
5. Preview the generated icons in the main area
6. Hit Export and pick where to save the ZIP

## Under the hood

- React 18 + TypeScript + Vite for the UI
- Tauri 2.x for the desktop wrapper
- Canvas API for image resizing (uses high-quality smoothing)
- JSZip for ZIP generation
- Tauri Dialog and FS plugins for file operations

## Building for release

### macOS
```bash
pnpm tauri build --target aarch64-apple-darwin  # Apple Silicon
pnpm tauri build --target x86_64-apple-darwin   # Intel
```

### Windows
```bash
pnpm tauri build --target x86_64-pc-windows-msvc
```

Find the built installers in `src-tauri/target/release/bundle/`.

## License

MIT
