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
| **Full suite command** | `npm run build:h5`；`npm run build:weapp` |
| **Estimated runtime** | 1–5 分钟（视机器） |

## Sampling Rate

- **每 Plan 完成后：** `npx tsc --noEmit`
- **Phase 收尾：** `npm run build:h5` + `npm run build:weapp`
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
| 按下态与弹层动效 | EXP-02, EXP-04 | 视觉与时序 | 微信开发者工具 + H5：点按钮/格；开关系统「减少动态效果」或浏览器 reduced-motion |
| 帧率主观 | EXP-05 | Performance | 交互时观察是否卡顿 |

## Validation Sign-Off

- [ ] 构建命令已写入 PLAN verification
- [ ] Manual 表已覆盖模态与 reduced-motion
- [ ] `nyquist_compliant: true`（执行完成后由负责人置位）

**Approval:** pending
