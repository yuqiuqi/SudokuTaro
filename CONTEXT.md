# SudokuTaro — 上下文与协作总览（CONTEXT）

> **用途**：新会话或新协作者用 **Read 工具** 读本文件，在上下文将满时优先把**可复用事实**沉淀在此，避免重复交代 prompt、规则路径与工程约定。  
> **原则**：具体实现以仓库代码为准；此处为索引与摘要，重大改动后请顺手更新对应小节。

---

## 当前实现（v1.2.1 · 手机整体布局与只读题面）

- 本节覆盖下方历史中的旧界面、输入和道具描述。当前真源为 `src/pages/index/index.tsx`、`index.scss`、`useGameLayout.ts`、`src/utils/gameplay.ts` 与 `src/styles/_glass-tokens.scss`。Figma 文件 `AhWwkAjjXti2imJAbhgrTY` 的 V2 根节点 `20:545` 为视觉基准；H5 使用实际 CSS px，关闭 `h5.postcss.pxtransform`，不要恢复 rpx 缩放。
- 手机标题、状态、棋盘、工具及数字面板共用 `--board-size` 主列；充分空间时左右目标各 6px，安全区优先，棋盘最大 414px。紧凑头部 52px，选格说明并入固定 28px 反馈行。普通手机工具真实点击高度 44px、数字 45px，统一 5/4 两排，工具到数字区 10px；完整 `game-shell` 上下 auto margin 居中。320×480 整列回退到 202px、工具高度 34px、组间距 8px，数字高度仍 45px，但宽度约 33px；小屏不能套用普通手机触控目标保证。不要恢复高屏键盘独立钉底。
- 尺寸预算取 parent 的真实安全可用高度，避免自然内容高度反馈；模式分类采用独立稳定的 20px／安全区基准。错误、提示开关及换层不改变棋盘预算；提示通过不可访问的自然尺寸副本预留各层全文空间，active 文案唯一可访问。横屏与折叠分区保留专用回退。
- 棋盘为原生按钮，initial 给定格原生 `disabled` 并恢复 `opacity:1`，保留可读数值／标签，不可点击、修改或进入焦点；choose／fill 也防御题面。方向键仅在原行／列内搜索可编辑格，跳过给定数，无目标保留原格，并同步 `focus({preventScroll:true})`。同数、行列宫与提示辅助高亮保留，不等于独占 `is-selected` 框。Taro 会改写 button 标签选择器，原生按钮样式用 `[type="button"]`；不要恢复隐藏 Input 或 ScrollView。
- 保留候选数、完整撤销、唯一解、中英文分层提示／规则、保存与纪录；撤销／擦除免费，`gameEconomy.ts` 是历史保留模块。胜利流程仍为 `wave → seams → null`：960ms 单格包络、90ms 对角延迟，总 2400ms，随后 650ms 单次青柠缝隙光，两段由真实 animationend 衔接。减少动态效果、Escape、菜单／新局取消及刷新不重复记胜场不变。
- 功能 [PR #16](https://github.com/yuqiuqi/SudokuTaro/pull/16) 合并为 `5e2e912`，与已审查实现 `ec0bf50` 的 tree 一致。类型检查、9 项逻辑测试、根路径／Pages 完整 Chromium 回归通过，运行时错误为空；独立 AI 代码与视觉审阅无必改项。该合并提交的 [Pages 实际部署](https://github.com/yuqiuqi/SudokuTaro/actions/runs/39742465142) 已成功；18 次正常 TLS 请求取得线上资源，经 loopback Chromium 验证布局、只读题面、反馈／提示、焦点及胜利／刷新流程，运行时错误为空。此路线不同于直接在线导航，未修改信任库或关闭 TLS。同合并提交的 [主分支 CI](https://github.com/yuqiuqi/SudokuTaro/actions/runs/39742465146) 已通过；正式 tag／Release 后续状态见 [公开执行记录](https://github.com/yuqiuqi/SudokuTaro/pull/16#issuecomment-6335382360)，完整证据见 [v1.2.1 说明](docs/releases/v1.2.1.md)；历史证据见 [v1.2.0](docs/releases/v1.2.0.md)。
- 代码修改后按 `AGENTS.md` 完成类型检查、逻辑测试、构建与浏览器回归；Pages 需配对子路径构建与测试，仅文档修改检查差异。浏览器 CSS 尺寸／分区模拟不等同小米 17 移动 Edge、iOS Safari、屏幕阅读器或安全区／折叠硬件实测。现行测量与回归见 `docs/RESPONSIVE_DESIGN.md`。

## 1. 项目卡片

以下项目卡片、时间线及旧架构备忘保留早期工程背景；与上方当前实现冲突的 rpx、隐藏输入和道具消耗等描述仅供历史检索。

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
