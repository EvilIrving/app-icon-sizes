# Growth Context

*Last updated: 2026-08-20 (ops voice for all public docs)

## Product
- **Name:** Icon Sizes
- **One-liner / tagline (chosen):** One PNG in. Every icon size out.
- **One-liner (zh):** 一张 PNG 进去，各平台图标尺寸出来。
- **What it does:** Drop in one icon image (1024×1024 PNG works best), pick platforms, export a zip. Free desktop app for Mac and Windows.
- **Category:** app icon size exporter / desktop icon tool

## Platform & distribution
- **Platform / requirements:** macOS (Apple Silicon DMG today), Windows (MSI / NSIS). Built with Tauri 2 + React + TypeScript.
- **How it ships / installs:** GitHub Releases (DMG / EXE / MSI). Source build via pnpm + Rust. macOS DMG is Developer ID signed and notarized (Gatekeeper-accepted on v1.1.2).
- **Updates:** Manual via GitHub Releases
- **Repo:** https://github.com/EvilIrving/app-icon-sizes
- **Site:** https://evilirving.github.io/app-icon-sizes/ (GitHub Pages from `docs/`; EN + 中文; real UI screenshots in `docs/assets/`)

## Pricing model
- Free and open source (MIT)

## Audience
- **Who it's for:** Indie developers, mobile/desktop app makers who need many icon sizes for shipping
- **Why they reach for it:** Need many icon sizes fast; want one export covering several platforms; prefer an installed desktop window over hunting a browser tab every time

## Differentiators (ranked, all true)
- Free / MIT open source
- Multi-platform presets in one ZIP (Apple + Android + Chrome + image sets)
- Desktop install: open anytime, works without keeping a browser tab around (UI is web tech in a desktop shell; do not pretend that makes web tools inherently upload-based)
- Processing stays on-device in this app (state our own behavior; do not claim all websites upload)
- iOS Asset Catalog–oriented export (Contents.json) when relevant

## Competitors / alternatives
| Name | Model | Honest strength | How we differ |
|------|-------|-----------------|---------------|
| Browser icon tools | Free, zero install | Open and go; many can process in-browser | We are an installed desktop app with multi-platform one-shot export |
| IconKitchen / Android Studio | Free / IDE | Deep Android integration | We cover Apple + multi-platform in one place |
| Sketch / Figma plugins | Paid design tools | Design workflow integration | We are a focused export utility, free |

## Channels
- **Where this audience is:** GitHub, r/macapps, r/iOSProgramming, r/androiddev, Show HN, Product Hunt (optional)
- **Languages to publish in:** English, 中文

## Voice
- **Split:** Ops docs (landing, README, CHANGELOG, release notes, directory blurbs) are written for users. Tech docs (CONTRIBUTING, SECURITY, signing notes) are written for contributors. Never mix the voices.
- **Ops tone:** Treat the reader as a beginner and as someone you want to help. Explain patiently. Lead with the job (“I need every icon size”) and the next action (“download”, “drop in image”, “export”). No showing off.
- **Tech tone:** Exact commands, paths, certificate names, CI checks belong only in contributor docs.
- **Words to use / avoid (ops):** Prefer “free”, “download”, “Mac”, “Windows”, “zip”, platform names people know (iPhone, Android, Chrome). Do **not** claim websites must upload artwork (false; this app is a web UI in a desktop shell). Keep pnpm, Rust, Tauri, Contents.json, staple, Gatekeeper, mipmap, Asset Catalog out of ops copy unless a deep optional section truly needs them. Avoid “revolutionary”, “seamless”, “powerful”, em dashes.

## Proof points (REAL only)
- Public GitHub repo and Releases; latest tag **v1.1.2** (2026-08-19): macOS aarch64 DMG + Windows x64 MSI/NSIS.
- v1.1.2 macOS DMG re-downloaded from public Release and verified: stapled ticket + Gatekeeper `accepted` / `Notarized Developer ID` (TeamIdentifier QZZ878S3NS).
- Live GitHub Pages site with EN/zh pages, real app screenshots, SoftwareApplication + FAQPage JSON-LD.
- No fabricated download/star counts; omit vanity metrics until they are meaningful to cite.

## Links
- **Social handles / accounts:**
- **Press / contact:** via GitHub issues
