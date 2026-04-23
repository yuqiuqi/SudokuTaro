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
| 4 | iOS 26 Liquid Glass 全量动画与交互精打 | 3/3 | Complete    | 2026-04-23 |

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

## Phase 4 — iOS 26 Liquid Glass 全量动画与交互精打

**Slug:** `lg-animation-polish`  
**Directory:** `.planning/phases/04-lg-animation-polish/`（待创建）  
**Milestone:** v2.0

**Goal:** 以 iOS 26 Liquid Glass 为设计真源，对所有可交互组件（按钮、数独格、弹层、开关）的 spring 动画、五态交互、材质质感与无障碍降级进行彻底打磨，使 H5 手感与系统原生组件感知一致。

**Depends on:** Phase 1（token 体系、组件结构），Phase 3（a11y 基础）

**Requirements:** TOK-01, TOK-02, TOK-03, TOK-04, BTN-01, BTN-02, BTN-03, BTN-04, CELL-01, CELL-02, CELL-03, CELL-04, MOD-01, MOD-02, MOD-03, MOD-04, MOD-05, WIN-01, WIN-02, WIN-03, SW-01, SW-02, SW-03, MAT-01, MAT-02, MAT-03, MAT-04, MAT-05, HERO-01, HERO-02, A11Y-01, A11Y-02, A11Y-03, KBD-01, KBD-02

**Success Criteria** (what must be TRUE):
  1. 所有可交互元素（按钮/格子/弹层/开关）按下/松手有可感知的 spring 回弹效果，且无硬跳变
  2. 弹层入场/出场为 spring 曲线（380ms 入 / 280ms 出），与蒙层动画协调，延迟卸载无闪烁
  3. 通关弹窗各元素按顺序分层入场，统计数字（用时、步数）做 0→实际值的滚动动画
  4. `prefers-reduced-motion: reduce` 下所有持续动画（Hero 光斑、scroll-driven、大幅位移）关闭，仅保留 ≤ 200ms opacity 必要反馈
  5. `npm run build:h5` 零错误，`npx tsc --noEmit` 零类型错误
  6. 桌面 Chrome + 移动端 Safari 手工验收各组件均有正确动画，无卡顿或视觉异常

**Wave 执行计划:**

| Wave | 内容 | 需求 | 并行度 |
|------|------|------|--------|
| Wave 1（基础，阻塞后续） | Motion token 架构 + theme.ts 同步 | TOK-01~04 | 串行 |
| Wave 2（组件精打，可并行） | 按钮五态 + specular；格子五态 + 涟漪 + shake + 填数入场 | BTN-01~04, CELL-01~04 | 2 路并行 |
| Wave 3（组合 + 收尾） | 弹层 spring；通关弹窗编排；Switch squash（scaleX）+ 位移；材质升级含低端 `deviceMemory` 回退；Hero scroll-driven；a11y 全覆盖；键盘焦点；**`index.scss` 内多任务须按执行器顺序串行，避免大文件冲突** | MOD-01~05, WIN-01~03, SW-01~03, MAT-01~05, HERO-01~02, A11Y-01~03, KBD-01~02 | 任务串行（同 Wave 多计划块顺序执行） |

**Plans:** 3/3 plans complete
**UI hint**: yes

---

## Phases

- [x] **Phase 1: Apple-style UI & motion** - Taro 主界面建立 Apple 向视觉与动效契约
- [ ] **Phase 2: Minigame visual parity** - Canvas 小游戏视觉语义对齐 Phase 1
- [ ] **Phase 3: Hardening & a11y pass** - 对比度、焦点态、真机降级回归
- [x] **Phase 4: iOS 26 Liquid Glass 全量动画与交互精打** - Spring 动画 + 材质 + a11y 彻底打磨（v2.0 主力 Phase） (completed 2026-04-23)

## Phase Details（Progress）

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Apple-style UI & motion | 5/5 | ✓ Executed | 2026-04-23 |
| 2. Minigame visual parity | 0/0 | Not started | - |
| 3. Hardening & a11y pass | 0/0 | Not started | - |
| 4. iOS 26 Liquid Glass 全量动画与交互精打 | 3/3 | Ready to execute | - |

---

*Roadmap created: 2026-04-22*  
*v2.0 Phase 4 added: 2026-04-23*
