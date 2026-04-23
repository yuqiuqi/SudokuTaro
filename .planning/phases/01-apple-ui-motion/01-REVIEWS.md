---
phase: 01
reviewers: [gemini, codex]
reviewed_at: 2026-04-23T12:00:00Z
plans_reviewed:
  - 01-01-PLAN.md
  - 01-02-PLAN.md
  - 01-03-PLAN.md
---

# Cross-AI Plan Review — Phase 1

> 由 `/gsd-review --codex --gemini` 生成。`gemini` 段已去掉 CLI 的 Node 无关告警行。

---

## Gemini Review

# Plan Review: Phase 1 — Apple-style UI & Motion

## Summary
The proposed implementation plans (01-01 through 01-03) provide a high-quality, systematic approach to evolving the SudokuTaro UI towards a modern Apple-inspired aesthetic. The strategy of establishing a "Single Source of Truth" via dual-track tokens (TypeScript and SCSS) is robust and ensures long-term maintainability. The phased rollout—starting with the design system, moving to structural styling, and concluding with motion—follows best practices for minimizing regression risks while delivering high visual impact.

## Strengths
- **Single Source of Truth (SSOT)**: The synchronization between `theme.ts` and `_ui-tokens.scss` is well-designed, allowing both styles and logic (like vibration settings or Canvas-based components in Phase 2) to reference the same design intent.
- **Performance-First Motion**: The plans strictly enforce `transform` and `opacity` for animations, which is critical for maintaining 60fps on low-end mobile devices and WeChat Mini Program environments.
- **Accessibility Awareness**: Explicit inclusion of `prefers-reduced-motion` media queries demonstrates a senior-level understanding of inclusive design.
- **Preservation of Legacy**: Plan 01-01 explicitly keeps the existing `figma` tokens, preventing breaking changes while introducing the new `appleUi` system.
- **Surgical Refactoring**: The audit task in 01-03 ensures that hardcoded hex values are progressively removed, satisfying the `TEC-01` requirement without demanding a risky "big bang" rewrite.

## Concerns
- **Backdrop-Filter Compatibility (MEDIUM)**: While the plan mentions `backdrop-filter`, support for `blur` in WeChat Mini Programs (especially on older Android devices) can be inconsistent or performance-heavy.
  - *Risk*: Modals or the `content-wrap` might look flat or cause lag if the hardware acceleration doesn't kick in.
- **Font Stack Precedence (LOW)**: In Plan 01-02, the font stack starts with `-apple-system`. On H5/Windows, this might fall back to `Segoe UI`. Ensure the ordering reflects the project's desire for the "Apple look" even on non-Apple devices where possible (e.g., providing SF Pro webfonts if licensing allows, though the current plan avoids them for bundle size).
- **Z-Index Management (LOW)**: Adding new modal classes and transitions might conflict with existing Taro view nesting.
  - *Risk*: The transition from "not rendered" to "rendered" in React (as seen in the `wonOpen ? ... : null` pattern) makes entry animations easy but exit animations difficult without a dedicated transition library. The plan acknowledges that exit animations for unmounting components are "accepted" as instant, which is a pragmatic but slightly less "fluid" compromise.

## Suggestions
- **Backdrop-Filter Fallback**: In `_ui-tokens.scss`, define a variable like `$ui-surface-glass` that uses `rgba()` with a higher opacity (e.g., 0.94) alongside the `blur`. This ensures that even if `backdrop-filter` fails to render, the card remains legible and matches the Apple "system-light" feel.
- **Safe Area Verification**: In Plan 01-02, specifically verify that the `.page` padding doesn't double-count `safe-area-inset-bottom` when combined with the new `.actions` functionally-layered bottom margin.
- **Spring-like Cubic Bezier**: Consider using a slightly more "elastic" bezier for the `modalSheetIn` animation, such as `cubic-bezier(0.175, 0.885, 0.32, 1.1)` (easeOutBack) for that signature Apple "bounce," though the current `0.32, 0.72, 0, 1` is a very safe "fluid" system curve.
- **Tap Highlight**: For H5, ensure `-webkit-tap-highlight-color: transparent;` is applied globally to avoid the default grey box when tapping buttons, which breaks the "native app" illusion.

## Risk Assessment: LOW
The plans are well-scoped, utilize native Taro/SCSS features without introducing heavy dependencies, and include clear verification steps (`npx tsc --noEmit`). The dependency chain is logical, and the threat model correctly identifies that these changes are low-risk UI enhancements. The primary risk is purely aesthetic/visual (e.g., a specific device not rendering a blur), which does not impact the core gameplay logic.

**Approval Recommendation**: Proceed with implementation of Plan 01-01.

---

## Codex Review

# Plan 01-01 Review

## Summary
`01-01` has a sound first-principles goal: establish a token source of truth before touching broader UI. The sequencing is mostly right for Phase 1, but the plan is now partially stale relative to the repo: `appleUi`, `_ui-tokens.scss`, and shared token forwarding already exist, and the actual SCSS source of truth is `src/styles/_apple-ui-tokens.scss`, not a new page-local token file. As written, this plan risks duplicating token definitions and creating drift instead of reducing it.

## Strengths
- Starts with `TEC-01`, which is the right foundation for the later visual and motion work.
- Preserves existing `figma` export instead of replacing it outright.
- Includes concrete acceptance criteria and explicit verification commands.
- Calls out safe-area padding preservation, which matters for mini program layout stability.
- Keeps scope narrow: token setup plus `.page` background migration.

## Concerns
- `HIGH`: The plan creates a second semantic token source in `src/pages/index/_ui-tokens.scss`, but the repo already forwards to a shared token file. That undermines the "single source of truth" objective.
- `HIGH`: The prescribed `appleUi` shape is narrower than the current implementation, which already includes `board`, `hero`, and `liquidGlassSubset`. A literal implementation of the plan could accidentally regress or delete already-used fields.
- `MEDIUM`: The prescribed `@import './ui-tokens.scss'` is inconsistent with the current `@use './ui-tokens' as *;` approach in `index.scss`. Reverting to `@import` is a backwards step.
- `MEDIUM`: The "use `color-mix` or approximate tones" instruction is underspecified on compatibility and visual parity. For Taro multi-end styling, introducing `color-mix` without an explicit compatibility decision is risky.
- `LOW`: Verification is TS-only plus optional build. It does not check Sass compilation or token drift between TS and SCSS.

## Suggestions
- Change the plan to treat `src/styles/_apple-ui-tokens.scss` as the SCSS source of truth, with page-local `_ui-tokens.scss` remaining only a forwarder if needed.
- Add a non-regression criterion: existing `appleUi.board`, `appleUi.hero`, and any currently referenced token groups must remain intact.
- Replace `@import` with `@use` unless there is a proven build incompatibility in this repo.
- Add a drift audit step: confirm key token values match between `theme.ts` and shared SCSS.
- Add Sass/build validation, not just `tsc`.

## Risk Assessment
**Overall risk: MEDIUM** — The intended dependency order is good, but the plan is stale against the current codebase and could reintroduce duplication in the token layer, which is exactly what this phase is trying to avoid.

---

# Plan 01-02 Review

## Summary
`01-02` is directionally aligned with the phase goals: hierarchy, typography, modal surfaces, and CTA semantics. It is also reasonably constrained to presentation work. The main issue is that it assumes a simpler baseline than the repo now has; many of these changes already exist in `index.scss`. That makes the plan less of an execution plan and more of a reconciliation/audit plan. Without adapting to current selectors and current visual semantics, it risks churn rather than progress.

## Strengths
- Correctly depends on token work first.
- Covers the main user-facing surfaces for `EXP-01` and `EXP-03`.
- Uses measurable typography acceptance criteria like `>= 26rpx`.
- Explicitly distinguishes accent CTA from neutral actions.
- Keeps implementation in SCSS/app shell, avoiding unnecessary TS changes.

## Concerns
- `HIGH`: The plan assumes classes or structure such as "grid outer wrapper/panel" may exist, but the real structure is `content-wrap`, `board-section`, and `grid`. That makes parts of the plan imprecise for execution.
- `MEDIUM`: The font-stack task is framed as optional but can still produce conflicting declarations between `app.scss` and page styles if not handled as a single ownership decision.
- `MEDIUM`: "主 CTA 用 `$ui-accent` 或基于 accent 的渐变" is fine visually, but the current code already uses semantic separation between neutral action buttons and modal CTA. The plan should explicitly preserve that rather than re-style all buttons toward accent.
- `MEDIUM`: No explicit review of mini program rendering differences for typography, line-height, and blur-heavy surfaces. The plan mentions appearance, not the platform-specific cost.
- `LOW`: Acceptance criteria depend on grep patterns rather than actual class/DOM behavior, so they can pass while UI remains visually inconsistent.

## Suggestions
- Rewrite this as an audit-and-adjust plan against the existing selectors: `content-wrap`, `stats`, `grid`, `modal__card`, `modal__btn`, `btn--glass`, `btn--solid`.
- Make ownership explicit: global font stack in `app.scss`, page-specific overrides only if justified.
- Add a "do not regress current interaction semantics" note: tool buttons remain neutral, modal primary remains accent, difficulty pills remain distinct.
- Add one manual validation item for H5 and one for WeChat mini program typography sizing.
- Include a "no new bare semantic hex values in `index.scss`" criterion, since this plan still touches a lot of color-bearing styles.

## Risk Assessment
**Overall risk: MEDIUM** — The plan targets the right UX outcomes, but it is partially obsolete and too grep-oriented. It needs tighter mapping to the current stylesheet structure to avoid redundant edits and visual regressions.

---

# Plan 01-03 Review

## Summary
`01-03` is the strongest of the three in terms of direct phase-goal coverage. It closes the loop on `EXP-02`, `EXP-04`, `EXP-05`, and part of `TEC-01`, and it uses the right technical levers: `transform`, `opacity`, and reduced-motion handling. The biggest weakness is that it assumes some motion work is still missing even though reduced-motion, modal entry animation, action-button press states, and conflict transitions already exist. In its current form it risks double-implementing or subtly regressing the carefully tuned no-sticky-hover behavior.

## Strengths
- Covers the highest-risk part of the phase: motion behavior across H5 and mini programs.
- Explicitly avoids `width`/`height` transitions and reflow-heavy animation paths.
- Includes reduced-motion as a first-class requirement rather than a follow-up.
- Recognizes conditional rendering constraints on modal entry animation.
- Adds a token-audit step instead of only visual restyling.

## Concerns
- `HIGH`: The plan’s action-button guidance conflicts with the current anti-sticky strategy in `index.scss` (e.g. default transitions intentionally removed; only press-state classes get short transitions). Reintroducing generic transitions can bring back the hover lag the project is explicitly avoiding.
- `MEDIUM`: The plan says "three modals behavior consistent," but current closing behavior is still unmount-on-close with no exit animation. That is acceptable per the plan, but it means `EXP-04` is only half-covered unless "enter-only consistency" is stated explicitly.
- `MEDIUM`: Reduced-motion guidance should also address cell highlight/conflict transitions.
- `MEDIUM`: The token audit criterion "`$ui-` appears >= 15" is weak. It measures volume, not correctness.
- `LOW`: The plan does not explicitly mention testing on lower-end mini program devices where `backdrop-filter` and layered blur can dominate perceived smoothness more than the transform animations themselves.

## Suggestions
- Reframe the button task as "preserve existing no-sticky-hover contract; only tune press-state classes if needed," not "add generic transition."
- State explicitly whether entry-only modal animation is sufficient for this phase; if yes, encode that in acceptance criteria.
- Replace the `$ui-` count check with a targeted denylist of semantic hex values that must not remain in `index.scss`.
- Add one platform-performance validation item for blur-heavy overlays and glass surfaces in WeChat devtools plus one physical device.

## Risk Assessment
**Overall risk: MEDIUM** — This plan is closest to phase completion, but it is also the most likely to interfere with already-tuned interaction behavior if executed mechanically.

---

# Overall Assessment (Codex)

## Summary
As a sequence, the three plans are logically ordered and broadly aligned with the phase goals. The main quality problem is not missing ambition but **stale assumptions**: the repo already contains substantial Phase 1 work, including shared tokens, accent CTA styling, modal entry animation, reduced-motion handling, and mini-program-specific hover tuning. The plans should be rewritten as **delta plans** against the current codebase, otherwise they risk duplication, drift, and regressions in the exact areas they aim to standardize.

## Cross-Plan Risks
- `HIGH`: Token ownership is ambiguous between `theme.ts`, page-local `_ui-tokens.scss`, and the actual shared SCSS token file.
- `MEDIUM`: Verification leans too heavily on grep/TS checks and not enough on Sass/build/runtime behavior.
- `MEDIUM`: The plans under-specify how to avoid regressing current tuned interactions, especially `hoverStayTime={0}` and press-state handling for mini programs.
- `MEDIUM`: Performance guidance calls out blur risks, but the plans do not convert that into concrete validation gates for glass surfaces and overlays.

## Recommendation
Treat all three as **re-baseline plans**, not executable plans as written. Before execution, update them to: reference the current shared token file and current selectors; mark already-complete acceptance criteria as satisfied; narrow remaining diffs; strengthen runtime validation for H5 and WeChat mini program.

## Overall Risk Assessment
**Overall risk: MEDIUM** — The phase is feasible; the risk comes from plan/codebase drift: executing these literally would create redundant edits and could regress already-working motion and token conventions.

---

## Consensus Summary

### Agreed strengths（≥2 评审）
- 分波依赖合理：先 token/表面，再排版与模态，最后动效与降级。
- 动效以 `transform` / `opacity` 为主、并包含 `prefers-reduced-motion`，与多端性能一致。
- 安全面主要是展示层，威胁模型中风险较低。

### Agreed concerns（优先处理）
- **微信端 `backdrop-filter` / 毛玻璃** 兼容与性能需显式真机/开发者工具验证与降级策略（两边均提到；Gemini 为 MEDIUM，Codex 纳入跨端性能）。
- **PLAN 文檔与仓库现状可能脱节**：Codex 认为若按字面再执行，易造成重复劳动或回退已调好的 `hover`/`transition` 策略；**应以当前 `src/styles/_apple-ui-tokens.scss` 与实装为准做增量清单**。

### 分歧
- **整体风险档位**：Gemini 对「按计划执行」给出 **LOW**；Codex 因 **stale plan vs code** 给出 **MEDIUM** 及「改写成 delta/审计计划」的强建议。对「是否还要机械执行三份旧 PLAN」应以 Codex 侧为戒；对「单份计划内在质量」可参考 Gemini 的积极评价。

### Divergent views
- **弹性/弹簧曲线**：Gemini 建议可尝试更「弹」的 cubic-bezier；Codex/实现侧更强调**不要**破坏现有关闭 hover 粘滞的约束，优先保交互契约而非追求弹跳感。

---

## Next step

在更新计划时：

```text
/gsd-plan-phase 1 --reviews
```

（若你使用的 GSD 版本支持从 `01-REVIEWS.md` 拉取；否则在 `PLAN` 中手动吸收上表。）
