# SudokuTaro — 上下文与协作总览（CONTEXT）

> **用途**：新会话或新协作者用 **Read 工具** 读本文件，在上下文将满时优先把**可复用事实**沉淀在此，避免重复交代 prompt、规则路径与工程约定。  
> **原则**：具体实现以仓库代码为准；此处为索引与摘要，重大改动后请顺手更新对应小节。

---

## 当前实现（2026-10 Liquid Glass 改版）

- 本节覆盖下方历史时间线中的旧界面、输入和道具描述。当前真源为 `src/pages/index/index.tsx`、`useGameLayout.ts`、`src/utils/gameplay.ts` 与 `src/styles/_glass-tokens.scss`。
- 已确认的 Figma 文件：`AhWwkAjjXti2imJAbhgrTY`，V2 设计根节点 `20:545`（原响应式稿 `9:173` 保留）。H5 使用实际 CSS px，关闭 `h5.postcss.pxtransform`，不要恢复 rpx 缩放。
- 原生按钮选择格子 + 页面内常驻 1～9。不要恢复隐藏 Input 或 ScrollView。Taro 会改写 CSS 的 button 标签选择器，原生按钮样式用 `[type="button"]`。
- 候选数、完整撤销、分层逻辑提示、唯一解验证、中英文分页规则、自动保存、通关纪录。胜利组件 `VictoryResult.tsx/scss` 提供庆祝、成绩卡与小屏专属布局；减少动态效果跳过庆祝，刷新不重复记胜场。撤销/擦除免费；`gameEconomy.ts` 是保留的旧模块，主游戏不再消耗道具。
- 布局根据实际可用 CSS 宽高选择，几何与交互测试见 `tests/browser.cjs`，测试矩阵和能力限制见 `docs/RESPONSIVE_DESIGN.md`。
- 命令：`npm run typecheck`、`npm test`、`npm run build:h5`、`npx playwright install chromium && npm run test:browser`。
- 用户要求每次代码修改完成后必做浏览器模拟测试，再交付或更新 PR；完整流程与已知回归场景见仓库根目录 `AGENTS.md`。仅文档修改检查差异即可。

## 1. 项目卡片

| 项 | 内容 |
|----|------|
| 名称 | SudokuTaro |
| 路径 | `c:\Users\yuqiu\SudokuTaro`（以本机为准） |
| 描述 | 数独 — **Taro 仅 H5**（浏览器端 React，无微信/抖音小程序、无微信小游戏子工程） |
| 栈 | Taro **4.3.0** + React 18.3.1 + TypeScript 7.0.2 + Sass + Webpack 5.91.0；Node 22+ |
| 存档 / 经济 | **`src/utils/gameEconomy.ts`**（`Taro.getStorageSync`），**`STORAGE_KEY = 'yifang_sudoku_economy_v1'`**；含 **撤销/擦除道具**、每日赠送、**设置仅 `vibration`**；**已移除体力** |
| 设计稿 | `designWidth: 750`；样式多用 `rpx` |
| 仓库 | `README.md`、各平台 Git 工作流以本机为准 |

### 常用命令

```bash
npm install
npm run dev:h5              # 常见 http://localhost:10086/
npm run build:h5
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
| **经济与 UI（Taro）** | 无体力；撤销/擦除消耗道具（无角标数字）；**设置**仅「按下数字时震动」；**meta 行** 两钮 `flex:1` + `gap:12rpx` 与主列同宽；**操作行** 专用 `btn--action` + `hoverClass` + **`hoverStayTime={0}`** + 默认 `transition:none`，避免松手后 hover 粘滞 |
| 文档与 Git | `.gitignore`、`README.md`、winget Git/gh |
| **本文档** | 汇总 prompt、规则路径、Skills 与恢复协议 |

---

## 3. 目录与关键文件

```
SudokuTaro/
├── config/index.ts
├── src/
│   ├── index.html              # H5 模板（须存在）
│   ├── pages/index/            # 数独 UI（React）
│   └── utils/
│       ├── sudokuEngine.ts
│       └── gameEconomy.ts      # 道具、每日赠送、震动设置
├── package.json
├── README.md
└── CONTEXT.md                  # 本文件
```

---

## 4. 架构要点（易忘）

### Taro（仅 H5）

- 配置页用 **`.js`**（`app.config.js` 等）避免 Node 读配置时触发 `window`。
- 棋盘：`display: grid` + `repeat(9, minmax(0,1fr))`；主列约 `690rpx` 与棋盘对齐。
- 冲突：`Set<number>`，键 `row * 9 + col`。

### 经济与设置

- **无体力**；新局 / 换难度 / 再来一局 **不扣体力**。
- **道具**：撤销、擦除消耗；不足时 toast；每日首次进入 `applyDailyBonus` 增加道具（见 `gameEconomy.ts`）。
- **设置**：仅 **`vibration`**；开启时按下数字键轻震（`Taro.vibrateShort` 等 H5 能力）。

---

## 5. 协作约定

仓库级协作规则统一维护在 [`AGENTS.md`](./AGENTS.md)，包括用户偏好、规划入口、视觉与动效约定，以及代码修改后的验证要求。

---

## 6. Agent Skills

根据当前会话实际提供的技能及其说明使用相关 `SKILL.md`；不依赖某台机器上的技能安装路径。

---

## 7. Windows 与终端备忘

- **PATH**：`C:\Program Files\nodejs`；全局 npm：`%AppData%\npm`。
- **`npm.ps1` 被策略拦截**：`npm.cmd` 或 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`。
- **Git / gh**：`winget install Git.Git`、`winget install GitHub.cli`；`gh auth login` 勿把 Token 贴给 AI。

---

## 8. 依赖与构建备忘

- v1.1.0 升级详情与上游兼容阻塞见 `docs/DEPENDENCY_UPGRADE.md`。禁止强装 React 19 / Babel 8 / Webpack 最新版来绕过 Taro peers。
- TypeScript 7 不再支持旧 transpileModule；纯逻辑测试通过 tsc CLI 编译临时模块。tsconfig 使用 ESNext/bundler 与相对 paths，Sass 声明位于 `types/styles.d.ts`。

- 锁文件损坏可删 `package-lock.json` 后重装。
- Webpack `EntrypointsOverSizeLimitWarning` 为体积提示，非失败。

---

## 9. 后续可选事项

- H5 真机/多浏览器再验输入与布局。
- 唯一解计数已接入挖洞逻辑，并有自动化测试。
- 设计改版以已确认的 Figma 设计和仓库内相关设计文档为依据。

---

## 10. 上架与表单备忘（非代码）

- **平台表单**若仍要求选引擎：以 **Taro H5 + React** 自研说明为准（若仍有上架场景）。
- **版本更新说明**：约 150 字概括 UI/操作/动效等改动即可。

---

## 11. 新会话建议 Prompt 模板（可复制）

```
先阅读仓库内 AGENTS.md 和 CONTEXT.md。
项目：SudokuTaro（Taro 4 + React + TS，**仅 H5**）。
若改 UI：再阅读 docs/RESPONSIVE_DESIGN.md 与相关设计文档。
需求：<在此写任务>
约束：只改必要文件；每轮代码修改后按 AGENTS.md 完成类型检查、逻辑测试、构建与浏览器测试。
```

---

## 12. 上下文将满时的操作（给 AI / 协作者）

1. **把仍有效的结论**写入本文件对应小节（表格或列表），避免只留在对话里。  
2. **长代码**不要贴进 CONTEXT；写文件名 + 行为一句描述即可。  
3. **协作规则**以仓库 `AGENTS.md` 为准；技能使用当前会话提供的 `SKILL.md`，本文只维护项目上下文与索引。
4. 新会话 **首条消息** 可要求：`先 Read CONTEXT.md`，再执行任务。

---

*文档随仓库迭代；重大架构或配置变更时请同步更新本节或 README。*
