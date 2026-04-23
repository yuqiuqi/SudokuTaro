# Plan 04-01 Summary

**Status:** Complete  
**Date:** 2026-04-23

## Done

- 新增 `src/styles/_motion-tokens.scss`：spring 系列 `$ease-spring-*`、时长族 `$dur-*`，与 `linear()` / cubic 回退注释。
- 新增 `src/styles/_component-tokens.scss`：按钮/格/模态/开关语义变量与 motion 引用，无裸 hex。
- 新增 `src/styles/_mixins-lg.scss`：`liquid-glass`、`spring-btn`、`cell-interactive` 等可复用 mixin。
- `src/pages/index/_ui-tokens.scss` 通过 `@forward` 挂接新文件；`src/utils/theme.ts` 增加 `appleUi.motion` / `glass` 等与 SCSS 可对齐的常量。

## Verification

- `npx tsc --noEmit` 通过（执行时）
