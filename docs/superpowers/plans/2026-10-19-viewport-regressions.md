# Viewport Regressions Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline execution of the user-authorized fixes. Steps use checkbox syntax for tracking.

**Goal:** 修复 PR #5 已复现的操作区裁切、弹窗溢出和方向键跨行。

**Architecture:** 低高度操作区沿用现有网格并缩减固定垂直开销；弹窗按实际容器可用高度重排；键盘按行列边界移动。保留游戏状态与已确认的视觉风格。

**Tech Stack:** Taro 4 / React / TypeScript / Sass / Playwright Chromium。

**Spec:** `AGENTS.md` 的已知回归场景、`docs/RESPONSIVE_DESIGN.md` 及本次用户授权修复要求。

## Global Constraints

- 常驻 1～9，不添加输入框；主页面不得双向滚动。
- 每轮代码修改后构建并运行浏览器模拟测试，报告真实结果。
- 不修改其他仓库，不合并 PR。

## Review Focus

- 568×240 / 480×240 下所有数字和工具可点击。
- 中文及英文新局弹窗在短横屏下操作可达。
- 竖屏 visualViewport 缩至 400px 后规则、设置、新局适配。
- 通关弹窗在短屏与语言切换后完整展示。
- 行首/行末、棋盘上下边缘方向键不越界，内部正常移动。

## Task 1: 短屏操作区

Files: `tests/browser.cjs`, `src/pages/index/index.scss`。

- [x] 加入 568×240、480×240 几何与点击测试；运行确认数字裁切失败。
- [x] 缩减高度受限宽屏操作区的垂直开销，重新构建并确认测试通过。

## Task 2: 弹窗

Files: `tests/browser.cjs`, `src/pages/index/index.scss`。

- [x] 断言弹窗及所有按钮均落在 visualViewport 内，加入中英文新局、规则、设置、通关与压缩视口；确认原代码失败。
- [x] 根据实际容器高度应用紧凑样式，重排难度按钮；构建并验证全部弹窗。

## Task 3: 键盘与交付

Files: `tests/browser.cjs`, `src/pages/index/index.tsx`, `README.md`, `AGENTS.md`, `docs/screenshots/*`。

- [x] 加入边界与内部移动用例，确认原代码跨行失败。
- [x] 按行列分别限制移动，运行类型检查、逻辑测试、构建与完整浏览器测试。
- [x] 更新 README 测试状态与实际截图；独立只读复审发现长英文成就文案溢出，补充 RED→GREEN 回归并修复。复审执行因额度中断，最终核验由实现者完成，不声称获得完整独立复审通过结论。
