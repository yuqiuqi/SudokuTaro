# Rainbow Victory Wave Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing victory glow with a vivid diagonal rainbow wave that lifts and settles the completed Sudoku cells before revealing results, then deliver the reviewed release.

**Architecture:** Use the existing victory lifecycle and CSS 3D transforms on the 81 native cell buttons. Stagger a shared wave envelope by row + column so neighboring diagonals rise, shimmer through rainbow colors and settle in sequence; reveal results only after the last cell settles. Keep progress, records, menus, Escape and reduced-motion behavior intact; add no runtime dependency.

**Tech Stack:** Taro 4.3, React 18, TypeScript 7, Sass, Node.js 22+, Playwright/Chromium, GitHub Actions/Pages.

**Spec:** User-approved in-chat “彩虹立体浪潮” design, captured in the acceptance criteria below.

## Global Constraints

- About 2.4 seconds total: one wave from top-left to bottom-right, local lift/tilt with depth shadows and colored highlights, then smooth descent and faint afterglow.
- Every cell is fully settled before the results dialog opens. Preserve readable numbers and board dimensions.
- Reduced motion skips the wave; Escape, starting another game or opening a menu cannot cause a delayed unwanted dialog. Refresh does not repeat victory or record another win.
- Preserve all AGENTS.md regressions, including 240px landscape and visualViewport compression. No new dependency, canvas engine or WebGL requirement.
- Work on `feat/rainbow-victory-wave` in the existing isolated cloud checkout. Include the already-authorized Cursor documentation cleanup without discarding any existing work.
- User explicitly authorizes unattended implementation, PR creation, review, merge, Pages deployment, README updates, tag and release. Do not pause for design, plan or integration confirmation again. External permissions remain prerequisites.

## Review Focus

1. Last diagonal still falling when results cover it: test completion ordering with browser animation events / animation timing, not merely a fixed sleep.
2. Tiny landscape cells lift outside the usable viewport: validate wave frames at compact sizes and retain real hit targets after cleanup.
3. Preference changes or menus during the wave: test cancellation, reduced-motion changes and no stale timer/dialog.
4. Reload or start a new game during celebration: test records once and no leftover animated styles.
5. A screenshot looks colorful but no cells actually lift: inspect computed 3D transforms/shadows and diagonal timing at representative wave phases.

## Task 1: Implement and verify the diagonal rainbow wave

**Files:** modify `src/pages/index/index.tsx`, `src/pages/index/VictoryResult.scss`, and optionally `src/pages/index/VictoryResult.tsx`; add a small animation constants/helper module only if needed; extend `tests/browser.cjs` (or a focused browser helper invoked by it).

**Interfaces:** retain `.is-celebrating`, `.dialog-won`, native `.sudoku-cell` buttons and existing victory lifecycle. Use row + column for diagonal delay; keep the timer/animation completion consistent with the CSS duration. Consume `PLAYWRIGHT_MODULE=/workspace/sudokutaro-tools/playwright.cjs` for local browser tests.

- [x] Add behavior tests that fail against the existing green glow: diagonal propagation, actual positive Z displacement/tilt, rainbow layer activation, descent, and results withheld until the last cell finishes. Capture the expected failure before implementation.
- [x] Implement rainbow cell highlights, 3D rise/tilt and soft shadow, smooth return and afterglow, using an overlapping diagonal envelope lasting about 2.4 seconds overall. Keep the wave inside responsive layouts without masking clipped controls.
- [x] Update existing celebration timing tests to follow the new lifecycle; retain every existing assertion. Add small-screen, reduced-motion, dynamic preference, Escape, menu/new-game cancellation and refresh checks as needed.
- [x] Run `npm run typecheck`, `npm test`, `npm run build:h5`, then `PLAYWRIGHT_MODULE=/workspace/sudokutaro-tools/playwright.cjs npm run test:browser`. Do not start dev:h5 concurrently because it clears dist.
- [x] Capture actual early/center/late wave screenshots outside the checkout for visual review. Inspect a rendered frame for readable digits, rainbow coloring and credible depth.
- [x] Self-review and commit only the task's files. Report commands, failures/fixes and artifact paths. Independent reviewer must approve spec compliance and code quality.

## Task 2: Prepare release documentation and version

**Files:** `README.md`, `CONTEXT.md`, `docs/RESPONSIVE_DESIGN.md`, `package.json`, `package-lock.json`, and release notes under `docs/releases/`.

**Interfaces:** consume Task 1's final timing and behavior; proposed version `1.2.0` for this additive visual feature, unless remote tags establish a conflict.

- [x] Describe the actual wave, timing, fallback and tested scope in README; replace the obsolete 1.1-second description and keep historical claims distinguishable.
- [x] Update context and responsive verification guidance with current behavior and add release notes including the earlier Cursor cleanup.
- [x] Bump version consistently in package.json and package-lock.json without updating dependencies. Validate matching root versions, `git diff --check`, and unchanged dependency graph.
- [ ] Commit and obtain task-scoped review. Include verified screenshots in repository docs only if they are useful, small and do not overwrite pre-existing user files.

## Task 3: Review, integrate, deploy and release

**Files:** release record and PR/release body artifacts; no unreviewed product changes.

- [ ] Run production validation for both root and `GITHUB_PAGES=true` builds, pairing each build with its matching browser path (`PAGES_BUILD=true` for Pages). Save exit codes and current-run results.
- [ ] Create the PR against main with concrete behavior, test evidence, compatibility limits and release plan. Dispatch a fresh whole-branch professional code reviewer, fix important findings, rerun affected checks and re-review fixes.
- [ ] Verify remote CI and required checks, confirm PR base/head and no unresolved blocking findings, then merge using the normal PR path. Never force-push main or bypass protections.
- [ ] Track the main-commit GitHub Pages workflow to success and functionally verify the deployed app. Do not equate a successful build with deployment.
- [ ] Finalize README/release status using verified links and results; do not claim unpublished behavior is live. If another docs PR is needed, use normal checks/review/merge.
- [ ] Create an annotated `v1.2.0` tag at the verified merged commit and publish a GitHub Release with tested behavior, limitations and deployment link. Verify remote tag/release metadata.
- [ ] Report actual completed stages and exact external blockers; leave blocked stages pending with ready-to-run artifacts rather than claiming completion.

## Execution record

- Baseline: main commit `95fd483`, Node.js 24.19.0, 9/9 logic tests pass. Existing onboarding verified the root production browser suite using system Chromium with normal Playwright launch parameters.
- Cursor cleanup committed separately as `977a548`.
- Initial access check: GitHub HTTPS Git read worked, while GitHub API CONNECT was blocked by network policy (HTTP 403); required domains were saved to the environment configuration draft. This was a historical observation, not the current access status.
- 2026-10-20 recheck: GitHub API access works; Pages is enabled and v1.2.0 is available. Task 1 commit `068a6d1` passed independent spec/code review. Root and Pages local production browser suites passed; external delivery stages remain pending.
- Task 2 documentation/version preparation is complete; task-scoped independent review remains pending.
