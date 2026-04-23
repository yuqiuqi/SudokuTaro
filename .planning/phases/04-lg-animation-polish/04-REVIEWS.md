---
phase: 4
reviewers: [gemini, codex-inline]
reviewed_at: 2026-04-23T15:30:00.000Z
plans_reviewed: []
note: "Phase 4 has no PLAN.md yet — reviewing phase definition, requirements, and research. Codex CLI timed out on long prompt; Cursor (inline) substituted as second reviewer."
---

# Cross-AI Plan Review — Phase 4: iOS 26 Liquid Glass 全量动画与交互精打

---

## Gemini Review

This is a comprehensive and technically sophisticated plan for a "Polish Phase." The move toward a **Token-first architecture** and the use of **modern CSS primitives** (like `linear()` and `@starting-style`) reflects a high-end engineering approach that avoids the "bloat" of heavy animation libraries.

The strategy correctly identifies the most common H5 pitfalls (modal exit flashes, mobile hover stickiness, and GPU strain from `backdrop-filter`) and provides architectural solutions for them.

### 1. Summary

Phase 4 is a high-ambition UI/UX overhaul that transitions SudokuTaro from a "functional H5 app" to a "premium-feel digital product." By leveraging modern CSS features and a robust five-state interaction model, the plan aims to replicate the physical "weight" and "rebound" of iOS 26. The technical choices are "bleeding-edge" but include necessary fallbacks, ensuring the app remains performant on mobile browsers despite the heavy use of glass effects and spring physics.

### 2. Strengths

- **Performance-First Glass Logic:** MOD-05 (reducing blur on the background when a modal is open) is an excellent optimization to prevent GPU overdraw.
- **Modern CSS Stack:** Using `linear()` for spring functions and `@starting-style` for entry animations allows for "native-feel" physics without the overhead of JavaScript-heavy libraries like Framer Motion or GSAP.
- **State-Driven Styling:** The `data-state` approach (BTN-03) provides a clean, declarative way to handle the complex "Five-State" model (Idle, Hover, Pressed, Disabled, Focused) which is often handled inconsistently in React.
- **Robust A11Y Integration:** Rather than an afterthought, `prefers-reduced-motion` is integrated into the token level, ensuring a safe experience for motion-sensitive users.

### 3. Concerns

- **[HIGH] Grid Performance:** CELL-02 (staggered ripples across 81 cells) could cause significant layout thrashing or "jank" on mid-range Android devices or older iPhones. 81 simultaneous animation instances, even if simple, can be taxing.
- **[MEDIUM] Browser Compatibility:** While `linear()` and `@starting-style` are supported in the latest Safari (17.2+ and 17.4+), users on older iOS versions (iOS 15/16) will fall back to standard `cubic-bezier`. If the "Liquid Glass" identity relies too heavily on these, the experience will feel downgraded for a significant chunk of users.
- **[MEDIUM] Contrast & Legibility:** MAT-01/02 (high blur and saturation) can often lead to text legibility issues, especially for the "Conflict" state (CELL-03). Ensure that the "Liquid Glass" background doesn't bleed into the functional color of the numbers.
- **[LOW] Exit Animation Complexity:** MOD-04 (`data-state="leaving"` + `setTimeout`) is effective but prone to "state-sync" bugs if the user triggers a "Close" while an "Open" animation is still in progress.

### 4. Suggestions

1. **CSS Variable Stagger:** For CELL-02, instead of generating 81 CSS rules, use a single CSS class on the cell and apply a `--cell-index` inline style via React. This allows you to calculate `delay: calc(var(--cell-index) * 8ms)` in one line of SCSS.
2. **GPU Acceleration Guard:** Add `will-change: transform, opacity` to the Modal and Cell components specifically during their active animation states.
3. **Low-Power/Low-End Detection:** Consider a `MAT-05` requirement: If the device is detected as low-power or if the framerate drops, automatically downgrade `backdrop-filter: blur(18px)` to a semi-transparent solid color.
4. **Touch-Start vs Click:** For BTN-01, ensure the "Press" state triggers on `touchstart` for mobile to eliminate the 300ms delay feel.

### 5. Risk Assessment

**Overall Risk Level: MEDIUM**

**Top 3 Risks:**
1. **Mobile Performance (High):** The combination of 81 interactive cells + `backdrop-filter` + spring animations may lead to dropped frames on sub-flagship devices.
2. **Implementation Bloat (Medium):** 34 requirements for a "polish" phase is very high. There is a risk of "over-engineering" the switch or button speculars at the cost of core gameplay stability.
3. **Safari/WebKit Quirks (Medium):** H5 "Glass" effects are notoriously buggy in Safari. Rigorous testing on physical iOS devices is mandatory.

---

## Codex Review (Cursor inline — Codex CLI timed out on long prompt)

### 1. Summary

Phase 4 is architecturally sound and correctly scoped as a "single polish phase" rather than spreading changes across multiple phases. The data-state attribute approach and three-layer token architecture are the right choices for this codebase. The Wave 1 → 2 → 3 dependency ordering is logical. The main risk is fitting 34 requirements into a single PLAN batch without creating regression risk on the already-working game logic.

### 2. Strengths

- **Token-first architecture (TOK-01~04):** Establishing the full token/mixin infrastructure in Wave 1 before touching components is the correct dependency order.
- **data-state attribute approach:** Minimal React footprint. Only requires adding 1 attribute to interactive elements.
- **MOD-04 (delayed unmount):** Correct solution to the flash-on-close problem. Using data-state="leaving" + setTimeout matching exit duration is the standard pattern.
- **A11Y-01 universal `*, *::before, *::after` coverage:** Most projects miss pseudo-elements. This is the correct full-coverage approach.
- **MOD-05 (reduce main card blur when modal open):** Proactive GPU management.
- **HERO-01 scroll-driven at zero JS cost:** Using `animation-timeline: scroll()` is the correct 2025 approach.

### 3. Concerns

- **[HIGH] CELL-02 stagger ripple — 81 concurrent transitions:** Simultaneously triggering style recalculations on up to 81 cells creates a style recalculation storm. The stagger delays don't prevent this — all 81 CSS transitions are registered at the same time. On mid-range Android this causes visible jank. **Mitigation needed:** limit ripple to cells currently in the same row/column/box (max 20 cells), not all matching digits globally.
- **[HIGH] SW-01/02 squash-stretch implementation complexity:** Pure CSS cannot animate `width` with spring timing in a way that synchronizes with `translateX`. This is likely the hardest requirement in the batch. Consider `scaleX()` transform instead.
- **[MEDIUM] BTN-02 specular `::after` width shrink:** `width 80%→40%` causes layout recalculation. Replace with `scaleX(0.5)` + `transform-origin: center` — GPU-accelerated, same visual result.
- **[MEDIUM] WIN-02 `requestAnimationFrame` number counter:** This introduces a JS-driven animation (rAF loop). Needs explicit `cancelAnimationFrame` in React `useEffect` cleanup to prevent memory leaks on unmount.
- **[MEDIUM] Wave 3 scope creep risk:** 7 parallel tracks all touching `index.scss` (850 lines). Merge conflicts between parallel implementations are likely. Suggest serialized execution within Wave 3.
- **[LOW] KBD-02 ambiguity:** Does arrow-key navigation move the game selection AND keyboard focus, or only the visual focus ring? Needs clarification before implementation.
- **[LOW] MAT-03 specular hover conflict:** If existing `::after` already has a `transition`, adding hover variant may produce unexpected interaction.

### 4. Suggestions

1. **Cap CELL-02 ripple scope:** Limit same-digit highlight ripple to same row + column + box (max 20 cells). Matches iOS behavior, eliminates performance risk.
2. **Simplify BTN-02:** Replace `::after width 80%→40%` with `::after scaleX(0.5)` + `transform-origin: center`. GPU-accelerated, no layout recalculation.
3. **Specify WIN-02 cleanup:** Explicitly require `cancelAnimationFrame(rafId)` in React `useEffect` cleanup.
4. **Add MAT-05 (low-power fallback):** When `navigator.deviceMemory < 4`, skip `backdrop-filter` and use `$ui-surface` solid background.
5. **Serialize Wave 3 within `index.scss`:** Explicitly note that all Wave 3 tasks touching `index.scss` should be executed sequentially to avoid conflicts.

### 5. Risk Assessment

**Overall Risk Level: MEDIUM**

**Top 3 Risks:**
1. **CELL-02 stagger ripple performance (HIGH):** 81 simultaneous CSS transitions on mid-range Android will cause frame drops during gameplay.
2. **SW-01/02 squash-stretch complexity (HIGH):** Pure CSS squash-stretch on a flex thumb element is non-trivial; may block Wave 3 completion.
3. **Wave 3 `index.scss` merge conflicts (MEDIUM):** 7 parallel tracks touching the same 850-line file. Without explicit ordering, implementation becomes error-prone.

---

## Consensus Summary

### Agreed Strengths (both reviewers)

- **Token-first Wave 1** is the correct dependency order — both reviewers call it out as a strength
- **data-state attribute five-state** approach is clean and minimal-footprint
- **MOD-05 blur reduction** when modal opens is excellent GPU proactive management
- **A11Y prefers-reduced-motion** at `*, *::before, *::after` level is the right full-coverage approach
- **Modern CSS stack** (linear(), @starting-style, scroll-driven) is the right choice without JS library overhead

### Agreed Concerns (both reviewers — HIGHEST PRIORITY)

| # | Concern | Severity | Requirement | Recommended Fix |
|---|---------|----------|-------------|-----------------|
| 1 | **CELL-02 ripple on 81 cells** — simultaneous style recalculation storm on mid-range Android | **HIGH** | CELL-02 | Limit ripple to same row+col+box (≤20 cells). Use `--cell-index` CSS var for delay calculation |
| 2 | **SW squash-stretch CSS complexity** — `width` animation with `translateX` spring sync is not cleanly doable in pure CSS | **HIGH** | SW-01/02 | Switch to `scaleX()` approach; or simplify to opacity+scale only |
| 3 | **BTN-02 `::after` width causes layout** — `width 80%→40%` triggers reflow | **MEDIUM** | BTN-02 | Replace with `scaleX(0.5) + transform-origin: center` |
| 4 | **WIN-02 rAF needs cleanup spec** — cancellation on unmount not specified | **MEDIUM** | WIN-02 | Add `cancelAnimationFrame` to requirement text |
| 5 | **Mobile performance budget** — backdrop-filter + 81 cells + spring animations combined | **MEDIUM** | MAT-01/02 | Add MAT-05: low-power device fallback |

### Divergent Views

- **Gemini** focuses on browser compatibility risk (iOS 15/16 fallback experience degradation)
- **Codex** focuses on implementation complexity (Wave 3 serialization, squash-stretch difficulty)
- **Both agree** the 34-requirement single-phase scope is ambitious but workable *if* the HIGH concerns are addressed before execution

### PR 2 (Recommended Actions Before Planning)

Based on consensus, these requirement adjustments are recommended before running `/gsd-plan-phase 4`:

1. **CELL-02** → restrict ripple to row+col+box cells only; use `style={{ "--cell-index": n }}` + CSS `calc(var(--cell-index) * 8ms)`
2. **BTN-02** → change from `width` animation to `scaleX` on `::after`
3. **SW-01/02** → simplify squash-stretch: use `scaleX(0.85)` (squash) / `scaleX(1.15)` (stretch) instead of `width` interpolation
4. **WIN-02** → add explicit `cancelAnimationFrame` cleanup requirement
5. **MAT-05** (new) → add low-power/low-memory device fallback: `navigator.deviceMemory < 4` → skip backdrop-filter, use solid `$ui-surface`
6. **Wave 3** → mark all Wave 3 tasks that touch `index.scss` as "sequential within same PLAN" to avoid merge conflicts
