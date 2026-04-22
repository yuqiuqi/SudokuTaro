# Phase 1 — Technical Research（Apple 向 UI · Taro）

**Phase:** Apple-style UI & motion  
**日期:** 2026-04-22

## 结论摘要

- **栈不变**：Sass + Taro 组件；动效以 **`transform` / `opacity`** 为主，与 `01-UI-SPEC.md` 一致。
- **Token 双轨**：`src/utils/theme.ts` 导出 TS 常量（便于 TS 内联样式若需要）；`src/pages/index/index.scss` 顶部以 **Sass 变量** 映射同一套 hex / duration / easing，避免魔法数散落。
- **Hero 光斑**：现有 `filter: blur` + 长周期 `@keyframes` 与 Apple「克制系统动效」部分冲突；建议 **降低幅度或 `@media (prefers-reduced-motion: reduce)` 下暂停**，避免与 EXP-02 冲突。
- **小程序**：`env(safe-area-inset-*)` 已用于 `.page`；新增动画需在微信开发者工具与一台实机复测。

## 关键文件（修改前必读）

| 文件 | 角色 |
|------|------|
| `src/pages/index/index.tsx` | 棋盘、模态、`hoverStayTime` |
| `src/pages/index/index.scss` | 主样式（~700+ 行） |
| `src/utils/theme.ts` | 现仅有 `figma` 常量；将扩展 `appleUi` |
| `src/app.scss` | 全局入口样式（若需字体栈全局化） |

## 与 UI-SPEC 对齐检查表

- [ ] Color 表 hex 与 SCSS 变量一一对应  
- [ ] Motion 表 duration / cubic-bezier 字符串与类名对应  
- [ ] 计时/步数字号 ≥ 26rpx（UI-SPEC）  

## Validation Architecture

本阶段 **无单元测试框架**；验证组合为：

1. **构建门禁**：`npm run build:h5`、`npm run build:weapp`（或至少 `npx tsc --noEmit` 若构建过慢）零错误。  
2. **静态契约**：`index.scss` 中 UI-SPEC 所列主色、accent、label 色须通过变量引用（grep 可证）。  
3. **手动**：H5 与微信小程序各一条路径 — 点格、开设置/帮助/胜利弹层，确认动效与 reduced-motion（浏览器 DevTools）行为符合 UI-SPEC。  
4. **性能主观**：开发者工具 Performance 抽样，棋盘交互无明显掉帧。

---

## RESEARCH COMPLETE
