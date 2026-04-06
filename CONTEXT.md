# SudokuTaro — 上下文与协作总览（CONTEXT）

> **用途**：新会话或新协作者用 **Read 工具** 读本文件，在上下文将满时优先把**可复用事实**沉淀在此，避免重复交代 prompt、规则路径与工程约定。  
> **原则**：具体实现以仓库代码为准；此处为索引与摘要，重大改动后请顺手更新对应小节。

---

## 1. 项目卡片

| 项 | 内容 |
|----|------|
| 名称 | SudokuTaro |
| 路径 | `c:\Users\yuqiu\SudokuTaro`（以本机为准） |
| 描述 | 数独 — **Taro 多端**（H5 / 微信与抖音小程序）+ **微信小游戏** `minigame-wechat`（Canvas 独立子工程） |
| 栈 | Taro **4.0.9** + React 18 + TypeScript + Sass + Webpack 5；小游戏为 **TS → 编译到 `js/*.js`** |
| 设计稿 | `designWidth: 750`；H5/小程序样式多用 `rpx`；小游戏内用 `rp(W,n) = (n/750)*W` 对齐视觉 |
| 仓库 | `README.md`、`scripts/setup-git-github.ps1`、`gh` 上传 GitHub |
| 小程序 CI | `@tarojs/plugin-mini-ci`；凭据 **`.env.upload`**（从 `.env.upload.example`），微信私钥 `key/` |

### 常用命令

```bash
npm install
npm run dev:h5              # H5，常见 http://localhost:10086/
npm run build:h5
npm run dev:weapp / build:weapp
npm run dev:tt / build:tt
npm run build:minigame      # 仅编译微信小游戏 TS → minigame-wechat/js/
npm run upload:weapp / upload:tt / upload:mini
```

---

## 2. 诉求与时间线摘要（Prompt 检索）

对话中出现过的意图，便于回答「为何这样改」：

| 主题 | 摘要 |
|------|------|
| 启动与依赖 | 修依赖、`npm run dev:h5`；Windows PATH；cnpm/镜像 |
| 数独逻辑 | 覆盖非题面格、冲突回退、`digHoles` 洗牌；`formatSeconds` |
| H5 白屏 | `h5.devServer.static: false`；`src/index.html` 须存在 |
| 404 / 诊断 | `h5.publicPath: '/'`；`devDiagnostics.ts` |
| PowerShell | `npm` 找不到 → PATH；`npm.ps1` → `npm.cmd` 或 `RemoteSigned` |
| 键盘/输入（H5） | 去掉屏上 1–9 键盘；物理键/隐藏 `Input`；hook 顺序避免 `fillNumber` 死区 |
| 布局与 UI（Taro） | Grid 宫格线、按钮与棋盘同宽、暖色纸感、九宫格底纹 |
| 性能（Taro） | `React.memo` 棋盘、`Set` 冲突索引、`collectConflictIndices` |
| **微信小游戏** | 底部 3×3 数字键；主列 `maxW`/`padX` 对齐；安全区垂直居中；按下鲜艳色、抬起统一玻璃色、松手缓动；性能：避免每帧 `canvas.width`、光斑渐变缓存、棋盘热路径优化；**源码 `minigame-wechat/src/*.ts`，改后必 `npm run build:minigame`** |
| 文档与 Git | `.gitignore`、`README.md`、winget Git/gh |
| **本文档** | 汇总 prompt、规则路径、Skills、小游戏与恢复协议 |

---

## 3. 目录与关键文件

```
SudokuTaro/
├── config/index.ts
├── src/
│   ├── index.html              # H5 模板（须存在）
│   ├── pages/index/            # 数独 UI（React）
│   └── utils/sudokuEngine.ts   # 与小游戏引擎逻辑应对齐
├── minigame-wechat/            # 微信小游戏（独立子工程）
│   ├── game.js                 # require('./js/main.js')
│   ├── game.json
│   ├── tsconfig.json           # rootDir: src, outDir: js
│   └── src/
│       ├── main.ts             # Canvas 入口（全量类型）
│       ├── sudokuEngine.ts
│       ├── types.ts
│       └── wx.d.ts             # wx 最小类型声明
│   └── js/                     # tsc 输出（main.js / sudokuEngine.js），运行时用此目录
├── package.json                # 含 build:minigame
├── README.md
└── CONTEXT.md                  # 本文件
```

---

## 4. 架构要点（易忘）

### Taro（H5 / 小程序）

- 配置页用 **`.js`**（`app.config.js` 等）避免 Node 读配置时触发 `window`。
- 棋盘：`display: grid` + `repeat(9, minmax(0,1fr))`；主列约 `690rpx` 与棋盘对齐。
- 冲突：`Set<number>`，键 `row * 9 + col`。

### 微信小游戏（`minigame-wechat`）

- **入口**：`game.js` → `js/main.js`（由 `src/main.ts` 编译）。
- **引擎**：`src/sudokuEngine.ts` 注释要求与 `src/utils/sudokuEngine.ts` 逻辑同步。
- **布局**：`getLayout()` 缓存键 `W_H_dpr`；棋盘宽度优先 `maxW`，极端情况缩小并居中。
- **触摸**：数字键 `touchstart` 高亮，`touchend` 同键才 `fillNumber`，`numReleaseAnim` 驱动回弹动画。
- **改代码流程**：编辑 `minigame-wechat/src/*` → `npm run build:minigame` → 开发者工具预览。

---

## 5. Cursor / 用户规则（路径 + 摘要）

完整条文请 **Read 原文**；此处仅摘要，避免与 `.mdc` 不同步。

| 名称 | 路径（本机） | 摘要 |
|------|----------------|------|
| PUA 万能激励引擎 | `C:\Users\yuqiu\.cursor\rules\pua.mdc` | 先穷尽自查、先工具后提问、主动验证与交付；失败用方法论复盘 |
| 提问前先读 PUA | `C:\Users\yuqiu\.cursor\rules\read-pua-before-questions.mdc` | 用户问答场景下先读 `pua.mdc` 再答 |
| Awesome DESIGN.md | `C:\Users\yuqiu\.cursor\rules\awesome-design-md.mdc` | 指定「像某站」时从 `C:\Users\yuqiu\awesome-design-md\design-md\<品牌>\DESIGN.md` 复制并对照 |

**用户偏好（仓库级）**：中文简体；能跑命令则自己跑；改动克制、匹配现有风格；无明确要求不写大段无关文档。

---

## 6. Agent Skills（本机路径）

与任务相关时 **Read 对应 `SKILL.md` 再执行**：

| Skill | 路径 | 何时用 |
|-------|------|--------|
| babysit | `...\skills-cursor\babysit\SKILL.md` | PR 合并、CI、评论循环 |
| create-rule | `...\skills-cursor\create-rule\SKILL.md` | 新建/修改 `.cursor/rules` 或规则 |
| create-skill | `...\skills-cursor\create-skill\SKILL.md` | 新建/修改 Skill |
| update-cursor-settings | `...\skills-cursor\update-cursor-settings\SKILL.md` | 改 `settings.json` 等 |

---

## 7. Windows 与终端备忘

- **PATH**：`C:\Program Files\nodejs`；全局 npm：`%AppData%\npm`。
- **`npm.ps1` 被策略拦截**：`npm.cmd` 或 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`。
- **Git / gh**：`winget install Git.Git`、`winget install GitHub.cli`；`gh auth login` 勿把 Token 贴给 AI。

---

## 8. 依赖与构建备忘

- 锁文件损坏可删 `package-lock.json` 后重装。
- Webpack `EntrypointsOverSizeLimitWarning` 为体积提示，非失败。
- **小游戏**：根目录 `typescript` 供 `tsc`；小游戏独立 `minigame-wechat/tsconfig.json`。

---

## 9. 后续可选事项

- 三端真机再验输入与安全区。
- 唯一解题目可在挖洞后加求解计数。
- 设计改版按 `awesome-design-md` 中品牌 `DESIGN.md`。

---

## 10. 新会话建议 Prompt 模板（可复制）

```
先 Read 仓库内 CONTEXT.md 全文。
项目：SudokuTaro（Taro 4 + React + TS，路径 c:\Users\yuqiu\SudokuTaro）。
若改微信小游戏：源码在 minigame-wechat/src/，改完执行 npm run build:minigame。
若改 UI 品牌风：再读 pua.mdc（若适用）与 awesome-design-md 规则。
需求：<在此写任务>
约束：只改必要文件；需要时跑 npm run build:h5 或 build:minigame 验证。
```

---

## 11. 上下文将满时的操作（给 AI / 协作者）

1. **把仍有效的结论**写入本文件对应小节（表格或列表），避免只留在对话里。  
2. **长代码**不要贴进 CONTEXT；写文件名 + 行为一句描述即可。  
3. **规则与 Skills** 仍以磁盘上的 `.mdc` / `SKILL.md` 为准；本文只维护路径与摘要。  
4. 新会话 **首条消息** 可要求：`先 Read CONTEXT.md`，再执行任务。

---

*文档随仓库迭代；重大架构或配置变更时请同步更新本节或 README。*
