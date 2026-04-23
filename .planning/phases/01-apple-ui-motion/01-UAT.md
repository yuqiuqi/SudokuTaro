---
status: testing
phase: 01-apple-ui-motion
source:
  - 01-01-SUMMARY.md
  - 01-02-SUMMARY.md
  - 01-03-SUMMARY.md
started: 2026-04-23T03:30:00.000Z
updated: 2026-04-23T03:30:00.000Z
---

## Current Test

number: 1
name: 主游戏页 — Apple 向视觉与 token 一致
expected: |
  在 H5 打开主游戏页：页面整体为浅色「纸感/材质」方向；主内容区应有清晰圆角卡片感；数字格与操作区与 UI-SPEC 中的主色/分隔色层级一致，标题与统计区文字清晰不糊；字体视觉接近系统无衬线栈（不强制逐字对比）。
awaiting: user response

## Tests

### 1. 主游戏页 — Apple 向视觉与 token 一致
expected: 在 H5 打开主游戏页：整体背景与主卡片区、棋盘格、底部操作区在颜色与圆角上呈现统一层级；与 Phase 1 UI-SPEC 的「主界面/棋盘」方向一致、无明显走样或回退到旧款随机配色。
result: pending

### 2. 模态与设置 — 样式与开关
expected: 打开「帮助」「设置」等模态：蒙层与卡片有圆角与层级感；主按钮用强调色、次要按钮/ghost 符合约定；`Switch` 等控件的主色为强调色。关闭/操作无残影或错层。
result: pending

### 3. 动效与减少动态效果
expected: 点击数独格与底部按钮时有可感知的按下态（如轻微 scale）；模态有入场感；在浏览器或系统打开「减少动态效果 / prefers-reduced-motion」时，不应出现持续的大幅弹簧位移动画（允许淡出或即时切换）。
result: pending

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0

## Gaps

[none yet]

---

**Automated (本机 2026-04-23，供对照，不替代你的确认）：** `npx tsc --noEmit` 通过；`npm run build:h5` 成功（有 entrypoint 体积告警，可忽略于本阶段 UAT）。
