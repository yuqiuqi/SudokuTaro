---
phase: 1
slug: apple-ui-motion
status: approved
shadcn_initialized: false
preset: apple-like-taro
created: 2026-04-22
updated: 2026-04-23
reviewed_at: 2026-04-23
---

# Phase 1 — UI Design Contract（Apple 向 · Taro）

> 面向 `src/pages/index/` 主游戏界面及全局 `app.scss` 的增量。与微信小程序 / H5 / 抖音小程序共用一套 token。  
> **本版（Update）**：以仓库内真源为基线，吸收 `01-REPLAN-NOTE` / `01-04-PLAN` 中的**全局 H5 点击高亮**与**无 `backdrop-filter` 时实色回退**契约，并收束**字号/字重**表述以满足六维检查。

---

## Design System

| Property | Value |
|----------|-------|
| **真源（全量）** | **`src/styles/_apple-ui-tokens.scss`**：全站色板、英雄光斑、棋盘语义、玻璃/阴影/动效 mixin；`src/app.scss` 为全局 `page`/`body` 基线；`src/utils/theme.ts` 为 TS 交叉引用。禁止在业务样式中散落与语义色无关的硬编码 hex。 |
| Tool | **none**（手写 Sass + `theme.ts` 常量，与上表同 PR 维护） |
| Preset | **apple-like-taro**（行为与层级对齐 Apple HIG 方向，非官方资源） |
| Component library | **none**（保持页面内 `React.memo` 子组件） |
| Icon library | **none**（暂用文本与简单几何；若引入图标须为 **SVG**，禁止 emoji 充当图标） |
| Font | 系统字体栈见 `_apple-ui-tokens.scss` 中 `$ui-font-stack`（H5）；小程序以各端系统字体为准，不强制 Web 字体文件。 |

### 视觉层次（主屏锚点）

- **主锚点**：9×9 棋盘区（计步、高亮、冲突等玩法反馈优先）。  
- **次锚点**：底部操作行中 **「新开一局」** 主 CTA（与 accent 使用规则一致，不可全按钮铺色）。  
- 顶区 Hero 光斑为**氛围层**，不遮挡棋盘可读性。

---

## Spacing Scale

**基准：** 750 设计稿，**4 的整数倍 rpx**（与 Taro 习惯一致；与 8 点制语义对齐）。

| Token | rpx | 用途 |
|-------|-----|------|
| xs | 8 | 紧密间隙、小圆角内边距 |
| sm | 16 | 按钮内边距、格线邻近区域 |
| md | 24 | 卡片内边距、主列元素间隙 |
| lg | 32 | 区块分隔 |
| xl | 48 | 大段留白、棋盘外呼吸区 |

**Exceptions：** 九宫格 81 格区域以「撑满主列宽」优先，内部 `gap` 可为 **0**；仅外层容器使用上表 token。

---

## Typography

**约束（六维可执行）**：**4 档字号** + **2 种字重**（400 / 600）。未单独列第三档字重；「标签感」用字号档 T3 与色阶区分。

| 档 | Role | rpx | Weight | Line height | 使用 |
|----|------|-----|--------|-------------|------|
| T0 | Display | 40–44 | 600 | 1.2 | 通关大标题等 |
| T1 | Title + **棋盘数字** | 32–36 | 600 | 1.0（格内垂直居中） / 1.2（标题行） | 区块标题、格内填数（与 UI 现状一致，可区分数位 tabular-nums 于 H5） |
| T2 | Body | 28–30 | 400 | 1.35 | 计时、步数、主要说明；关键统计 **≥ 26rpx**（EXP-03） |
| T3 | Caption | 24–26 | 400 | 1.3 | 辅助说明、次标签 |

**最小可读：** 关键统计（计时、步数）在 750 宽下 **≥ 26rpx**（落在 T2/T3 上界与 T1 可衔接区间时须符合）。

---

## Color

| Role | 值（与代码/SCSS 对齐） | 用途 |
|------|------------------------|------|
| Dominant (60%) | `#F5F2EB`（`$ui-bg` / `appleUi.color.bg`） | 页背景 |
| Surface / Secondary (30%) | `#FFFFFF` 与半透叠层 | 卡片、棋盘衬底、玻璃下实色（见下） |
| Separator | `#E5E5EA` 等 | 列表分隔、轻边框（`$ui-separator`） |
| Label primary / secondary | `#1C1C1E` / `#8E8E93` | 主/次文案 |
| Accent (10%) | `#007AFF` | 每局主 CTA、关键链接、**受控的**强调边（不铺满所有按钮） |
| 棋盘高亮/语义 | 见 token 中 `$ui-semantic-*`、`$ui-user-input` | 选格、同数、用户输入色等，**禁散落 teal 裸 hex** |
| Destructive / Conflict | `$ui-destructive`、`$ui-conflict-tint` | 危险与冲突提示 |

**Accent 仅用于：**「新开一局」主按钮、关键文字链、**择一**的选中强边，避免与 Surface 上普通按钮混用。  
**深色模式：** Phase 1 不强制；若实现，须在 UAT 单列。

---

## Motion（动画契约）

**原则：** 优先 `transform` + `opacity`；避免对 `width`/`height`/`top` 连续动画。数值与 `theme.ts` 中 `appleUi.motion` 与 `_apple-ui-tokens.scss` 中 `$ui-dur-*` / `$ui-ease-*` **同提交**。

| 场景 | Duration | Easing | 备注 |
|------|----------|--------|------|
| 按钮/格按下 | **160ms** | `$ui-ease-standard` | 如 `scale(0.97)` |
| 选中格焦点 | **200ms** | 同上 | 环或浅高亮 |
| 冲突提示 | 180–240ms | ease-out | 可单次轻位移 |
| Sheet 进入 | **360ms** | `$ui-ease-sheet` | 底部或淡入+小幅上移 |
| Sheet 退出 | **280ms** | ease-in | 略快于进入 |

**`prefers-reduced-motion: reduce`：** 位移动画改为 **opacity only** 或**无过渡**；时长 ≤ 120ms。

---

## Liquid Glass / 系统 26 向（实现子集）

> 公开概念见 Apple 新闻稿与 WWDC25；本工程**不宣称**系统级实时光学，仅在 H5/小程序用 CSS 模拟**可负担的**层次、半透、顶缘高光。  
> **无 `backdrop-filter` 的环境**：须在 `@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))` 下为 **`.content-wrap`、`.modal__card`（或等效主容器）** 提供**可读实底**（`$ui-surface` / `$ui-glass-*` 引用的不透明白/浅灰），**不得**仅依赖透明+模糊。与 `01-04-PLAN` 验收一致。  
> **H5 全局触摸**：`page` 与 `body` 上须设置 **`-webkit-tap-highlight-color: transparent;`**，与按钮级 `tap-highlight` 互补，减灰框。  

**明确不做：** 实时光学折射、与壁纸实时光感联动、系统 Liquid Glass 原生 API。

---

## Copywriting Contract

| Element | Copy（zh-CN） |
|---------|----------------|
| Primary CTA | **新开一局** |
| 难度 | **初级 / 中级 / 高级** |
| 清空/擦除 | **擦除** |
| 撤销 | **撤销** |
| 道具不足 | **道具不足** + **明天再来或完成每日领取**（与产品逻辑一致） |
| 通关标题 | **完成！** 或 **恭喜通关** |
| 冲突/规则 | 短句，如 **与规则冲突**（若需要） |
| Destructive confirmation | **新开一局**：**当前进度将丢失，确定继续？** |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | 无 | not required |
| 第三方动画库 | **默认不引入**；若引入须包体与小程序兼容说明 + PLAN 记录 | 需显式审阅 |

---

## Implementation Notes（Taro / 多端）

- **hover：** `hoverStayTime={0}` 与无粘滞 hover 策略；不在操作行上默认大时长 `transition` 破坏手感。  
- **棋盘：** `React.memo`；动效加在**容器或单格**。  
- **Token：** 扩展以 `theme.ts` + SCSS 变量为准，与 REQUIREMENTS 中 **TEC-01** 一致。

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS（主/次锚点已写）
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS（4 档 + 2 字重）
- [x] Dimension 5 Spacing: PASS（4 的倍数 rpx）
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-23（`/gsd-ui-phase` Update → 主编排同步真源 + gsd-ui-checker 规则内审）

---

## 关联

- 执行增量与验收以 **`01-04-PLAN.md`** 与 **`01-REPLAN-NOTE.md`** 为准；**勿**按早期 `01-01`～`01-03` 字面重跑大改。  
- 后续：`/gsd-plan-phase 1` 与构建/UAT 引用本文件为视觉契约真源。
