# 外部集成（INTEGRATIONS）

**映射日期：** 2026-04-22

## 平台 SDK（运行时）

### Taro 多端

- **`@tarojs/taro`**：统一 API（存储、震动、环境等）
- **示例**：`src/utils/gameEconomy.ts` 使用 `Taro.getStorageSync` / `Taro.setStorageSync` 持久化经济与设置
- **示例**：`src/pages/index/index.tsx` 使用 `Taro.vibrateShort`（小程序），H5 回退 `navigator.vibrate`
- **`src/utils/devDiagnostics.ts`**：`Taro.getEnv()` 用于启动诊断日志（仅 `window` 存在时）

### 微信小游戏（独立子工程）

- **`minigame-wechat/src/*`** 使用 **`wx`** 全局（类型见 `minigame-wechat/src/wx.d.ts`）
- **存储**：`minigame-wechat/src/gameEconomy.ts` 与 Taro 端共用逻辑与 **同一 `STORAGE_KEY`**（见 `CONTEXT.md` / `gameEconomy.ts`），保证存档键一致

## 小程序 CI 与上传

- **插件**：`@tarojs/plugin-mini-ci`（在 `config/index.ts` 的 `plugins` 中配置）
- **凭据来源**：环境变量（**不**写入仓库）
  - 微信：`WECHAT_APPID`、`WECHAT_PRIVATE_KEY_PATH`（私钥文件路径，通常指向 `key/` 下文件）
  - 抖音：`TT_EMAIL`、`TT_PASSWORD`
  - 可选覆盖：`CI_VERSION`、`CI_DESC`
- **本地 env 文件**：从 `.env.upload.example` 复制为 **`.env.upload`**，由 `dotenv-cli` 在 `upload:*` / `preview:*` 脚本中加载（见 `package.json` 的 `dotenv -e .env.upload`）
- **版本元数据**：优先 `process.env.CI_VERSION` / `CI_DESC`，否则 `package.json` 的 `version` 与 `taroConfig`

## 浏览器 / H5

- **`src/index.html`**：H5 模板；内联脚本可设置 `window.__SUDOKU_BOOT__`，与 `devDiagnostics.ts` 合并打印（见 `README` / `CONTEXT`）
- **`config/index.ts`**：`h5.publicPath: '/'`，`h5.devServer.static: false`（避免开发时根路径静态目录列表导致白屏类问题）

## 无服务端依赖

- 当前仓库为 **纯客户端** 应用：无自建 REST/GraphQL、无项目内数据库服务；数据仅存本地（Taro Storage / `wx` storage）。

## 脚本与运维（本地）

- **`scripts/release-mini.ps1`**：上传前检查 `.env.upload`
- **`scripts/setup-git-github.ps1`**：Windows 下 Git/gh 安装提示（与 GitHub 工作流相关，非应用运行时集成）
