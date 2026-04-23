# Requirements: SudokuTaro

**Defined:** 2026-04-22  
**Core Value:** 玩家能流畅完成一局标准数独，且在 H5 与小程序上获得像原生系统一样跟手的界面与动效。

## v1 Requirements

### Experience — Apple-style UI & Motion（Phase 1）

- [ ] **EXP-01**: 用户在主页/棋盘界面看到 **层级清晰的表面**（背景 / 卡片 / 棋盘 / 控件），圆角与阴影语义一致，无随机杂散样式。
- [ ] **EXP-02**: 用户点击格子、按钮、开关时获得 **≤ 420ms 的明确动效反馈**（缩放、透明度或背景过渡），且 **`prefers-reduced-motion: reduce`** 下自动减弱或关闭非必要动画。
- [ ] **EXP-03**: 用户阅读计时、步数、难度与道具相关文案时，**字号与字重层级**符合「标题 / 标签 / 数字」区分，关键数字在 750 设计稿下 **不小于约 26rpx**（可调，但需写入 UI-SPEC）。
- [ ] **EXP-04**: 冲突提示、弹窗（通关等）使用 **统一的进入/退出曲线**（见 Phase 1 UI-SPEC），避免每处手写不同 easing。
- [ ] **EXP-05**: 用户在小程序与 H5 上 **主要路径无布局抖动**（动效不使用引起 reflow 的属性作为主手段）。

### Technical — Tokens（Phase 1）

- [ ] **TEC-01**: 颜色、圆角、阴影、动效时长与缓动在代码中有 **单一事实来源**（`theme.ts` 常量 + SCSS 映射或 CSS 变量注入），新增界面不得硬编码散色值（修复旧代码可渐进）。

### Parity — Minigame（Phase 2，v1 路线图内）

- [ ] **PAR-01**: 微信小游戏在 **色彩与圆角语义** 上与 Phase 1 定稿 token **书面一致**（允许 Canvas 实现差异，但需对照表）。

## v2 Requirements

### Platform

- **PLAT-01**: 抖音/微信主题适配（若平台提供暗黑或强调色 API）— 待评估。

### Social / Cloud

- **CLD-01**: 云端存档、排行榜 — 非核心，延后。

## Out of Scope

| Feature | Reason |
|---------|--------|
| 完全重写为数独 3D 或新玩法 | 与 Core Value 不符 |
| 引入完整 Design System npm（MUI/Antd 全量） | 包体与小游戏无关 |
| 像素级复制 iOS 专有控件 | 合规与维护成本 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| EXP-01 | Phase 1 | Pending（代码 review 2026-04-23：主路径已接 apple token，**待 UAT**） |
| EXP-02 | Phase 1 | Pending（待 UAT / 真机确认动效与 reduced-motion） |
| EXP-03 | Phase 1 | Pending（待 UAT 抽样字号） |
| EXP-04 | Phase 1 | Pending（待 UAT 弹层曲线） |
| EXP-05 | Phase 1 | Pending（待 UAT 主路径无抖动） |
| TEC-01 | Phase 1 | Pending（`_apple-ui-tokens` + `theme.ts` 已落地，**待 UAT 与文档签署**） |
| PAR-01 | Phase 2 | Pending |

**Coverage:**

- v1 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

**Phase 1 对照备注（2026-04-23）：** 静态与 grep 通过 ≠ 视觉验收完成；最终以 `01-UAT.md` 三项与真机/工具链抽查为准。

---
*Requirements defined: 2026-04-22*  
*Last updated: 2026-04-23（execute-phase 1 / 01-04+01-05 对照）*
