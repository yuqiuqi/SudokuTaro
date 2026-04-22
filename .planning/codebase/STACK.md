# 技术栈（STACK）

**映射日期：** 2026-04-22  
**仓库：** SudokuTaro — 数独多端应用（Taro）+ 独立微信小游戏子工程

## 语言与运行时

- **TypeScript**（主工程 `tsconfig.json`：`target` ES2017，`module` commonjs，`jsx` react-jsx，`strictNullChecks`，`noUnusedLocals` / `noUnusedParameters`）
- **Node.js** 18+（`README.md` / `package.json` 的 `@types/node` ^18）
- **JavaScript**：部分配置与入口为 JS，避免在 Node 配置阶段访问浏览器 API（如 `app.config.js`、`pages/index/index.config.js`）

## 应用框架与 UI

- **Taro 4.0.9**（`@tarojs/*` 统一 4.0.9）
- **React 18.3.x**（`react`、`react-dom`）
- **样式**：**Sass**（`sass` ^1.75），设计稿宽度 **750**（`config/index.ts` 中 `designWidth: 750`）

## 构建与打包

- **Webpack 5**（`webpack` 5.91.0，`@tarojs/webpack5-runner` 4.0.9）
- **Babel**：`@babel/core`、`babel-preset-taro`、`@babel/preset-react` 等（见 `package.json`、`babel.config.js`）
- **编译器配置**：`config/index.ts` 中 `compiler.type: 'webpack5'`，`prebundle.enable: false`

## 目标平台与脚本

| 目标 | npm 脚本 | 说明 |
|------|-----------|------|
| H5 | `dev:h5` / `build:h5` | Web 端 |
| 微信小程序 | `dev:weapp` / `build:weapp` | `dist/` 产出 |
| 抖音小程序 | `dev:tt` / `build:tt` | |
| 微信小游戏 | `build:minigame` | `tsc -p minigame-wechat/tsconfig.json` → `minigame-wechat/js/` |

## 依赖摘要（生产）

- `@tarojs/components`、`@tarojs/react`、`@tarojs/runtime`、`@tarojs/taro`
- 平台插件：`@tarojs/plugin-platform-h5`、`@tarojs/plugin-platform-weapp`、`@tarojs/plugin-platform-tt`
- `@babel/runtime`

## 开发依赖（节选）

- `@tarojs/cli`、`eslint` + `eslint-config-taro`
- `dotenv-cli`（配合上传脚本读 `.env.upload`）
- `@tarojs/plugin-mini-ci`（小程序 CI 上传）
- `tsconfig-paths-webpack-plugin`（与 `paths` `@/*` 配合）

## 配置文件（关键路径）

- `package.json` — 脚本、依赖、`taroConfig`（CI 版本说明等）
- `config/index.ts` — Taro 主配置、mini-ci、H5 `publicPath` / `devServer`
- `tsconfig.json` — `src`、`config`、`types`；`paths`: `@/*` → `./src/*`
- `babel.config.js` — Babel 预设
- `project.config.json` — 小程序侧工程（AppID 等，与微信开发者工具相关）
- `minigame-wechat/tsconfig.json` — 小游戏 TS：`rootDir` `src`，`outDir` `js`
- `minigame-wechat/game.json` / `game.js` — 小游戏入口

## 许可证

- 项目 `license` 字段：**CC-BY-NC-ND-4.0**（见 `LICENSE`、`README.md`）
