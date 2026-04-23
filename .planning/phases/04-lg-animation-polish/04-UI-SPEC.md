---
phase: 4
slug: lg-animation-polish
status: approved
shadcn_initialized: false
preset: liquid-glass-ios26-h5
created: 2026-04-23
depends_on: .planning/phases/01-apple-ui-motion/01-UI-SPEC.md
---

# Phase 4 — UI 设计合约（iOS 26 · Liquid Glass · H5）

> **范围：** 在 Phase 1 已建立的视觉/层级真源上，**只增强动效、材质、交互五态、无障碍**；不引入新 npm 动画库。  
> **端：** 仅 **H5 浏览器**；`01-UI-SPEC` 中关于小程序/多端的历史表述以 Phase 1 之后仓库约定为准，本阶段以 **H5** 为验收端。  
> **评审吸收：** `04-REVIEWS.md` 共识已写入 `REQUIREMENTS.md`（CELL-02 区域限制、BTN-02/SW `scaleX`、WIN-02 rAF 清理、MAT-05 等）。

---

## 真源与文件

| 层级 | 位置 |
|------|------|
| Primitive 色/玻璃/字体 | 延续 `src/styles/_apple-ui-tokens.scss` |
| **Motion / Spring** | 新建 `src/styles/_motion-tokens.scss`（`$ease-spring-*`、`$dur-*`、`linear()` + `cubic-bezier` 回退） |
| **Component 语义** | 新建 `src/styles/_component-tokens.scss`（引用 motion primitive） |
| **Liquid glass mixins** | 新建 `src/styles/_mixins-lg.scss` |
| 页面入口转发 | `src/pages/index/_ui-tokens.scss` 增加 `@forward` 上述新文件 |
| TS 镜像 | `src/utils/theme.ts` `appleUi.motion` / `appleUi.glass` 同提交 |

**禁止：** 在业务 `index.scss` 散落与契约无关的 magic number；须引用 token 或 component token。

---

## 交互与动效（相对 Phase 1 的增量）

| 主题 | 规则 |
|------|------|
| 五态 | 可交互元素用 `data-state="idle\|hover\|pressed\|disabled\|focused"`；hover 仅 `@media (hover: hover) and (pointer: fine)` |
| 按压缩 | `transform`+`opacity`；specular 用 **`scaleX` on `::after`**，**禁止**对 `::after` `width` 做补间 |
| 同数高亮 + 涟漪 | 仅**选中格所在行/列/宫**内、且与 `highlightNum` 相同的格参与动画；**最多约 20 格级**；`--cell-ripple-index` 控制 stagger |
| Switch | `thumb` 用 **`translateX` + `scaleX`** 表达 squash/stretch，**禁止**对 `width` 补间 |
| 弹层 | 入 380ms / 出 280ms（见 REQ）；`data-state="leaving"` + `setTimeout` 与出时长一致；**开 modal 时**主卡 blur 自 18px→8px（MOD-05） |
| 低端机 | `navigator.deviceMemory < 4` 时主卡/模态**无** `backdrop-filter`，实色 `$ui-surface`（MAT-05） |

---

## 无障碍

- 全局 `prefers-reduced-motion: reduce`：`*, *::before, *::after` 为基底；A11Y-02/03 白名单例外见 `REQUIREMENTS.md`。
- 键盘：`KBD-02` — 方向键只驱动**玩法选中**；`data-keyboard-focus` 与 Tab 环关系见需求正文。

---

## 手测与兼容

- **Chrome（桌面）+ Mobile Safari** 为必测；`linear()` / `@starting-style` / `scroll-timeline` 在旧 iOS 上须具备 **cubic-bezier 或静态退化**（不改变玩法，仅动效略简）。
- 性能：动效期可对 `.modal` / `.cell--same` 等临时 `will-change`；**不得**对 81 格永久 `will-change`（与 research 一致）。

---

## Copy

沿用 `01-UI-SPEC` Copy 表，无 Phase 4 新文案真源。

---

*Phase: 04-lg-animation-polish · 合约用于 Wave 1–3 全部 PLAN。*
