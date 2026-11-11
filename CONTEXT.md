# 方寸数独 — 上下文与协作总览（CONTEXT）

> **用途**：新会话或新协作者用 **Read 工具** 读本文件，在上下文将满时优先把**可复用事实**沉淀在此，避免重复交代 prompt、规则路径与工程约定。  
> **原则**：具体实现以仓库代码为准；此处为索引与摘要，重大改动后请顺手更新对应小节。

---

## 当前实现（2.0.0 候选，2026-11-11，待用户最终审核）

- 当前分支 `feat/courtyard-redesign`，基线 `38829ab`；线上仍为既有 v1.3.0。包内 2.0.0 不是正式发布。本轮禁止合并、push main、部署、打 tag、Release；准确提交的 CI 和 AI review 不替代最终用户审核。
- 当前为 React18.3.1 + React DOM + Vite8.3.8/plugin-react6.3.0 + TypeScript7.0.2/Sass，Node>=22.12.0。移除 Taro/Babel/Webpack 活跃入口和依赖；保留 `dev:h5`、`build:h5` 命令名、SudokuTaro 仓库／Pages URL、旧 hash 与存档 key。入口为根 `index.html`、`src/main.tsx`、`src/app.tsx`、`vite.config.ts`。
- 规则仍在 `utils/gameplay.ts` 和 `sudokuEngine.ts`；存档边界 `platform/storage.ts`；会话/计时、纯 DOM 展示、胜利演出分别在 `features/game/`。页面仍组合菜单、输入和首次胜局事件，不声称彻底无耦合。animationend 只管演出，不记分或发章。
- 原生81格、只读题面、简单冲突数字禁用／中高难度九键、笔记、免费擦除撤销／分层提示、七页双语教学和 wave→seams→结果／再赏保留。撤销只恢复棋盘与笔记，history 不持久化。旧存档补稳定 sessionId，旧完成局不重新计胜或解锁；旧 wins 不倒填故事。
- 新增八篇完整中英《院子留一盏灯》与原创 SVG 八阶段旧院。首篇免费，此后每个首次新胜局至多1篇、最多7个获章 sessionID。已读和解锁分开；只玩数独关闭通知但继续积累，手动入口保留。无账号／云同步、体力／签到、广告付费门槛、真实日期活动或无限故事。庭院和阅读主动打开，正文可内部滚动；主游戏页仍不可滚动。
- 暖瓷、纸页、墨绿与少量铜金取代旧雾蓝玻璃。普通输入140ms局部显现、首次完成单元260ms柔光；新物件600ms一次显现，门灯9s和风铃8s低幅循环。hidden/reduced停止相关动效。品牌入口常规高屏44px目标/64px头部，受限屏保留32px入口妥协；共享主列、14px留白、5/4数字键和反馈稳定预算继续保留。Vibration API 缺失时禁用并说明。
- 本地 key：`sudokutaro:glass:v1`、`sudokutaro:records:v1`、`sudokutaro:language`、`sudokutaro:vibration`；新增 `fangcun:courtyard:v1` 与仅呈现收据 `fangcun:courtyard:revealed:v1`。JSON损坏/存储异常防御读取；存储失败当次可玩，不承诺跨 key 事务、多标签一致性或刷新后持久。
- 技能在本云环境 `/home/agent/.agents/skills` 全量安装77项+router，固定上游 SHA `dcf3bbbb83f365632402c086bf595048aa24aaa8`、Apache-2.0，逐字节一致；不意味着其他机器已装，不通过 npm hook 自动执行第三方内容。复现及实际使用记录见 `docs/GAMEDEV_SKILLS.md`。
- 新进展：用户新增参考 `Donchitos/Claude-Code-Game-Studios`，固定 `abc0de79d6ceb0b5d7aa693945849b3937afbe6a`、MIT。团队只读研究并采用已有项目审查、系统边界、真实运行留证和长期体验验证原则，没有安装Claude hooks/settings或全49agent。来源与Codex适配见[采用记录](docs/CLAUDE_GAME_STUDIOS_ADOPTION.md)。用户授权继续自主工作，最终合并审核不变；动态世界增量源码已冻结：新增三种氛围／静止、已修物件观察与偏爱；主线后十二新胜局开放十二笺／六组双层日常物件。聚合useCourtyardState拥有故事与life完成状态、world偏好及显现收据，applyCourtyardCompletion跨两ledger去重，一局只进入一个奖励域；不声称完整验收已过。
- 新数据：`fangcun:courtyard:world:v1`保存氛围／静止／偏爱；`fangcun:courtyard-life:v1`保存最多12获笺session与已读；`fangcun:courtyard-life:revealed:v1`仅显现收据。已有主线key／旧游戏key保持。源码内容全文见[十二笺](docs/story/COURTYARD_LIFE_NOTES.md)，非无限故事。
- 最终本地证据：同一61文件冻结候选typecheck、60逻辑、无warning根／Pages构建、旧庭院31.26s／新world33.38s专项、增强1176几何（含innertext）0失败99.11s、完整ROOT441.30s／PAGES451.73s均通过，runtimeErrors=[]；冻结文件未变。审核入口[COURTYARD_V2_CANDIDATE](docs/reviews/COURTYARD_V2_CANDIDATE.md)链接13PNG、连续10.92sMP4、全部fixture来源、61源快照与产物hash和原始测量JSON。此前worldless结果不再代替本轮证据。
- 同机产物JS raw341052→243973、gzip114278→83424；CSS raw45430→54725、gzip9062→10484。候选三context就绪415/399/358ms及两帧代理p50约33.3ms；只是自动化观测，不证明真机FPS／输入延迟／启动改善或留存。无真实iOS/小米17/折叠设备、屏幕阅读器、30分钟真人soak。独立AI视觉／叙事检查13图和最终video关键帧／接触表未留P2，准确head代码review／远端CI仍待PR核验，用户最终审核pending。
- 新动态世界[规格](docs/superpowers/specs/2026-11-11-courtyard-living-world-design.md)／[计划](docs/superpowers/plans/2026-11-11-courtyard-living-world.md)。此前旧院重设计规格/计划：`docs/superpowers/specs/2026-11-11-courtyard-redesign-design.md`、`docs/superpowers/plans/2026-11-11-courtyard-redesign.md`；架构 `docs/architecture/COURTYARD_V2.md`；适配 `docs/RESPONSIVE_DESIGN.md`；资产 `docs/art/courtyard-assets.json`。协作验证与用户审批以 `AGENTS.md` 为准。

## 以下为历史背景（不是当前运行或安装指南）

v1.3.0 的既有发布说明、旧截图与验证证据见 `docs/releases/v1.3.0.md`。下方保留原工程时间线、旧文件路径和工具链备忘；其中 Taro、Webpack、rpx、隐藏输入、道具消耗等不得用于判断当前源码。新会话使用上方当前实现与本轮规格；当前事实优先。

## 1. 项目卡片

以下项目卡片、时间线及旧架构备忘保留早期工程背景；与上方当前实现冲突的 rpx、隐藏输入和道具消耗等描述仅供历史检索。

| 项 | 内容 |
|----|------|
| 名称 | 方寸数独 · Fangcun Sudoku |
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
项目：方寸数独（Fangcun Sudoku，Taro 4 + React + TS，**仅 H5**）。
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
