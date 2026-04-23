# Phase 1 — 计划再基线（Cross-AI Review 后）

**日期：** 2026-04-23  
**来源：** `01-REVIEWS.md`（Gemini + Codex）与 `01-01` / `01-02` / `01-03` 的原始 `*-PLAN.md`

## 说明

- `01-01-PLAN` … `01-03-PLAN` **保留**为历史与验收线索，**勿按字面重跑**（尤其是新建独立 token 文件、在操作行上无差别加 `transition` 等），以免与**当前**仓库中已落地实现冲突；详见评审中的 **stale plan vs code** 结论。  
- **可执行增量** 以新文件 **`01-04-PLAN.md`** 为准。  
- 设计/代码真源以评审共识为准：  
  - SCSS：[`src/styles/_apple-ui-tokens.scss`](../../../src/styles/_apple-ui-tokens.scss)  
  - 页面转发：[`src/pages/index/_ui-tokens.scss`](../../../src/pages/index/_ui-tokens.scss)  
  - TS：[`src/utils/theme.ts`](../../../src/utils/theme.ts)  
  - 小游戏：[`minigame-wechat/src/appleUiTheme.ts`](../../../minigame-wechat/src/appleUiTheme.ts)（与主站手同步）

## 与 `/gsd-plan-phase 1 --reviews` 的对应

本再基线由 **`/gsd-plan-phase 1 --reviews`** 产生，将评审中的 **可验证增量** 收敛为第 4 份 Plan，供 `/gsd-execute-phase` 或人工按波次执行。
