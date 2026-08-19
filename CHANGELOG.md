# Changelog

## [1.1.2] - Unreleased

Release when macOS **Developer ID Application** signing + notarization is verified on a clean download (no Gatekeeper “unidentified developer” / quarantine workaround needed).

### Added
- MIT `LICENSE` file
- macOS distribution signing/notarization config wired for CI (`APPLE` environment secrets)

### Changed
- macOS `signingIdentity` switched from Apple Development to Developer ID Application (replace the Common Name if your certificate string differs)
- README screenshot slots marked as placeholders until refreshed assets land

### Notes for the release tag
When ready:
1. Confirm `security find-identity -v -p codesigning` shows a valid `Developer ID Application: …` identity
2. Export that identity as p12 and update `APPLE_CERTIFICATE` / `APPLE_CERTIFICATE_PASSWORD` on the `APPLE` environment
3. Align `bundle.macOS.signingIdentity` in `src-tauri/tauri.conf.json` with the exact certificate Common Name
4. `git tag v1.1.2 && git push origin v1.1.2`
5. Download the Release DMG on a clean Mac and open it without `xattr` workarounds

## [1.1.1] - 2026-04-28

- Windows + macOS (Apple Silicon) installers via GitHub Releases
- CI release workflow fixes for permissions and renamed artifacts

## [1.1.0] - 2026-03-12

- iOS Asset Catalog App Icon and Image Set export support

## [1.0.0] - 2026-03-07

- Initial public release builds
