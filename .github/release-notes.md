## Icon Sizes 1.1.2

Prep release for Gatekeeper-friendly macOS distribution (Developer ID signing + notarization path), plus docs and licensing polish.

### Added
- MIT `LICENSE`
- Bilingual GitHub Pages site: https://evilirving.github.io/app-icon-sizes/
- Release notes / changelog scaffolding for distribution builds

### Changed
- macOS `signingIdentity` targets **Developer ID Application** (was Apple Development)
- README rewritten for install-first flow (download binaries, then build from source)
- Honest macOS Gatekeeper note until notarization is verified on a clean download

### Downloads
- macOS: `.dmg` (Apple Silicon)
- Windows: `.msi` / NSIS `.exe`

### Verify on macOS
Download the DMG from this release and open the app. Gatekeeper should not require an `xattr` quarantine workaround. If it still does, check the Actions log: the certificate may not be a valid Developer ID Application identity, or notarization failed.
