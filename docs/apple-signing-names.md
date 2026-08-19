# 苹果签名 / 公证：名称到底在干啥

面向本仓库 **Icon Sizes**（Tauri 桌面应用，GitHub 发 DMG，不上 Mac App Store）。

不是你笨。苹果把「谁签发、签什么、怎么验证」拆成多套平行体系，名字还经常撞车。

## 你真正要完成的只有两件事

1. **签名**：证明这个 `.app` / `.dmg` 是某某开发者打的  
2. **公证**：让苹果服务器扫一遍，再给 Gatekeeper 放行  

其它名词，大多是在服务这两步。

## 名称对照（会碰到的）

| 名字 | 它到底是啥 | 本项目要不要管 |
|---|---|---|
| **Apple ID** | 登录账号 | 登录用，不是签名证书 |
| **Apple Developer Program** | 年费会员资格 | 没它就没有对外分发证书 |
| **Team ID**（如 `74NN3NSTYN`） | 开发者团队短 ID | 证书名括号里、公证配置里会出现 |
| **CSR** | 本机生成的证书申请书 | 创建证书时用；**私钥留在生成 CSR 的那台电脑** |
| **Apple Development** | 开发调试用证书 | 本地调试可以；**不能**正经对外发 DMG |
| **Developer ID Application** | 对外分发 App 的签名证书 | **你要的就是这个** |
| **Developer ID Installer** | 签 `.pkg` 安装包 | 走 DMG 时一般不用 |
| **Mac App Distribution / Mac Installer Distribution** | 上 Mac App Store 用 | 不上架就忽略 |
| **签名 (codesign)** | 用证书给二进制盖章 | 本机 / CI 构建时做 |
| **公证 (notarization)** | 把已签名包交给苹果扫描 | 另一套流程，**不是再下一张同名证书** |
| **App Store Connect API Key**（`.p8`） | 公证时调用苹果 API 的密钥 | Key ID + Issuer + `.p8` 三件套 |
| **Apple ID + app-specific password** | 公证的另一种登录方式 | 本项目选了 API Key，这条当备用 |
| **p12** | 证书 + 私钥的导出包 | 给 CI 用；只有 `.cer` 没有私钥就签不了 |
| **signingIdentity** | 告诉 Tauri 用哪张证书的名字 | 必须和 `security find-identity -v -p codesigning` 那一行完全一致 |
| **Gatekeeper / quarantine** | macOS 对网上下载软件的拦截 | 没签 + 没公证就会弹无法验证之类 |
| **Provisioning Profile** | 主要给 iOS 等场景 | 本桌面分发基本不用纠结 |

## 最容易混的三对

### 1. Development vs Developer ID

- **Apple Development** = 自家调试  
- **Developer ID Application** = 发给陌生人下载  

钥匙串里「看得见」证书，但 `find-identity` 没有 = 多半只有公钥、**没有配对私钥**。看见 ≠ 能签。

### 2. 证书 vs 公证 API Key

- **Developer ID Application** = 盖章用的「章」  
- **`.p8` API Key** = 打电话给苹果做公证的「工牌」  

公证不再需要一张叫 notarization 的证书。

### 3. Issuer / Key ID / `.p8`

同一把 API Key 的三个零件：

- **Issuer ID**：谁发的这把钥匙（UUID）  
- **Key ID**：这把钥匙的短编号  
- **`.p8` 文件**：真正的私钥（通常只能下载一次）  

缺任何一个，公证 API 都打不通。具体数值放在本机 / GitHub Secrets，**不要写进本文**。

## 映射到本仓库

- `src-tauri/tauri.conf.json` → `signingIdentity`：用哪张 Developer ID Application  
- `notarization.appleApi` → `APPLE_API_ISSUER` / `APPLE_API_KEY_ID` / `APPLE_API_KEY_PATH`：公证工牌  
- GitHub Environment `APPLE` 的六个 Secret：把「章的 p12」和「工牌的 p8」交给 CI  

回家操作清单见：`prompts/home-machine-signing-notarization.md`  
约定摘要见：`PROJECT_MEMORY.md`

## 只记这一句

> 对外发 DMG = **Developer ID Application（章）** + **公证 API Key（工牌）** + CI 里对应 Secret。  
> 其它证书名，先当不存在。
