# Requirements: SudokuTaro

**Defined:** 2026-04-22  
**v2.0 Added:** 2026-04-23  
**Core Value:** 玩家能流畅完成一局标准数独，且在 H5 获得像 iOS 26 原生应用一样跟手、有质感的界面与动效。

---

## v1 Requirements（历史）

### Experience — Apple-style UI & Motion（Phase 1，已执行）

- [x] **EXP-01**: 用户在主页/棋盘界面看到 **层级清晰的表面**（背景 / 卡片 / 棋盘 / 控件），圆角与阴影语义一致，无随机杂散样式。
- [x] **EXP-02**: 用户点击格子、按钮、开关时获得 **≤ 420ms 的明确动效反馈**，且 `prefers-reduced-motion: reduce` 下自动减弱。
- [x] **EXP-03**: 字号与字重层级符合「标题/标签/数字」区分，关键数字 ≥ 26rpx。
- [x] **EXP-04**: 冲突提示、弹窗使用统一进入/退出曲线。
- [x] **EXP-05**: 主要路径无布局抖动（不用 reflow 属性做连续动画）。

### Technical — Tokens（Phase 1，已执行）

- [x] **TEC-01**: 颜色、圆角、阴影、动效时长与缓动有单一事实来源（`_apple-ui-tokens.scss` + `theme.ts`）。

---

## v2 Requirements — iOS 26 Liquid Glass 全量动画与交互精打

> **目标：** 以 iOS 26 Liquid Glass 为设计真源，对所有可交互组件的动画、交互反馈、材质语义进行彻底打磨。

### A. Token 与架构体系（基础，Phase 4）

- [x] **TOK-01**: 新建 `src/styles/_motion-tokens.scss`，声明 spring 曲线（`$ease-spring-snappy/default/gentle/stiff`）、时长分级（`$dur-micro/fast/default/enter/exit/ambient`）、CSS `linear()` spring 函数及 `cubic-bezier` 回退变量。

- [x] **TOK-02**: 新建 `src/styles/_component-tokens.scss`，声明组件级语义变量（`$btn-pressed-scale`、`$btn-disabled-opacity`、`$cell-selected-bg`、`$modal-enter-duration` 等），所有值引用 primitive token，不硬编码数字。

- [x] **TOK-03**: 新建 `src/styles/_mixins-lg.scss`，提供 `liquid-glass()`、`spring-btn()`、`cell-interactive()` 等 mixin，使各组件可一行引入完整五态行为。

- [x] **TOK-04**: 同步更新 `src/utils/theme.ts` 的 `appleUi.motion` 与 `appleUi.glass`，与新 Sass token 数值保持一致（手动同提交）。

### B. 按钮交互精打（Phase 4）

- [x] **BTN-01**: 所有主操作按钮（`.btn--action`）按下时在 **120ms** 内达到 `scale(0.95) + opacity(0.88)`，松手后 **240ms spring(400,28)** 回弹至 `scale(1.03→1.0)`（有超调感）。

- [x] **BTN-02**: 按钮 `::after` specular 高光在按下时向心收缩：使用 **`transform: scaleX(0.5)`** + `transform-origin: center` 表达收拢（**禁止**对 `width` 做补间，避免重排与布局抖动），opacity **0.4→0.1，120ms**；松手时弹回（**240ms**，`scaleX(1)` + opacity 恢复）。

- [x] **BTN-03**: 所有按钮实现五态 CSS（`data-state` 驱动）：idle / hover（桌面仅 `@media (hover: hover)`）/ pressed / disabled / focused（`focus-visible` 焦点环）。

- [x] **BTN-04**: disabled 态 `opacity(0.38) + pointer-events:none`，过渡时间 200ms。

### C. 数独格交互精打（Phase 4）

- [x] **CELL-01**: 格子 tap 选中：背景色在 **140ms ease-out** 内从透明变为 `rgba(accent, 0.12)`，同时 `scale(0.96→1.0)` spring 回弹（有轻微超调）。

- [x] **CELL-02**: 高亮同数字格：以选中格为起点，仅在**同一行、同一列、同一宫（3×3）**内向外涟漪扩散，每格 **delay += 8ms**（`style={{ '--cell-ripple-index': n }}` 等 CSS 变量，**n ∈ 0..~19**），单格过渡 **180ms ease-out**；**禁止**对全棋盘 81 格同时开启动画（跨 AI 评审性能共识）。

- [x] **CELL-03**: 冲突提示：格子做 X 方向 **shake 动画**（±4rpx × 3次，**220ms** `cubic-bezier(0.36,0.07,0.19,0.97)`），背景变 `rgba(destructive, 0.18)`。

- [x] **CELL-04**: 用户填入数字时（非冲突），数字做轻微 **scale(0.8→1.0)** 入场，**100ms ease-out**。

### D. 弹层（Modal / Sheet）精打（Phase 4）

- [x] **MOD-01**: 弹层卡片入场：**380ms** `cubic-bezier(0.32,0.72,0,1)`，`translateY(100%→0) + opacity(0.5→1)`，`backdrop-filter: blur(0→18px)` 同步渐进。

- [x] **MOD-02**: 弹层卡片出场：**280ms** `cubic-bezier(0.55,0,1,0.45)`，`translateY(0→60%) + opacity→0.3`。

- [x] **MOD-03**: 弹层蒙层（mask）入场 **300ms ease-out** `opacity(0→1) + backdrop-blur(0→8px)`，出场 **220ms ease-in** `opacity→0`。

- [x] **MOD-04**: 弹层关闭使用 `data-state="leaving"` + **280ms setTimeout** 延迟 DOM 卸载，避免出场动画被截断闪烁。

- [x] **MOD-05**: 弹层出现时，主内容卡片（`.content-wrap`）的 `backdrop-blur` 从 18px 降至 8px（**200ms ease**），减少 GPU 压力。

### E. 通关弹窗编排（Phase 4）

- [x] **WIN-01**: 通关弹窗各元素分层顺序入场：蒙层（0ms）→ 卡片（40ms delay）→ 标题文字（120ms delay）→ 统计数字滚动（200ms delay）→ 按钮（300ms delay）。

- [x] **WIN-02**: 统计数字（用时、步数）从 0 到实际值滚动，**400ms** `requestAnimationFrame` + easeOutQuart；**在 React `useEffect` 的 cleanup 中必须 `cancelAnimationFrame(rafId)`**，避免关弹层或路由切换后仍写 DOM / 泄露。

- [x] **WIN-03**: 通关卡片有顶部彩色 spectrum 条，颜色使用渐变 `$ui-modal-spectrum-1/2/3`（已有）。

### F. Switch 开关精打（Phase 4）

- [x] **SW-01**: Switch off→on：`thumb` 用 **`translateX` + `scaleX(0.85)`** 表达 squash（**禁止**对 `width` 做连续补间以与位移动画同步），到位后回弹到 **`scaleX(1)`**，**280ms** spring 类曲线。

- [x] **SW-02**: Switch on→off：反向，运动中 **`scaleX(1.15)`** 表达 stretch，**240ms** spring 类曲线；同样禁止 `width` 补间。

- [x] **SW-03**: Track 背景色（neutral→accent）随 thumb 位移同步过渡，**280ms ease**。

### G. 材质（Liquid Glass）精打（Phase 4）

- [x] **MAT-01**: `.content-wrap` 材质升级为 `backdrop-filter: blur(18px) saturate(1.8) brightness(1.02)`，保留现有 `@supports not` 实色回退。

- [x] **MAT-02**: `.modal__card` 材质升级为 `backdrop-filter: blur(22px) saturate(2.0)`。

- [x] **MAT-03**: `.content-wrap::after` specular 高光从静态改为：hover 时略增强（opacity 0.5→0.65，**80ms**），按下时减弱（0.5→0.2，**120ms**），松手时弹回。

- [x] **MAT-04**: 新增 `.content-wrap::before` 底缘内阴影（`inset 0 -1px 0 rgba(white,0.5)`），增强卡片边缘层次感。

- [x] **MAT-05**: 低端/低内存回退：在 **`navigator.deviceMemory` 存在且小于 4** 时，主内容卡与模态卡**不使用** `backdrop-filter`，改用与 `@supports not` 路径一致的 **`$ui-surface` 实色底**；检测置于 `useEffect` 或首屏后，不阻塞首屏。可选后续：预留帧率降档钩子（本 Phase 不强制实现）。

### H. 英雄光斑（Hero）精打（Phase 4）

- [x] **HERO-01**: Hero 区域使用 CSS scroll-driven animations：随页面下滚，`opacity` 渐出（滚动 0→200px 时 1→0），减少视觉干扰。

- [x] **HERO-02**: Hero 光斑振幅降低 30%（现有 `translate(12rpx,-8rpx)` 改为 `(8rpx,-5rpx)`），更接近 iOS 26 「克制环境动效」风格。

### I. 全局 prefers-reduced-motion 完整覆盖（Phase 4）

- [x] **A11Y-01**: 在 `src/app.scss` 或全局 `@media (prefers-reduced-motion: reduce)` 中用 `*, *::before, *::after` 全覆盖，关闭所有非必要动画。

- [x] **A11Y-02**: 保留例外白名单：按钮 pressed opacity（80ms）、弹层淡入（200ms 仅 opacity，无位移）作为必要交互反馈。

- [x] **A11Y-03**: 明确关闭 Hero 光斑（`animation: none !important`）、scroll-driven animations（`animation: none`）。

### J. 键盘与焦点精打（Phase 4）

- [x] **KBD-01**: 所有可交互元素（按钮、格子、开关）实现 `focus-visible` 焦点环：`2px solid $ui-accent`，`offset 2px`，`border-radius` 同元素，过渡 **100ms**。

- [x] **KBD-02**: 方向键 **与现有 `selected` 格逻辑一致**（仅移动**玩法选中**）；为当前格提供与 Phase 1 结构兼容的**可见「键盘操作焦点」**（`data-keyboard-focus` 或容器 `:focus-within`），与 **Tab 焦点**关系：若格不可 `tab` 到，则**不必**与浏览器原生焦点环混用，避免双环；在代码注释中写清本约定。

---

## v2 Future Requirements

- **DARK-01**: 深色模式（`prefers-color-scheme: dark`）全路径支持 — 待评估
- **HAPTIC-01**: 通关时精准 haptic 时序（与动画编排同步）— 待平台支持

## Out of Scope（v2）

| Feature | Reason |
|---------|--------|
| WebGL 实时折射 | 性能/复杂度过高 |
| DeviceMotion specular | 系统权限，非核心体验 |
| Framer Motion / GSAP | 引入 >100KB，与 Taro 有兼容风险 |
| 深色模式（本里程碑） | 工作量大，v3 专项 |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| EXP-01 ～ TEC-01 | Phase 1 | ✓ Executed (2026-04-23) |
| TOK-01 ～ TOK-04 | Phase 4 | Pending |
| BTN-01 ～ BTN-04 | Phase 4 | Pending |
| CELL-01 ～ CELL-04 | Phase 4 | Pending |
| MOD-01 ～ MOD-05 | Phase 4 | Pending |
| WIN-01 ～ WIN-03 | Phase 4 | Pending |
| SW-01 ～ SW-03 | Phase 4 | Pending |
| MAT-01 ～ MAT-05 | Phase 4 | Pending |
| HERO-01 ～ HERO-02 | Phase 4 | Pending |
| A11Y-01 ～ A11Y-03 | Phase 4 | Pending |
| KBD-01 ～ KBD-02 | Phase 4 | Pending |

**Coverage:**
- v2 requirements: 35 total (TOK×4 + BTN×4 + CELL×4 + MOD×5 + WIN×3 + SW×3 + MAT×5 + HERO×2 + A11Y×3 + KBD×2)
- Mapped to phases: 35
- Unmapped: 0 ✓

---

*Requirements defined: 2026-04-22*  
*v2.0 added: 2026-04-23 (iOS 26 Liquid Glass 全量动画与交互精打)*
