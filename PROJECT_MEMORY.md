# Project Memory

## Safari 打不开 developer.apple.com 多因 Clash 拒绝全部 IPv6 · 2026-08-19 17:26 · grok

在本机排查「Safari 无法打开 https://developer.apple.com/，提示服务器意外地断开了连接」时，已确认不是 Apple 官网宕机。

已确认事实：

- Clash Meta（TUN `utun9` / gVisor，`mixed-port` 7890，`mode=rule`）中存在规则 `IPCIDR,::/0,REJECT`，会拒绝全部 IPv6 流量。
- `developer.apple.com` 有 AAAA 记录；Safari 常优先走 IPv6，因此会直接撞上该拒绝规则，表现为连接被意外断开。
- 同一环境下 IPv4 经 TUN 或 `127.0.0.1:7890` 访问该站点可正常返回 HTTP 200；IPv6 经 TUN 会在极短时间内 TLS 失败（`SSL_ERROR_SYSCALL`）。
- 域名规则本身合理：`apple` → `PROXY`，`apple-cn` → `DIRECT`。问题不在 Apple 分流组，而在全局 IPv6 拒绝。

以后若再出现 Safari 打不开 Apple 开发者站点、而 curl/IPv4 正常，应优先检查 Clash 是否仍配置 `::/0 → REJECT`，而不是先怀疑官网或证书。处理方式：删除该规则，或改为不拦截 IPv6 / 走代理，然后重载 Clash。

## docs/ GitHub Pages 落地站已启用 · 2026-08-19 · grok

项目对外落地页放在 `docs/`：英文 `/`、中文 `/zh/`，视觉对齐应用咖啡棕配色并以 logo 紫橙点缀；截图暂用压缩 JPG 占位。SEO 含 title/description/canonical/hreflang，以及 `SoftwareApplication` + `FAQPage` JSON-LD，并配有 `robots.txt` / `sitemap.xml`。

GitHub Pages 已启用：`main` 分支 + `/docs` 目录，地址为 https://evilirving.github.io/app-icon-sizes/；仓库 homepage 已指向该地址。增长相关说明写在 `GROWTH.md`。

尚未做：独立自定义域名；新演示 GIF（仍用现有截图占位）。本条纠正同日较早「尚无独立落地页 / 未启用 Pages」的表述。

## v1.1.2 版本与签名身份已改，对外 tag 仍受证书阻塞 · 2026-08-19 · grok

版本已 bump 到 `1.1.2`（`package.json` / `Cargo.toml` / `tauri.conf.json`）。`signingIdentity` 改为 `Developer ID Application: 董 少年 (74NN3NSTYN)`；若证书 Common Name 与此不一致，发布前需再改。已补 MIT `LICENSE`、`CHANGELOG.md`、`.github/release-notes.md`；README 截图仍标为占位，隔离属性 workaround 注明为临时。

**未打 `v1.1.2` tag**：本机当时尚无可用的 Developer ID Application 身份。对外发布前需要：创建并安装该证书 → 导出 p12 并更新 APPLE 环境的 `APPLE_CERTIFICATE`（及密码若变更）→ 用 `security find-identity -v -p codesigning` 核对 CN → 再 `git tag v1.1.2 && git push origin v1.1.2`，并在干净 Mac 上验证 Gatekeeper。

## macOS 签名与公证走 App Store Connect API Key · 2026-04-29 02:09 · claude

Icon Maker 的 Tauri macOS 分发签名/公证约定如下（凭证名可保留，秘密值不得写入仓库或本文件）：

- `tauri.conf.json` 的 `bundle.macOS.notarization` 使用 `appleApi`，`APPLE_API_ISSUER` / `APPLE_API_KEY_ID` / `APPLE_API_KEY_PATH` 均通过环境变量注入，避免硬编码。
- 选择 API Key 而非 Apple ID + 专用密码：避免密码轮换，更适合 CI。
- CI（`.github/workflows/release.yml` 的 `build-macos`）从 GitHub Secrets 读取 base64 的 p12 与 p8，导入临时 keychain 后构建；证书导入顺序需完整：create-keychain → unlock → import → set-key-partition-list。
- 对外分发必须用 **Developer ID Application**；仅 Apple Development 只适合本地调试。证书续期后需重新导出 p12 并更新 Secret。
- 建议 GitHub Environment 名为 `APPLE`，限制 `v*` tag，并给 `build-macos` 配 `environment: APPLE`。

CI 需要的 Secrets 名称：`APPLE_CERTIFICATE`、`APPLE_CERTIFICATE_PASSWORD`、`KEYCHAIN_PASSWORD`、`APPLE_API_KEY`、`APPLE_API_KEY_ID`、`APPLE_API_ISSUER`。触发方式为推送 `v*` tag；已签名+公证的 `.dmg` 从 Release artifacts 下载。
