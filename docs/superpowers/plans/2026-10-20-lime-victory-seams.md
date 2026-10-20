# Lime Victory Seam Light Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Immediately after the rainbow wave settles, emit one convincing lime light pulse only through all Sudoku grid seams, then reveal results; include this addition in the pending v1.2.0 release.

**Architecture:** Extend the existing event-driven celebration into wave → seam light → results. The final wave cell's actual animationend starts a decorative seam-only layer in the same transition; its real animationend reveals results. Use thin bright cores, lime emission and a soft falloff around the existing grid lines, keeping cells flat, digits readable and cell centers unchanged.

**Tech Stack:** Existing Taro/React/TypeScript/Sass and Chromium tests; no runtime dependencies.

**Spec:** User's 2026-10-20 steering: after the wave ends, immediately flash lime through every cell gap/border, like light emerging from underground seams; realistic light source; only seams flash.

## Global Constraints

- Preserve the already-merged rainbow wave: 960ms envelope + 90ms × row/column sum = about 2400ms. No lime glow during its rise/fall/afterglow; no inter-stage timeout or deliberate pause.
- A single approximately 650ms seam pulse follows, with a quick but smooth emergence and softer decay. A narrow pale luminous core, lime-colored emission and limited bloom simulate light escaping gaps; no full-cell recoloring, repeated strobing, new cell motion or screen overlay.
- Cover all 8 interior horizontal and 8 interior vertical boundaries plus cell perimeter edges; align with the rendered board at every responsive size, including thicker 3×3 boundaries. Do not change layout, border spacing or native hit targets.
- Both stages obey Escape, menus, new game, reload and dynamic/static reduced motion. Results only follow the seam's actual completion; cleanup leaves no glow, listeners or stale result popup. Static reduced motion skips both stages.
- All AGENTS.md validation and existing regression scenarios remain required. Tests must sample actual animation states and verify ordering rather than replace assertions with longer sleeps.
- User explicitly authorized unattended implementation, delegation, PR/review/merge/deploy, README, tag/release; new steering adds scope to that continuing workflow. Version remains 1.2.0 (not yet tagged or released). Do not request duplicate design/plan/integration approval.
- Existing branch `feat/lime-victory-seams` begins at merged main `bce28da`. Do not create a worktree. Use the existing browser adapter, keep BROWSER_EXECUTABLE unset, and never run dev server alongside production tests.

## Review Focus

1. A halo starts while any wave cell is unsettled: pause the final wave animation past its nominal end and require no lime/results.
2. Wave completes but results cover the lime: capture actual wave and seam end ordering, pause seam animation past duration, require no results until it ends.
3. All grid lines light but cell faces are painted too: use seam-only unfilled strokes/masks and inspect actual normal/tiny screenshots, unchanged cell center styling and native clicks.
4. Cancel/reduced-motion between or during stages: exercise both phases and check no delayed modal or repeated records.
5. Overlay drifts on narrow/landscape/compressed views: verify line geometry matches the live board and remains inside usable space.

## Task 1: Implement, test and document the seam pulse

**Files:** `src/pages/index/index.tsx`, `src/pages/index/VictoryResult.scss`, `src/pages/index/VictoryResult.tsx` or a focused decorative component if appropriate; `tests/browser.cjs`; update current feature wording in README/CONTEXT/responsive docs/release notes and unique screenshot(s).

**Interfaces:** preserve `.is-celebrating`, native `.sudoku-cell` and `.dialog-won`; add an explicit seam phase with a dedicated decorative selector. CSS owns each animation duration. Last-wave animationend begins seam; seam animationend ends celebration. Any extra layer is aria-hidden and pointer-events:none.

- [ ] Add meaningful failing browser tests on the current wave-only build: seams absent until final wave settles, immediate seam start while all 81 cells flat, lime-only unfilled seam strokes with narrow falloff, results held until real seam completion.
- [ ] Implement event-driven phase transitions and the seam light layer. Retain the original wave values and gradients. Use one light pulse with a bright core and spatial falloff; do not use a full-board tint or 81 separate animated filters.
- [ ] Extend both-phase cancellation, static/dynamic reduced motion, refresh/records-once, normal/280×320/480×240/568×240/visualViewport=400 assertions. Adapt original wave final-result assertions to the new intermediate phase without losing their ordering guarantees.
- [ ] Run typecheck, all 9 logic tests, production root build and complete browser regression. Capture seam onset/peak/fade frames, inspect normal and short-landscape images; record the test that first failed.
- [ ] Update feature documentation to wave → lime seams → results and explain actual timing/test limits. Keep deployment/release status pending until verified. Save a useful unique actual seam screenshot without overwriting earlier screenshots. Version/dependencies stay unchanged.
- [ ] Self-review and commit, then obtain independent spec and quality review. Resolve important findings with tests before proceeding.

## Task 2: Complete the authorized release workflow

- [ ] Match a Pages subpath build with the full Pages browser suite, create a second feature PR, perform professional whole-change review and wait for actual successful CI checks before merging exact reviewed head.
- [ ] Track main SHA-specific CI and real Pages deploy; fetch published resources with normal TLS verification and functionally check wave → seam → result on those exact deployed resources.
- [ ] After deployment, finalize README and release notes with verified links/status through reviewed documentation PR as needed; do not claim direct online Chromium navigation when only verified fetched assets were rendered locally.
- [ ] Tag the final verified main merge as v1.2.0 and publish/verify GitHub Release, then report actual completed stages.

## Prior delivery evidence

- Rainbow PR #10 merged as `bce28da2b6dc18ceb5ccae93607dde99573749fa`, independently reviewed without findings; CI `39381568695` and Pages `39381568658` succeeded.
- Wave-only published assets passed browser functional smoke via a loopback relay fetching actual live resources using system curl TLS verification (18 verified requests, real Z displacement, result order, records-once, runtimeErrors=[]). Direct cloud Chromium HTTPS navigation failed because its trust store lacks the cloud proxy CA.
- Auto-review rejected adding the proxy CA to Chromium's persistent NSS store because it expands trust and was not specifically authorized. Trust settings remain unchanged; no TLS checks were disabled. The supported safer validation uses the existing system trust store and clearly discloses its rendering route.
- Original v1.2.0 release/tag was intentionally deferred when this user-requested addition arrived; no release was prematurely published.
