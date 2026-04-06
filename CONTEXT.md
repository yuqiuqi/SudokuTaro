# SudokuTaro — 上下文与协作总览（CONTEXT）

> **用途**：新会话或新协作者用 **Read 工具** 读本文件，快速恢复：项目事实、用户偏好、规则路径、Skills、常见坑与后续可做。  
> **原则**：具体实现以仓库代码为准；此处为索引与摘要，避免与源码长期不同步。

---

## 1. 项目卡片

| 项 | 内容 |
|----|------|
| 名称 | SudokuTaro |
| 路径 | `c:\Users\yuqiu\SudokuTaro`（以本机为准） |
| 描述 | 数独 — Taro 多端：H5 / 微信小程序 / 抖音小程序 |
| 栈 | Taro **4.0.9** + React 18 + TypeScript + Sass + Webpack 5 |
| 设计稿 | `designWidth: 750`，样式多用 `rpx` |
| 仓库 | 可配合 `README.md`、`scripts/setup-git-github.ps1` 与 `gh` 上传 GitHub |

### 常用命令

```bash
npm install
npm run dev:h5          # H5 开发，默认常显 http://localhost:10086/
npm run build:h5        # 输出 dist/
npm run dev:weapp       # 微信小程序 watch
npm run build:weapp
npm run dev:tt          # 抖音小程序 watch
npm run build:tt
```

---

## 2. 本会话与历史诉求摘要（Prompt 时间线）

以下为对话中出现过的意图，便于检索「当时为什么这样改」：

| 主题 | 摘要 |
|------|------|
| 启动与依赖 | 分析项目、修依赖/配置、`npm run dev:h5`；Windows PATH（`Program Files\nodejs`、`%AppData%\npm`）；cnpm/镜像 |
| 数独逻辑 | 覆盖非题面格、冲突回退到上一值、`digHoles` 洗牌位置避免慢循环、`formatSeconds` 等 |
| H5 白屏/目录列表 | `h5.devServer.static: false`；保证 `src/index.html` 存在以便 HtmlWebpackPlugin |
| 404 / 诊断 | `h5.publicPath: '/'`；`devDiagnostics.ts`、启动日志 |
| PowerShell | `npm` 找不到 → PATH；`npm.ps1` 被拦 → `npm.cmd` 或 `RemoteSigned`；可用 `dev-h5.cmd` |
| 键盘与输入 | 去掉页面数字键盘与键盘提示；物理键/隐藏 `Input` 填数；修复 hook 顺序避免 `fillNumber` 暂存死区错误 |
| 布局与 UI | 宫格线均匀（CSS Grid）、按钮与棋盘同宽、标题区宽度、去掉副标题、难度与操作按钮位置与居中 |
| 性能与视觉 | `React.memo` 棋盘、冲突 `Set<number>`、`hasConflict`/`collectConflictIndices` 优化、引擎洗牌；暖色纸感 UI、九宫格底纹 |
| 文档与 Git | `.gitignore`；`README.md`；winget 安装 Git/gh；`gh auth login` 后 `gh repo create ... --push` |
| 本文档 | 汇总 prompt、上下文、skills、规则路径 |

---

## 3. 目录与关键文件

```
SudokuTaro/
├── config/index.ts           # h5.publicPath、devServer.static 等
├── scripts/setup-git-github.ps1
├── README.md                  # 对外说明与上传步骤
├── CONTEXT.md                 # 本文件（对内交接）
├── src/
│   ├── app.tsx / app.config.js
│   ├── index.html             # H5 模板（必须存在）
│   ├── pages/index/           # 首页：数独 UI（index.tsx / index.scss / index.config.js）
│   └── utils/
│       ├── sudokuEngine.ts    # 生成、挖洞、冲突检测、collectConflictIndices
│       └── devDiagnostics.ts
└── package.json
```

---

## 4. 架构与实现要点（易忘）

- **配置用 JS**：`app.config.js`、`pages/index/index.config.js` 避免 Node 读配置时触发 `window`。
- **棋盘**：`display: grid` + `repeat(9, minmax(0,1fr))` + `aspect-ratio: 1`；主内容 `content-wrap` `max-width: 690rpx` 与棋盘对齐。
- **输入**：无屏上 1–9 键盘；H5 `document` 捕获 `keydown`；可选格聚焦隐藏 `Input`。
- **状态**：`SudokuGrid` 使用 `React.memo`，计时器在父组件时减少 81 格无意义重绘。
- **冲突**：`Set<number>`，键 `row * 9 + col`；高亮用 `collectConflictIndices`。

---

## 5. Cursor / 用户规则（路径索引）

以下由工作区或用户配置，**需要遵循时应用 Read 打开原文**（勿假设全文已在上下文）：

| 名称 | 路径（本机） |
|------|----------------|
| PUA 万能激励引擎 | `C:\Users\yuqiu\.cursor\rules\pua.mdc` |
| 提问前先读 PUA | `C:\Users\yuqiu\.cursor\rules\read-pua-before-questions.mdc` |
| Awesome DESIGN.md | `C:\Users\yuqiu\.cursor\rules\awesome-design-md.mdc`（品牌 UI 时从 `C:\Users\yuqiu\awesome-design-md\design-md\<品牌>\DESIGN.md` 对照） |

**用户偏好（摘要）**：中文简体回复；先工具自查再提问；可跑命令则实际执行；代码改动克制、匹配现有风格；用户明确要求时才新增大段文档。

---

## 6. Agent Skills（本机路径）

与任务相关时 **必须先 Read 对应 `SKILL.md` 再执行**：

| Skill | 路径 |
|-------|------|
| babysit（PR / CI / 合并） | `C:\Users\yuqiu\.cursor\skills-cursor\babysit\SKILL.md` |
| create-rule（写 Cursor 规则） | `C:\Users\yuqiu\.cursor\skills-cursor\create-rule\SKILL.md` |
| create-skill（写 Skill） | `C:\Users\yuqiu\.cursor\skills-cursor\create-skill\SKILL.md` |
| update-cursor-settings | `C:\Users\yuqiu\.cursor\skills-cursor\update-cursor-settings\SKILL.md` |

---

## 7. Windows 与终端备忘

- **PATH**：`C:\Program Files\nodejs`；全局 npm 包：`%AppData%\npm`。
- **`npm.ps1` 被策略拦截**：用 `npm.cmd`，或 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`。
- **Git / gh**：可用 `winget install Git.Git`、`winget install GitHub.cli`；安装后新开终端；`gh auth login` 需本机浏览器/Token，**勿把 Token 贴给 AI**。
- **H5 预览**：以终端为准（常见 `10086`）；白屏可查 Network 与 `[SudokuTaro:diag]` 类日志。

---

## 8. 依赖与构建备忘

- 锁文件损坏时可删 `package-lock.json` 后重装；注意是否有条目缺失 `version`。
- `@babel/plugin-proposal-class-properties` 在 devDependencies 中（babel-preset-taro 需要）。
- Webpack `EntrypointsOverSizeLimitWarning` 为体积提示，非编译失败。

---

## 9. 后续可选事项

- 小程序真机再验各端配置与输入聚焦。
- 若需「唯一解」题目，可在挖洞后增加求解计数逻辑。
- 设计改版时可按 `awesome-design-md` 中某品牌 `DESIGN.md` 对齐 token。

---

## 10. 新会话建议 Prompt 模板（可复制）

```
先 Read 仓库内 CONTEXT.md 与（若改 UI）pua.mdc / DESIGN 规则。
项目：SudokuTaro，Taro 4 + React + TS，路径 c:\Users\yuqiu\SudokuTaro。
需求：<在此写你的任务>
约束：只改必要文件；改完跑 npm run build:h5 验证。
```

---

*文档随仓库迭代；重大架构或配置变更时请同步更新本节或 README。*
