# Security

## Supported versions

Security fixes target the latest GitHub Release on `main`. Older tags are best-effort.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Email or contact the maintainer via GitHub (private vulnerability report if enabled on the repo, otherwise a private maintainer contact through GitHub). Include:

- Affected version / commit
- OS and arch
- Steps to reproduce
- Impact (what an attacker could do)

You should get an acknowledgment within a few days when possible.

## Scope notes

Icon Sizes is a local desktop app. It is designed **not** to upload source images. Please treat unexpected network calls, path traversal in export paths, or code execution via crafted images as in-scope.
