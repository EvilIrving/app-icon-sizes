## macOS 签名+公证配置 · 2026-04-29 02:09 · claude

### 做了什么
为 Icon Maker 的 Tauri macOS 构建配置了代码签名和公证：

1. **tauri.conf.json** — 新增 `bundle.macOS` 配置：
   - `signingIdentity` 使用 Apple Development 证书
   - `notarization` 采用 Apple App Store Connect API Key 方式（`appleApi`），三个字段均通过环境变量注入，避免凭证写入文件

2. **GitHub Actions CI 签名流程**（`.github/workflows/release.yml` `build-macos` job）：
   - 从 GitHub Secrets 读取 base64 编码的 p12 证书，导入临时 keychain
   - 从 GitHub Secrets 读取 base64 编码的 p8 文件，写入 `~/.appstoreconnect/`
   - 构建时通过 env 传入 `APPLE_API_ISSUER` / `APPLE_API_KEY_ID` / `APPLE_API_KEY_PATH`
   - `signingIdentity` 使用的仍是 Apple Development 证书（本地开发用）；如需对外分发应改为 Developer ID Application 证书

### GitHub Secrets 清单
CI 构建需要以下 6 个 secrets（均在仓库 Settings → Secrets and variables → Actions 中配置）：

| Secret | 说明 |
|--------|------|
| `APPLE_CERTIFICATE` | 签名证书 p12 文件的 base64 |
| `APPLE_CERTIFICATE_PASSWORD` | 导出 p12 时设置的密码 |
| `KEYCHAIN_PASSWORD` | CI 临时 keychain 的密码 |
| `APPLE_API_KEY` | App Store Connect API .p8 文件的 base64 |
| `APPLE_API_KEY_ID` | API Key 的 Key ID |
| `APPLE_API_ISSUER` | API Key 的 Issuer ID |

### 关键决策
- 选择 App Store Connect API Key 而非 Apple ID + 专用密码：API Key 不需要 Apple ID 密码轮换，更适合 CI
- 凭证全部通过环境变量传入，不写入配置文件，确保 `tauri.conf.json` 和 CI 文件可安全提交到公开仓库
- 建议在 GitHub 创建一个名为 `APPLE` 的环境（Settings → Environments），关联 `build-macos` job，启用 required reviewers 和 `v*` tag 限制以保护签名证书不被滥用

### 注意事项
- 当前 signingIdentity 是 Apple Development，本地调试 OK。对外分发需要 Developer ID Application 证书，导出对应的 p12 替换即可
- 每次签名证书续期后需要重新导出 p12 并更新 GitHub Secret
- .p8 文件绝对不可提交到仓库或外传

### 操作流程

#### 准备工作（一次性）
1. 加入 Apple Developer Program（$99/年）
2. 在 Keychain Access 中确认有签名证书（Developer ID Application 用于分发）
3. 在 App Store Connect → 用户与访问 → 集成 → App Store Connect API 创建密钥，下载 .p8 文件

#### 本地导出 p12 证书
```bash
# 查看可用证书
security find-identity -v -p codesigning

# 导出为 p12（替换证书名）
security export -k login.keychain \
  -t certs \
  -f pkcs12 \
  -o ~/Desktop/icon-maker-cert.p12 \
  "你的证书名: 邮箱 (TEAMID)"

# 会弹窗提示设密码，记下来
```

#### 生成 Secrets 的 base64 值
```bash
# p12 证书 → base64
base64 -i ~/Desktop/icon-maker-cert.p12 | pbcopy

# .p8 密钥 → base64
base64 -i ~/.appstoreconnect/AuthKey_XXXXXXXXXX.p8 | pbcopy
```

#### GitHub Actions 配置
1. Settings → Secrets and variables → Actions → New repository secret，逐个添加 6 个 secret
2. Settings → Environments → 创建 `APPLE` 环境，设置 Tag 限制为 `v*`
3. 在 `release.yml` 的 `build-macos` job 中加上 `environment: APPLE`

#### 配置文件要点
- `tauri.conf.json` 中 `bundle.macOS.signingIdentity` 决定签名证书类型
- `appleApi` 三个字段全部用 `{ "env": "变量名" }` 语法，避免硬编码
- CI job 中证书导入顺序：create-keychain → unlock → import → set-key-partition-list（缺一不可）

#### 触发构建
推送 `v*` 格式的 tag 即可：
```bash
git tag v1.2.0
git push origin v1.2.0
```
构建产物（已签名+公证的 .dmg）仅保留在 Release artifacts 中下载即可。
