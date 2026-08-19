# Prompt：在家里电脑完成 macOS Developer ID 签名 + 公证 + v1.1.2 发布

把下面「给 Agent 的提示词」整段复制给家里电脑上的 AI / 自己按步骤执行即可。

---

## 给 Agent 的提示词（复制从这里开始）

```text
你在仓库 rust-app-icon-sizes（Icon Maker / Tauri macOS 应用）里工作。目标：在这台家里的 Mac 上把「Developer ID Application 签名 + 公证」搞通，并具备发布 v1.1.2 的条件。不要做无关重构。

## 背景（已确认）

1. 项目对外分发需要：
   - 代码签名：Developer ID Application
   - 公证：App Store Connect API Key（appleApi），不是再下一张证书

2. `src-tauri/tauri.conf.json` 已配置：
   - signingIdentity: `Developer ID Application: 董 少年 (74NN3NSTYN)`
   - notarization.appleApi 通过环境变量：
     - APPLE_API_ISSUER
     - APPLE_API_KEY_ID
     - APPLE_API_KEY_PATH（本地指向 .p8 文件路径）

3. CI（`.github/workflows/release.yml` 的 build-macos）需要 GitHub Environment `APPLE` 的 Secrets：
   - APPLE_CERTIFICATE（Developer ID Application 的 p12，base64）
   - APPLE_CERTIFICATE_PASSWORD
   - KEYCHAIN_PASSWORD（CI 临时 keychain 密码，可自设）
   - APPLE_API_KEY（.p8 文件内容的 base64）
   - APPLE_API_KEY_ID
   - APPLE_API_ISSUER

4. 公证 API Key 已有（在另一台电脑上生成过）：
   - Key ID: 887JA9KJ89
   - Issuer ID: 84d76d9f-080c-43b6-ae44-92652cf3ae23
   - 私钥文件名形态：AuthKey_887JA9KJ89.p8
   - 注意：.p8 只能下载一次。若家里没有该文件，必须在 App Store Connect → 用户和访问 → 集成 → App Store Connect API → 个人密钥 重新生成一把，并更新 Key ID / Secret。

5. 公司电脑上的问题（避免重蹈）：
   - 钥匙串 UI 里曾能「看见」Developer ID Application: 董 少年 (74NN3NSTYN)
   - 但 `security find-identity -v -p codesigning` 里没有该身份（只有 Apple Development）
   - 结论：看见证书 ≠ 可签名；缺配对私钥（多半是 CSR 在别的机器生成，只装了 .cer）
   - 以 `security find-identity -v -p codesigning` 是否出现 Developer ID Application 为准

6. 版本状态：
   - 已 bump 到 1.1.2（package.json / Cargo.toml / tauri.conf.json）
   - 尚未打 `v1.1.2` tag；等签名身份可用且 CI Secret 齐了再打

7. 长期说明见仓库根目录 PROJECT_MEMORY.md（签名约定、Pages 落地站等）。
8. 苹果一堆证书/公证名称对照（中文）：`docs/apple-signing-names.md`。

## 请你在这台家里 Mac 上按顺序做

### A. 确认或重建可签名的 Developer ID Application

1. 运行：
   security find-identity -v -p codesigning
2. 若已有 `Developer ID Application: 董 少年 (74NN3NSTYN)`（或同 Team ID 74NN3NSTYN 的 Developer ID Application）：
   - 核对 tauri.conf.json 里 signingIdentity 是否与输出字符串完全一致；不一致就改配置。
3. 若没有：
   - 用钥匙串访问在本机生成 CSR（证书助理 → 从证书颁发机构请求证书）
   - 到 https://developer.apple.com/account/resources/certificates/list 创建/轮换 Developer ID Application（用本机 CSR）
   - 下载并双击安装
   - 再跑 find-identity，必须能看到 Developer ID Application 且无报错
4. 不要用 Apple Development 对外分发；Developer ID Installer / Mac Installer Distribution 本项目一般不需要。

### B. 导出 p12 并准备 CI Secret

1. 从钥匙串导出该 Developer ID Application（含私钥）为 .p12，设密码。
2. 生成 base64 到剪贴板（不要把私钥/p12 内容写进仓库或聊天记录）：
   base64 -i ~/Desktop/你的证书.p12 | pbcopy
3. 更新 GitHub 仓库 Settings → Environments → APPLE：
   - APPLE_CERTIFICATE = 上面的 base64
   - APPLE_CERTIFICATE_PASSWORD = 导出时密码
   - KEYCHAIN_PASSWORD = 自设一个 CI 用密码（若还没有）

### C. 公证 API Key

1. 确认本机有 AuthKey_887JA9KJ89.p8；若无则重新生成 API Key 并改用新 Key ID。
2. 建议放置：
   mkdir -p ~/.appstoreconnect/private_keys
   cp /path/to/AuthKey_XXXX.p8 ~/.appstoreconnect/private_keys/
3. 更新 GitHub APPLE environment：
   - APPLE_API_KEY = `base64 -i ~/.appstoreconnect/private_keys/AuthKey_XXXX.p8 | pbcopy` 的结果
   - APPLE_API_KEY_ID = 887JA9KJ89（或新 Key ID）
   - APPLE_API_ISSUER = 84d76d9f-080c-43b6-ae44-92652cf3ae23
4. 本地验证用环境变量示例：
   export APPLE_API_KEY_ID="887JA9KJ89"
   export APPLE_API_ISSUER="84d76d9f-080c-43b6-ae44-92652cf3ae23"
   export APPLE_API_KEY_PATH="$HOME/.appstoreconnect/private_keys/AuthKey_887JA9KJ89.p8"

### D. 发布前检查

1. find-identity 含 Developer ID Application
2. tauri.conf.json 的 signingIdentity 与之一致
3. APPLE environment 六个 Secret 齐全
4. 确认没有把 .p8 / .p12 / 密码提交进 git
5. 再执行（需我明确同意或用户要求时才 git tag/push）：
   git tag v1.1.2
   git push origin v1.1.2
6. CI 产出已签名+公证的 .dmg 后，在干净 Mac 上下载验证 Gatekeeper（不应再靠 xattr 清隔离属性 workaround）

### E. 若访问 developer.apple.com 失败

若本机 Clash/TUN 存在规则 `IPCIDR,::/0,REJECT`，Safari 会因 IPv6 被拒出现「服务器意外地断开了连接」。IPv4/curl 可能仍正常。处理：删掉或修改该 IPv6 拒绝规则后重载代理。详见 PROJECT_MEMORY.md。

## 约束

- 不要把证书、p12、p8、密码写入仓库文件或 PROJECT_MEMORY.md
- 不要在未确认 Secret/身份就绪时擅自打 tag
- 完成后用简短中文汇报：find-identity 结果摘要、signingIdentity 是否已对齐、哪些 Secret 已更新（只说名称不说值）、是否已打 tag
```

---

## 你自己回家前可捎上的东西

- [ ] 若有 `AuthKey_887JA9KJ89.p8`，用 U 盘/加密方式带到家里（或准备在 ASC 重新生成）
- [ ] 确认 Apple Developer 账号能在家里登录
- [ ] 本文件：`prompts/home-machine-signing-notarization.md`
- [ ] 可选：翻一下 `PROJECT_MEMORY.md` 里签名/公证两条

## 六个 Secret 速查（只列名）

| Secret | 用途 |
|--------|------|
| `APPLE_CERTIFICATE` | Developer ID Application 的 p12 → base64 |
| `APPLE_CERTIFICATE_PASSWORD` | p12 密码 |
| `KEYCHAIN_PASSWORD` | CI 临时 keychain |
| `APPLE_API_KEY` | `.p8` → base64 |
| `APPLE_API_KEY_ID` | 现为 `887JA9KJ89` |
| `APPLE_API_ISSUER` | 现为 `84d76d9f-080c-43b6-ae44-92652cf3ae23` |
