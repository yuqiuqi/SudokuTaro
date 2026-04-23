---
phase: 4
slug: lg-animation-polish
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-23
---

# Phase 4 — Validation Strategy

> UI / 动效为主；无单独 jest 用例。验证以 **TypeScript + H5 构建 + 手测** 为主。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript 编译 + Webpack (Taro) |
| **Config file** | `tsconfig.json`, `config/index.ts` |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npm run build:h5`（与 `npx tsc --noEmit`） |
| **Estimated runtime** | ~60–120 秒（视机器） |

---

## Sampling Rate

- **每任务后：** `npx tsc --noEmit`
- **每 Wave 末：** 追加 `npm run build:h5`
- **UAT 前：** 两项均须 green

---

## Per-Task Verification Map

| Task | Plan | Wave | Requirement | Test Type | Command |
|------|------|------|-------------|-----------|---------|
| Token 三文件 + theme | 01 | 1 | TOK-01~04 | build | tsc + build:h5 |
| 按钮/格子 | 02 | 2 | BTN, CELL | build + 手测 | tsc + build:h5 |
| 弹层/Win/Switch/材质… | 03 | 3 | MOD, WIN, SW, MAT, HERO, A11Y, KBD | build + 手测 | tsc + build:h5 |

---

## Manual-Only Verifications

| 行为 | Requirement | 说明 |
|------|-------------|------|
| 60fps 感 / 无长帧 | 各 MOTION | 真机低电量与低端内存路径 |
| reduced-motion | A11Y-01~03 | 系统设置开关 |
| 同数涟漪仅 20 格内 | CELL-02 | 与选中格同区 |
| 弹层关无闪 | MOD-04 | 快速连点 |

---

## Validation Sign-Off

- [ ] 全部任务含 `npx tsc` 或等效 verify
- [ ] 无 “仅手测无构建” 的连续三任务
- [ ] `nyquist_compliant: true`

**Approval:** pending
