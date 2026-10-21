# Stable Feedback and Thumb Keypad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate transient error-driven shrinking, set the whole mobile game area's side gutters to 6px, and redesign digits 1–9 for comfortable one-handed use across normal and wide phones, then complete the pending v1.2.0 release.

**Architecture:** Reserve stable feedback capacity in each responsive layout instead of changing the board budget when a message appears. Separate outer game width from constrained board geometry where necessary, and select a deliberate thumb keypad arrangement from available width/height. Keep the existing game state and the event-driven rainbow → lime seams → results sequence intact.

**Tech Stack:** Existing React/Taro/TypeScript/Sass and browser tests; no new dependencies.

**Spec:** User reported that conflicts shrink the whole interface until feedback disappears, requested removing that movement, clarified **the entire game area is 6px from each screen side**, and delegated 1–9 keypad design for ordinary and wide phones to our judgment. Existing unattended test/PR/review/merge/deploy/README/tag/release authorization continues; no extra design confirmation is required.

## Global Constraints

- Feedback text must remain visible and accessible. Board, outer shell, tools and digit controls retain the same dimensions/positions before an error, during it and after its automatic or manual dismissal. Do not hide feedback, crop it or overlay it on playable cells/buttons to obtain stability.
- `useGameLayout.ts` currently subtracts an extra 28px for feedback and CSS hides unused captions in some modes. Both the JS budget and CSS flow must be diagnosed; removing only the dependency without reserving real text space is insufficient.
- Use 6px left/right gutters for the rendered outer mobile game area, respecting larger safe-area insets on notched devices. This is not the internal glass-frame padding. Judge actual rendered alignment, not just a padding declaration or an empty full-width shell.
- Prefer an intelligible 3×3 thumb keypad when vertical space permits, with generous separated targets; compact two-row fallback when height is limited; wide landscape uses a compact 3×3 beside the board. Wide portrait should avoid stretching controls to excessive thumb travel. Preserve row-major number order, visible 1–9, keyboard support, notes and all existing behavior. Do not add unrelated handedness settings or new controls.
- Aim for ≥44px normal-phone digit target heights when space permits; tiny 240px landscapes/280×320 remain explicit constrained fallbacks. Never claim device ergonomics are proven by geometry alone.
- No page scrolling or masked clipping. Keep all81 cells,9 digits,tools,menus,feedback and victory/hint actions usable in all existing viewports, fold simulations and visualViewport=400. Preserve coherent alignments while updating old portrait-edge expectations only where this explicit new design intentionally changes them; do not delete regressions to get green.
- Preserve 2400ms rainbow plus650ms lime-only seam pulse, all81center-pixel invariance, phase ordering, cancellation, reduced motion, records-once and storage format. Version stays1.2.0 until the pending release; dependency graph stays identical.
- Work on existing isolated checkout `/workspace/SudokuTaro`, branch `feat/stable-feedback-thumb-keypad` from merged main77461b3. No worktree or remote mutation by implementer. Never start dev:h5 alongside production validation.

## Review Focus

1. Geometry looks stable at rest but moves when feedback mounts/wraps/expires: compare real board/shell/tool/key rectangles across all three states, including Chinese/English and compressed/short layouts.
2. 6px outer gutter declaration with narrower inset visible content: inspect actual normal-phone screenshots and meaningful outer columns/headers; retain safe-area support.
3. Comfortable keys steal board/hint/dialog space: test real sizes and clicks, including extreme landscapes and small phones, never rely on overflow:hidden.
4. Key arrangement changes break notes/labels/order or wide phone reach: test the exact selected arrangement and all9 real hit targets after resize/orientation.
5. Width changes misalign rainbow/lime overlay or invalidates border-only glow: preserve and run complete wave/seam geometry and pixel tests at the new sizes.

## Task 1: Implement, test and document stable mobile layout

**Files:** `src/pages/index/useGameLayout.ts`, `src/pages/index/index.scss`, `src/pages/index/index.tsx` only as needed for semantic mode classes; `tests/browser.cjs`; current README/CONTEXT/responsive/release notes and unique screenshots. Modify victory source only for a proven necessary geometry correction, not to weaken the accepted effect.

**Interfaces:** eliminate feedback visibility as a layout sizing input; keep feedback state only for content/style. Coordinate consistent reserved caption height with initial geometry budgets. Add an explicit keypad mode/class or CSS breakpoint if required, with a single coherent source of truth.

- [x] Add failing browser reproduction for conflict-driven shrinking using existing seed `[data-cell="2"]` + conflicting digit5. Compare board, relevant shell/controls and keypad rectangles before/during/after feedback, including automatic expiry at least once. Demonstrate the expected failure before production changes.
- [x] Add failing checks for clarified6px outer gutters and the selected adaptive keypad arrangements/target geometry on representative normal/tall/wide phones. Record the chosen breakpoints and their height trade-offs.
- [x] Implement a stable feedback slot and remove transient message-driven budget changes across all modes. Keep full feedback visible. Implement outer6px gutters and thumb keypad layouts using available height so it does not create new jumps or clipped controls.
- [x] Extend real clicking and notes/undo/conflict checks after resize, and preserve all existing geometry/dialog/wave/seam tests. Update any intentional alignment assertion with the new user requirement and a clear reason; never replace meaningful checks with class-name-only checks.
- [x] Run typecheck, all9logic tests, root production build and full Chromium suite with `PLAYWRIGHT_MODULE=/workspace/sudokutaro-tools/playwright.cjs` (BROWSER_EXECUTABLE unset). Save RED/final logs under `/workspace/sudokutaro-tools/keypad-work`; no simultaneous dev server.
- [x] Capture and inspect actual390×720,390×844,430×932,small-phone and844×390 views, plus before/error/after screenshots. Keep useful unique docs screenshots and accurately update feature/test documentation without claiming not-yet-performed Pages/deployment.
- [x] Self-review, commit scoped files and report. Obtain independent spec+quality review; resolve important findings with coverage before delivery.

## Task 2: Continue complete reviewed release delivery

- [x] Run matched Pages build+full browser suite; create feature PR, professional whole-change review, actual remote CI checks and exact-head merge.
- [x] Verify SHA-specific main CI and real Pages deployment; use normal TLS to fetch actual published resources and validate both stable feedback/adaptive keypad and preserved victory phases on them. Direct cloud browser trust remains unchanged.
- [ ] Finalize current README/release evidence through reviewed documentation changes as needed; track actual completion in the [public execution record](https://github.com/yuqiuqi/SudokuTaro/pull/14#issuecomment-6309725414). Keep historical wave/lime deployment records distinguishable from the new layout deployment.
- [ ] Publish annotated v1.2.0 tag at the final verified merged commit and GitHub Release; verify remote metadata. Track completion in the [public execution record](https://github.com/yuqiuqi/SudokuTaro/pull/14#issuecomment-6309725414) and [Releases](https://github.com/yuqiuqi/SudokuTaro/releases); this repository checkbox records the pre-release checkpoint.

## Prior state

- Rainbow#10, lime#11, documentation#12 already reviewed and merged; main77461b3. Combined victory implementation passed root/Pages/browser/pixel tests and actual deployed-resource functional checks before this layout addition.
- No v1.2.0tag or Release exists yet. Publication remains deferred until this requested fix/redesign is complete.
- The retained local browser adapter is `/workspace/sudokutaro-tools/playwright.cjs`. Deployed-resource verification uses systemcurlTLS plus local rendering because direct Chromium trust lacks the cloud proxy CA; trust modification was rejected, and no TLS verification was disabled.

## 已验证交付记录

- PR #13 已审查、通过匹配根路径／Pages 完整回归及远端 CI，合并为 `a777f27`，主 CI `39527714680`、实际 Pages `39527714582`成功；实际线上资源经正常 curl TLS 校验、本地转接 Chromium 验证稳定反馈／6px／数字区／胜利流程，runtimeErrors=[]。
- 后续 PR #14 保留上述功能并修复提示／焦点／临界尺寸；合并 `43c26c8` 的主 CI `39555925083`、实际 Pages `39555924968` 与本轮18次TLS资源功能验证通过。最终文档和正式版本交付按上方公开记录持续更新，不为标签后回填复选框追加源码提交。
