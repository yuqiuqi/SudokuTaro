# SudokuTaro

## Current Milestone: v2.0 Liquid Glass · iOS 26 全量动画与交互精打

**Goal：** 以 Apple iOS 26 / Liquid Glass 为设计真源，对项目中**所有页面与组件**的动画、交互反馈、材质语义进行彻底打磨，达到"与系统原生组件感知一致"的手感。

**Target features：**
- iOS 26 Liquid Glass 全量设计原则落地（材质、层次、动态 specular、弹性动画）
- 所有可交互组件（棋盘格、按钮、弹层、开关、道具行、冲突提示）五态完整（默认/hover/pressed/disabled/focused）
- Spring / elastic 弹性过渡全链路（入场、按下、弹出、消失）
- `prefers-reduced-motion` 全路径降级策略
- H5 CSS 下 Liquid Glass 材质最大化可实现子集

---

## What This Is

SudokuTaro 是基于 **Taro 4 + React + TypeScript** 的数独游戏，**仅构建 H5**（浏览器）。当前里程碑聚焦：以 **Apple iOS 26 Liquid Glass** 设计语言为真源，深度打磨所有组件的动画、交互与材质质感。

## Core Value

玩家能 **流畅完成一局标准数独**（生成、填数、冲突反馈、撤销/擦除、通关统计），在 **H5** 上获得 **可信、顺手** 的界面与动效。

## Requirements

### Validated

（来自现有实现与 `.planning/codebase/`，已交付能力）

- ✓ 多端数独核心：难度（易/中/高）、终盘生成、挖空、冲突检测与高亮、约 1.5s 回退 — existing
- ✓ 道具经济：撤销/擦除消耗、每日首次赠送、本地持久化（`src/utils/gameEconomy.ts`）— existing
- ✓ 设置：按下数字时震动开关 — existing
- ✓ H5 输入：系统键盘 / 隐藏输入与物理键 — existing
- ✓ 性能取向：棋盘 `React.memo`、冲突 `Set` 索引 — existing

### Active

- [ ] **视觉体系**：建立接近 Apple HIG 方向的 **色板、圆角阶梯、分隔与阴影语义**（主界面与棋盘区域），与现有「暖色纸感」可融合或迭代为「系统浅色/材质卡片」方案。
- [ ] **动效契约**：按钮/格子选中、冲突提示、弹窗出现消失采用 **spring-like / ease-out** 曲线；时长区间 **180–420ms**（触控反馈偏短，布局变化可略长）；支持 **`prefers-reduced-motion: reduce`** 时降级为淡入淡出或即时切换。
- [ ] **触控反馈**：可点击元素具备 **按下缩放或亮度变化**（≤ 0.98 scale 或 opacity），**hover 不粘滞**（延续现有 `hoverStayTime` 等约定，见 `CONTEXT.md`）。
- [ ] **排版**：数字与标签层级清晰；关键数据（计时、步数）具备 **Dynamic Type 式** 阶梯（在小程序内用 rpx 模拟，避免过小）。
- [ ] **小游戏视差**：在 Phase 2+ 将 Phase 1 定稿的 **色彩与动效语义** 映射到 Canvas（本阶段可先定义 token，落地可后置）。

### Out of Scope

- **更换技术栈**（如迁出 Taro）— 成本过高，与现状不符。
- **引入重型 UI 组件库**（如完整 shadcn 于小程序）— 包体与适配成本高；除非后续 Phase 单独评估。
- **复制非 Apple 品牌资产**（如官方图标、SF Symbols 文件）— 仅 **风格对齐**，不使用受保护资源。

## Context

- 技术现状见 `.planning/codebase/STACK.md`、`ARCHITECTURE.md`。
- 协作约定见仓库根目录 `CONTEXT.md`、`README.md`。
- **用户美学偏好**：偏好 **Apple 系交互与画面**，尤其 **系统级动效与层次感**（用户表述中的「OS 26」按 **最新一代 Apple 平台视觉方向** 理解：液态材质、景深、弹性动画、清晰信息架构；实现时以可访问性与小程序性能为约束做子集落地）。
- **ui-ux-pro-max**：当前环境 **未检测到 Python**，未能运行 `search.py --design-system`；设计决策以 Apple HIG 方向 + 本项目现有 Sass/rpx 栈 **手工写入 UI-SPEC**。

## Constraints

- **Tech stack**：保持 Taro 4.0.9 + React 18 + Sass；配置保持 `*.config.js` 模式。
- **性能**：动效不得导致棋盘每秒重绘失控；避免长耗时 blur/backdrop-filter 叠加（小程序端需实测）。
- **许可**：仓库 **CC BY-NC-ND 4.0**；引入第三方字体/素材需兼容。

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phase 1 主攻 Taro 三端 UI + 动效 | 用户主要触点与代码集中在 `src/pages/index/` | — Pending |
| Apple 风格 = 行为与层级对齐，非像素级抄袭 | 法务与品牌安全 | — Pending |
| 不强制引入新组件框架 | 包体与 Taro 适配 | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-23 — Milestone v2.0 Liquid Glass · iOS 26 全量动画与交互精打 启动*
