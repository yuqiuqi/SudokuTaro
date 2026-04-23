# Phase 4 — 领域研究（索引）

**状态：** 与 `/gsd-plan-phase 4 --reviews` 联用；本文件**不重复**长文，指向 v2.0 已写入仓库的研究包。

| 文档 | 内容 |
|------|------|
| `.planning/research/SUMMARY.md` | 总览、关键数值、架构决策、风险表 |
| `.planning/research/FEATURES.md` | Liquid Glass、动效、五态、组件级行为 |
| `.planning/research/STACK.md` | `linear()`、`@starting-style`、scroll-driven 等 |
| `.planning/research/ARCHITECTURE.md` | 三层 token、data-state、文件布局 |
| `.planning/research/PITFALLS.md` | Safari、backdrop、rpx、reduced-motion |
| `04-REVIEWS.md` | 跨模型评审与 PR-2 修订（已吸收进 `REQUIREMENTS.md`） |

## Validation Architecture

**自动化（每任务/每 Wave）：**

- `npx tsc --noEmit` 必须通过。
- `npm run build:h5` 无 error。

**本 Phase 无独立单元测试架** — 以构建 + 手测为主；动效/材质以视觉与 Performance 为准。

**手测基线：**

- 桌面 Chrome：全交互路径。
- 移动 Safari（或同 WebKit）：全交互 + 玻璃/滚动；**低端机**验证 `deviceMemory` 与 `MAT-05` 实色回退。

**可访问性：**

- 系统设 `prefers-reduced-motion: reduce` 时验收 `A11Y-*` 白名单与静止 Hero。

---

## RESEARCH COMPLETE
