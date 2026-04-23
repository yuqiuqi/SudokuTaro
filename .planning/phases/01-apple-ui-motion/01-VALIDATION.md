---
phase: 1
slug: apple-ui-motion
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-22
---

# Phase 1 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none（无 Jest/Vitest） |
| **Config file** | `tsconfig.json` |
| **Quick run command** | `npx tsc --noEmit`（仓库根目录） |
| **Full suite command** | `npm run build:h5` |
| **Estimated runtime** | 1–5 分钟（视机器） |

## Sampling Rate

- **每 Plan 完成后：** `npx tsc --noEmit`
- **Phase 收尾：** `npm run build:h5`
- **手动：** 每份 PLAN 的 checkpoint（若启用）

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|--------|
| 1-01-a | 01 | 1 | TEC-01, EXP-01 | TM-UI-01 | 无用户数据写入 | grep + tsc | `npx tsc --noEmit` | ⬜ |
| 1-02-a | 02 | 2 | EXP-01, EXP-03 | TM-UI-01 | N/A | tsc + grep | `npx tsc --noEmit` | ⬜ |
| 1-03-a | 03 | 3 | EXP-02–05, TEC-01 | TM-UI-01 | N/A | build + manual | `npm run build:h5` | ⬜ |

## Wave 0 Requirements

- **无需新建测试目录** — 本阶段以构建与手动为主。

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 按下态与弹层动效 | EXP-02, EXP-04 | 视觉与时序 | 桌面/移动 **浏览器** H5：点按钮/格；`prefers-reduced-motion: reduce` 或系统「减少动态效果」 |
| 帧率主观 | EXP-05 | Performance | 交互时观察是否卡顿 |
| 毛玻璃 / blur 与实机 | EXP-02, TEC-01 | 各浏览器/机型实现差异 | **多浏览器或移动真机** Safari/Chrome：主卡（`.content-wrap`）与弹层（`.modal__card`）的 **backdrop** 与 `@supports` 实色回退是否仍可读、无白屏/错层（见 `01-REVIEWS`） |
| 弱机 / 无 GPU 加速 | EXP-05 | 低端环境 | 关闭或模拟无 GPU 时，确认页面仍可读、无与回退样式冲突的布局错位 |

## Validation Sign-Off

- [ ] 构建命令已写入 PLAN verification
- [ ] Manual 表已覆盖模态与 reduced-motion
- [ ] `nyquist_compliant: true`（执行完成后由负责人置位）

**Approval:** pending
