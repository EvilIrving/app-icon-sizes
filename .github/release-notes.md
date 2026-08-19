## Icon Sizes 1.1.2

macOS distribution prep: Developer ID signing + notarization path for Gatekeeper-friendly DMGs.

### Highlights
- MIT license added
- macOS bundle config targets **Developer ID Application** (not Apple Development)
- CI continues to use the `APPLE` environment secrets for certificate import and App Store Connect API notarization

### Downloads
- macOS: `.dmg` (Apple Silicon)
- Windows: `.msi` / NSIS `.exe`

### Verify on macOS
Download the DMG from this release, open the app, and confirm Gatekeeper does **not** require an `xattr` quarantine workaround. If it still does, the uploaded certificate is not a valid Developer ID Application identity or notarization failed—check the Actions log.
