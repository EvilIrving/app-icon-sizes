# Contributing to Icon Sizes

Thanks for helping. This is a small MIT project: clear bug reports and focused PRs are the most useful.

## Ways to contribute

- **Bug report:** use the Bug report issue template (version, OS, steps, expected vs actual).
- **Feature idea:** use the Feature request template. Say what workflow it unblocks.
- **Code / docs PR:** keep the change scoped. Match existing TypeScript / React style.
- **Translations:** the app and site ship EN + 中文. Fixes and improvements to either are welcome; credit goes in release notes.

## Development setup

Needs Node.js 18+, pnpm, Rust ([rustup](https://rustup.rs)), plus Xcode CLT (macOS) or VS Build Tools (Windows).

```bash
pnpm install
pnpm tauri dev
```

Production build:

```bash
pnpm tauri build
```

Frontend lives in `src/`. Tauri shell in `src-tauri/`. Landing site in `docs/`.

## Before you open a PR

1. Describe the problem and how you verified the fix (manual steps are fine; there is no large automated UI suite yet).
2. Do not add telemetry, accounts, or upload-by-default network behavior. Local-first is intentional.
3. Do not invent marketing claims or download counts in docs.
4. Keep secrets out of the repo (Apple certificates, API keys stay in GitHub Actions environments).

## Feature vs bug

- **Bug:** something already claimed in the README / UI does not work.
- **Feature:** new preset, export format, platform, or UX that is not there yet. Open an issue first for larger ideas so we can agree on scope.

## Good first issues

Look for the `good first issue` label. Those are intentionally small (copy, docs, presets, UI polish).

## Code of conduct (short)

Be respectful. Assume good intent. No harassment. Maintainers may close hostile or spam threads.
