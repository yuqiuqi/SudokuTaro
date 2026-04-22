# Research Summary — SudokuTaro（设计向里程碑）

**日期：** 2026-04-22  
**说明：** 未运行并行 gsd-project-researcher；以下为针对 **Taro 小程序/H5 + Apple 式 UI** 的精简桌面研究结论，供 REQUIREMENTS 与 ROADMAP 使用。

## Stack（维持）

- **Taro 4 + React 18 + TypeScript + Sass**，Webpack 5；与 `.planning/codebase/STACK.md` 一致。
- 动效实现以 **CSS transition / transform** 为主，关键帧动画仅用于短促反馈；避免依赖未在小程序侧验证的 Web API。

## Features（本周期）

| 类别 | Table stakes | 本版本侧重点 |
|------|--------------|----------------|
| 玩法 | 已有数独闭环 | 不改规则，仅包装层 |
| 视觉 | 可读棋盘与按钮 | 系统式层级、圆角、分隔 |
| 动效 | 可略 | 弹性、跟手、可降级 |

## Architecture（UI 层）

- **Token 层**：在 `src/utils/theme.ts` 与 `src/pages/index/index.scss` 之间收敛颜色、圆角、阴影、时长、缓动曲线名。
- **组件层**：继续以页面内子组件（`memo`）为主，不强制引入新 UI 框架。

## Pitfalls

| 风险 | 预防 | 建议阶段 |
|------|------|----------|
| 小程序 CSS 能力差异（filter、backdrop-filter） | 真机逐项测；准备无 blur 回退 | Phase 1 |
| 动效导致耗电/卡顿 | 仅 transform/opacity；减少同时动画元素 | Phase 1 |
| 双轨引擎不同步 | 动效仅 Taro；小游戏 Phase 2 对齐 token | Phase 2 |
