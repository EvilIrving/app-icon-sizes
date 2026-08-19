# Growth Context

*Last updated: 2026-08-19 (web pass)

## Product
- **Name:** Icon Sizes
- **One-liner / tagline (chosen):** One PNG in. Every icon size out.
- **One-liner (zh):** 一张 PNG 进去，各平台图标尺寸出来。
- **What it does:** Drop in a 1024×1024 PNG, pick platforms (iOS/macOS, Android, image sets, Chrome extension, favicon, store images), export a ZIP. Runs fully on-device via Tauri; nothing is uploaded.
- **Category:** cross-platform app icon generator / desktop icon tool

## Platform & distribution
- **Platform / requirements:** macOS (Apple Silicon DMG today), Windows (MSI / NSIS). Built with Tauri 2 + React + TypeScript.
- **How it ships / installs:** GitHub Releases (DMG / EXE / MSI). Source build via pnpm + Rust.
- **Updates:** Manual via GitHub Releases
- **Repo:** https://github.com/EvilIrving/app-icon-sizes
- **Site:** https://evilirving.github.io/app-icon-sizes/ (GitHub Pages, `docs/`)

## Pricing model
- Free and open source (MIT)

## Audience
- **Who it's for:** Indie developers, mobile/desktop app makers, anyone who needs icon asset catalogs without a web uploader
- **Why they reach for it:** Need many icon sizes fast; don’t want to upload source art to a random website; want Asset Catalog / mipmap-ready output

## Differentiators (ranked, all true)
- Runs locally (privacy: no upload)
- Free / MIT open source
- Multi-platform presets in one ZIP (Apple + Android + Chrome + image sets)
- Desktop app (Tauri), not a browser-only toy
- iOS Asset Catalog–oriented export (Contents.json)

## Competitors / alternatives
| Name | Model | Honest strength | How we differ |
|------|-------|-----------------|---------------|
| App Icon Generator (web) | Free web tools | Zero install | We stay local; no upload |
| IconKitchen / Android Studio | Free / IDE | Deep Android integration | We cover Apple + multi-platform in one place |
| Sketch / Figma plugins | Paid design tools | Design workflow integration | We are a focused export utility, free |

## Channels
- **Where this audience is:** GitHub, r/macapps, r/iOSProgramming, r/androiddev, Show HN, Product Hunt (optional)
- **Languages to publish in:** English, 中文

## Voice
- **Tone:** developer-to-developer, plain, specific
- **Words to use / avoid:** Prefer “local”, “ZIP”, “presets”, “Asset Catalog”. Avoid “revolutionary”, “seamless”, “powerful”, em dashes.

## Proof points (REAL only)
- Public GitHub repo and Releases (v1.1.1+). No fabricated download/star counts.

## Links
- **Social handles / accounts:**
- **Press / contact:** via GitHub issues
