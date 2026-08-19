# Changelog

## [1.1.2] - 2026-08-20

macOS **Developer ID Application** signing and notarization are verified against the public Release DMG with Apple `stapler` and Gatekeeper `spctl`.

### Added
- MIT `LICENSE` file
- macOS distribution signing/notarization config wired for CI (`APPLE` environment secrets)

### Changed
- macOS `signingIdentity` switched from Apple Development to Developer ID Application (replace the Common Name if your certificate string differs)
- README screenshot slots marked as placeholders until refreshed assets land

### Verified
- The public DMG and bundled app both carry valid stapled notarization tickets
- Gatekeeper reports `accepted` with source `Notarized Developer ID`

## [1.1.1] - 2026-04-28

- Windows + macOS (Apple Silicon) installers via GitHub Releases
- CI release workflow fixes for permissions and renamed artifacts

## [1.1.0] - 2026-03-12

- iOS Asset Catalog App Icon and Image Set export support

## [1.0.0] - 2026-03-07

- Initial public release builds
