# 目录结构（STRUCTURE）

**映射日期：** 2026-04-22

## 仓库根目录

```
SudokuTaro/
├── .planning/
│   └── codebase/          # 本 codebase 映射输出
├── config/
│   └── index.ts           # Taro defineConfig、webpack5、mini-ci、H5 等
├── key/                   # 微信上传私钥放置说明（勿提交私钥）
├── minigame-wechat/       # 微信小游戏独立工程
├── scripts/               # PowerShell 辅助脚本
├── src/                   # Taro 应用源码
├── .env.upload.example    # 上传凭据模板
├── babel.config.js
├── package.json
├── package-lock.json
├── project.config.json    # 小程序工程（与开发者工具）
├── tsconfig.json
├── CONTEXT.md             # 协作者/AI 上下文索引
├── README.md
└── LICENSE
```

## Taro 应用：`src/`

| 路径 | 用途 |
|------|------|
| `src/app.tsx` | 应用根组件、启动诊断 |
| `src/app.config.js` | 全局路由与小程序 app 配置 |
| `src/app.scss` | 全局样式 |
| `src/index.html` | H5 HTML 模板（须存在） |
| `src/pages/index/index.tsx` | 数独主界面与交互 |
| `src/pages/index/index.config.js` | 首页页面配置 |
| `src/pages/index/index.scss` | 首页样式 |
| `src/utils/sudokuEngine.ts` | 数独生成、挖洞、冲突 |
| `src/utils/gameEconomy.ts` | 道具、每日赠送、震动设置、存储 |
| `src/utils/devDiagnostics.ts` | H5 启动与环境诊断日志 |
| `src/utils/theme.ts` | 主题相关工具 |

**路径别名**：`@/*` → `src/*`（`tsconfig.json` 的 `paths`）。

## 微信小游戏：`minigame-wechat/`

| 路径 | 用途 |
|------|------|
| `game.json` / `game.js` | 小游戏配置与入口 |
| `project.config.json` | 小游戏 AppID 等 |
| `tsconfig.json` | `src` → `js` 编译 |
| `src/main.ts` | Canvas 主逻辑 |
| `src/sudokuEngine.ts` | 与根目录 `src/utils/sudokuEngine.ts` 对齐维护 |
| `src/gameEconomy.ts` | wx 存储，与 Taro 经济对齐 |
| `src/types.d.ts` / `src/wx.d.ts` | 类型声明 |
| `js/*.js` | **运行时使用**：`tsc` 输出，提交仓库；改 `src` 后执行 `npm run build:minigame` |

## 构建产物（通常 gitignore）

- **`dist/`** — Taro 构建输出（小程序/H5）
- **`node_modules/`** — 依赖
- **`.taro/`** — Taro 缓存（若存在）

## 命名约定（可见于代码）

- React 组件：**PascalCase**（如 `SudokuGrid`、`StatsRow`）
- 工具函数：**camelCase**（如 `loadEconomy`、`digHoles`）
- 页面目录：`pages/<name>/`，含 `index.tsx`、`index.config.js`、`index.scss`
- 配置文件：Taro/小程序侧多用 **`*.config.js`** 而非 TS，降低配置阶段风险
