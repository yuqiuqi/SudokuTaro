# 方寸数独 — 上下文与协作总览（CONTEXT）

> **用途**：新会话或新协作者用 **Read 工具** 读本文件，在上下文将满时优先把**可复用事实**沉淀在此，避免重复交代 prompt、规则路径与工程约定。  
> **原则**：具体实现以仓库代码为准；此处为索引与摘要，重大改动后请顺手更新对应小节。

---

## 当前实现（v1.2.5 · 双语文档与品牌统一）

- v1.2.5 补齐中英文 README 对照，统一包／构建／日志／工作流／规划文档的产品称谓。仓库保持公开；main 保护与远端简介修改因当前 integration 缺少 Administration 权限返回 403，配置与操作步骤见 [仓库安全说明](docs/REPOSITORY_SECURITY.md)，不能声称已启用。v1.2.5 本轮类型检查、26 项逻辑测试、根路径／Pages 配对构建与完整浏览器均通过，运行时错误为空，八组手机几何两路径一致；独立 AI 全差异审阅无未解决问题。远端 PR／准确 main 部署与 Release 以实际后端记录为准。
- 产品显示名为「方寸数独」，HTML／页面标题与可见品牌保持一致。技术包名和构建项目名使用 `fangcun-sudoku`；仓库名、Pages URL 与存档 key 保留兼容标识。新局实际给定数为简单 36–40／中等 31–35／困难 26–30，最多两次生成后使用唯一解模板兜底；只约束线索数量，不构成专业逻辑技巧评级。旧存档不按新范围淘汰。
- 本节覆盖下方历史中的旧界面、输入和道具描述。当前真源为 `src/pages/index/index.tsx`、`index.scss`、`useGameLayout.ts`、`src/utils/gameplay.ts` 与 `src/styles/_glass-tokens.scss`。Figma 文件 `AhWwkAjjXti2imJAbhgrTY` 的 V2 根节点 `20:545` 为视觉基准；H5 使用实际 CSS px，关闭 `h5.postcss.pxtransform`，不要恢复 rpx 缩放。
- 手机标题、状态、棋盘及数字面板共用 `--board-size` 主列，工具组在列内略收窄并保留间隔；左右最小留白各 14px，安全区优先，棋盘最大 414px。紧凑头部 52px，选格说明并入固定 28px 反馈行。普通手机工具真实点击高度 44px、数字 45px，统一 5/4 两排，工具到数字区 10px；完整 `game-shell` 上下 auto margin 居中。320×480 整列回退到 202px、工具高度 34px、组间距 8px，数字高度仍 45px，但宽度约 33px；小屏不能套用普通手机触控目标保证。不要恢复高屏键盘独立钉底。
- 棋盘采用平整正视的实体材质：4px 底沿、接触阴影、统一左上高光；格面浅倒角与数字轻浮雕保留数字可读性。工具键采用静态浅浮起质感；数字键以 2px 基座呈现凸起键帽，按下使用 `translateY(1px)`，减少动态效果时取消位移与过渡。极窄横屏按实际可用宽度同时预算棋盘与控制区，保留左右留白；不要把最窄控制区回退应用到全部宽屏。材质不改变共享主列、给定格只读、同数辅助、反馈／提示占位及胜利流程；未新增依赖。
- 尺寸预算取 parent 的真实安全可用高度，避免自然内容高度反馈；模式分类采用独立稳定的 20px／安全区基准。错误、提示开关及换层不改变棋盘预算；提示通过不可访问的自然尺寸副本预留各层全文空间，active 文案唯一可访问。横屏与折叠分区保留专用回退。
- 棋盘为原生按钮，initial 给定格原生 `disabled` 并恢复 `opacity:1`，保留可读数值／标签，不可点击、修改或进入焦点；choose／fill 也防御题面。方向键仅在原行／列内搜索可编辑格，跳过给定数，无目标保留原格，并同步 `focus({preventScroll:true})`。同数、行列宫与提示辅助高亮保留，不等于独占 `is-selected` 框。Taro 会改写 button 标签选择器，原生按钮样式用 `[type="button"]`；不要恢复隐藏 Input 或 ScrollView。
- 可编辑格选中后，数字键按当前行／列／宫已有数字禁用并以颜色区分，排除当前格自身，不读取 solution 过滤。换格、填数、擦除、撤销后重算；笔记不能新增冲突候选。未选格时保留先选格反馈；禁用按钮不触发点击，实体键盘的非法输入仍由填数逻辑拒绝，并显示稳定冲突反馈。
- 分层提示当前免费；`src/utils/hintAccess.ts` 预留未来广告接入，默认没有 provider，广告可用前不显示广告说明或观看入口。只有已就绪的 provider 才能进入观看确认，完整观看并收到 rewarded 才发放提示；取消、失败不增加提示次数，并防护重复点击和迟到回调。没有接入真实广告 SDK，不模拟广告或奖励；未来 provider-ready 确认弹窗的焦点／交互未做浏览器实测，奖励控制器有逻辑测试与接线审阅，接口细节以源码为准。
- 保留候选数、完整撤销、唯一解、中英文分层提示／规则、保存与纪录；撤销／擦除免费，`gameEconomy.ts` 是历史保留模块。胜利流程仍为 `wave → seams → null`：960ms 单格包络、90ms 对角延迟，总 2400ms，随后 650ms 单次青柠缝隙光，两段由真实 animationend 衔接。减少动态效果、Escape、菜单／新局取消及刷新不重复记胜场不变。
- 新手教程扩展为七页中英文图解：行、列、3×3 宫、填数与数字状态、笔记／擦除／撤销、免费分层提示与高亮、新局／保存／语言。教程数据位于 `src/utils/tutorial.ts`，行列宫使用真实 9×9 示意，分页及进度由数据长度驱动；保留既有免费分层提示与未来广告控制器。
- 上半区 topbar 提供显眼新局入口，复用新局弹窗，明确选择难度后生成新题并替换；关闭继续原局，不提前清档。原难度及设置入口保留。所有弹窗（含胜利）复用 `LanguageSwitch`，统一提供中文／English 两个显式选项，以选中态、勾选及 `aria-pressed` 表达当前语言；重复选择当前语言不产生切换，偏好持久化。语言项在所有尺寸真实高度均为 44px；新局入口在极小屏使用短标签，保留主头 52px／32px 的预算回退。
- 格线改用低饱和灰蓝，宫线稍深，保留选中数字与辅助高亮的主次。四工具键有真实间隙、横向范围略收窄；普通高度保留 44px，受限横屏及竖排模式继续按可用空间适配。本轮根路径／Pages 八组手机几何完全一致；普通手机实际 gap 为 8px，高度受限手机 5px，极短横屏竖排 4px。240px 高横屏教程将进度移至头部空位并收紧留白，设置摘要并排，保留语言 44px 与完整图文。
- 振动由浏览器 Vibration API 能力决定：API 不存在时开关 disabled、有效 `aria-checked=false`，并以中英文原因及 `aria-describedby` 说明；保存偏好可保留 true，但有效状态为关闭。支持的设备继续在用户操作中调用。iOS Safari 不支持该 API（本地 caniuse-lite 的 iOS Safari 27.2 仍标记 n），仅 H5 不能补出原生触觉；未做 iOS 真机实测，无模拟触觉替代。
- v1.2.4 本轮类型检查、26 项逻辑测试、根路径／Pages 配对构建与完整浏览器回归均通过，两轮运行时错误为空，部署验证器本地生产预检通过；预检不作为线上证据。四张新图来自本轮 Pages 生产构建的回环 Chromium，实际中等新局 32 个给定数，设置为无 API 模拟。构建仍有 app 约 282KiB 超过建议 244KiB 的入口提示，未调整阈值隐藏。验证范围见 [v1.2.4 说明](docs/releases/v1.2.4.md)。远端结果以 [GitHub Actions](https://github.com/yuqiuqi/SudokuTaro/actions)、[GitHub Releases](https://github.com/yuqiuqi/SudokuTaro/releases) 和 [PR 记录](https://github.com/yuqiuqi/SudokuTaro/pulls) 为准。已正式发布的历史证据保留在 [v1.2.3](docs/releases/v1.2.3.md)、[v1.2.2](docs/releases/v1.2.2.md)、[v1.2.1](docs/releases/v1.2.1.md) 与 [v1.2.0](docs/releases/v1.2.0.md)。
- 代码修改后按 `AGENTS.md` 完成类型检查、逻辑测试、构建与浏览器回归；Pages 需配对子路径构建与测试，仅文档修改检查差异。浏览器 CSS 尺寸／分区模拟不等同小米 17 移动 Edge、iOS Safari、屏幕阅读器或安全区／折叠硬件实测。现行测量与回归见 `docs/RESPONSIVE_DESIGN.md`。

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
