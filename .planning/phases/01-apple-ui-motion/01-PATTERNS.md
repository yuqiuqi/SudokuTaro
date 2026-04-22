# Phase 1 — Pattern Map

| 将修改/新增 | 角色 | 最近类比 | 摘录要点 |
|-------------|------|----------|----------|
| `src/utils/theme.ts` | Token 源 | 现有 `figma` 对象 | 使用 `as const` + 分组导出 |
| `src/pages/index/index.scss` | 主 UI | `.page`, `.grid`, `.modal`, `.btn` | BEM；rpx；已有 safe-area |
| `src/pages/index/index.tsx` | 交互 | `hoverStayTime={0}`、`memo` 子组件 | 动效类名挂 View 不破坏 memo |
| `src/app.scss` | 全局 | `App` 根样式 | 可选：全局 `font-family` 与 UI-SPEC 栈对齐 |
