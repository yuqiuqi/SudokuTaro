# Roadmap: SudokuTaro

**Created:** 2026-04-22  
**Granularity:** Standard  
**Project:** `.planning/PROJECT.md`

## Overview

| # | Phase | Goal | Requirements | **UI hint** |
|---|-------|------|--------------|-------------|
| 1 | Apple-style UI & motion | Taro 主界面建立 Apple 向视觉与动效契约并落地到 `src/pages/index/` | EXP-01 — EXP-05, TEC-01 | **yes** |
| 2 | Minigame visual parity | `minigame-wechat` 对齐 Phase 1 token（色彩、圆角、动效语义） | PAR-01 | yes |
| 3 | Hardening & a11y pass | 对比度、焦点态、真机动效降级策略回归 | （从 Phase 1 UAT 衍生，可增 REQ） | yes |

---

## Phase 1 — Apple-style UI & motion

**Slug:** `apple-ui-motion`  
**Directory:** `.planning/phases/01-apple-ui-motion/`

**Goal:** 在 H5 / 微信小程序 / 抖音小程序上，将数独主界面升级为 **Apple 平台向** 的层级、材质与动效，不改变数独规则与现有经济逻辑。

**Requirements mapped:** EXP-01, EXP-02, EXP-03, EXP-04, EXP-05, TEC-01

**Success criteria:**

1. UI-SPEC 中定义的颜色、圆角、阴影、动效时长与缓动在 **主游戏页** 可见且一致。
2. 真机（至少微信开发者工具 + 一台实机）上 **无卡顿或明显掉帧**（主观 + 开发者工具性能面板抽查）。
3. 浏览器 H5 打开 `prefers-reduced-motion: reduce` 时，**无持续弹簧/大幅位移动画**。
4. `theme.ts`（或约定入口）与 SCSS **可追溯到同一套 token**，新增样式默认引用 token。
5. **CONTEXT.md / README** 无需因样式改动而推翻架构说明（即无破坏性目录重组）。

---

## Phase 2 — Minigame visual parity

**Slug:** `minigame-visual-parity`  
**Directory:** `.planning/phases/02-minigame-visual-parity/`（待创建）

**Goal:** Canvas 小游戏在 **视觉语义** 上与 Phase 1 对齐，玩法不变。

**Requirements mapped:** PAR-01

**Success criteria:**

1. 存在 **Token 对照表**（Taro SCSS ↔ 小游戏绘制参数）。
2. 关键交互（选格、填数、按钮）有 **可感知的按下/抬起反馈**，与 Phase 1 时长量级一致。
3. `npm run build:minigame` 产物可运行，无控制台报错。

---

## Phase 3 — Hardening & a11y pass

**Slug:** `hardening-a11y`  
**Directory:** `.planning/phases/03-hardening-a11y/`（待创建）

**Goal:** 对比度、键盘/读屏可用性、低端机动效降级。

**Success criteria:**

1. 主要文本与背景对比度 **≥ WCAG AA**（主路径抽样）。
2. 文档列出 **已知平台限制**（小程序 aria 能力等）。

---

*Roadmap created: 2026-04-22*
