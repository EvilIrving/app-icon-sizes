## Icon Sizes 1.1.2

Gatekeeper-ready macOS distribution with verified Developer ID signing and notarization, plus docs and licensing polish.

### Added
- MIT `LICENSE`
- Bilingual GitHub Pages site: https://evilirving.github.io/app-icon-sizes/
- Release notes / changelog scaffolding for distribution builds

### Changed
- macOS `signingIdentity` targets **Developer ID Application** (was Apple Development)
- README rewritten for install-first flow (download binaries, then build from source)
- Release CI now verifies stapled notarization tickets and Gatekeeper acceptance before upload

### Downloads
- macOS: `.dmg` (Apple Silicon)
- Windows: `.msi` / NSIS `.exe`

### Verify on macOS
The published DMG and bundled app were both validated with Apple `stapler` and accepted by Gatekeeper as `Notarized Developer ID`; no `xattr` workaround is required.

If Icon Sizes helps you ship, a GitHub star makes it easier for others to find. Issues and PRs welcome via [CONTRIBUTING.md](../CONTRIBUTING.md).
