# Dependency Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve every direct npm dependency to an updated, supported version or a documented upstream constraint, and ship the verified update through PR, independent review, main, Pages, README, tag and Release.

**Architecture:** Preserve the Taro H5 application, UI, gameplay and storage schema. Upgrade tooling in separate commits on one feature branch, then review and release the complete verified tree. Do not replace Taro or bypass peer constraints to make the outdated list empty.

**Tech Stack:** Taro 4.3.0, React 18, Webpack 5, TypeScript, Sass, Playwright/Chromium; Node 22 in CI.

**Spec:** User instruction on 2026-10-19: unattended upgrades; tests → PR → professional review → merge → deploy → README → tag/Release. Repository AGENTS.md governs the browser matrix.

## Global Constraints

- Only yuqiuqi/SudokuTaro; target main; retain v1.0.0 and existing branches/tags.
- User explicitly authorizes unattended planning, implementation, PR, merge, deployment and release; no intermediate approval prompts.
- Every direct dependency receives a disposition; unsupported majors remain explicitly blocked, never described as upgraded.
- No --force/--legacy-peer-deps or broad overrides; all Taro packages use 4.3.0 together.
- Current registry metadata: @tarojs/react and plugin-framework-react require React ^18; webpack5-runner requires Webpack 5.91.0 and Babel ^7; babel-preset-taro requires react-refresh ^0.14.0; eslint-config-taro requires ESLint ^8.
- npm ci, typecheck, all logic tests and full browser matrix must pass before commit/PR. Test root and GitHub Pages subpath builds separately.
- Preserve all existing 81-cell, number 1–9, hints, corner, notes, undo, dialog, victory, storage, reduced-motion and folded viewport regressions.
- README must describe verified versions and limitations before the final tag. Release v1.1.0 only from the successfully deployed merge commit.

## Review Focus

- Clean installation on Node 22 must not rely on preexisting node_modules or local caches.
- Taro peers and optional peers must not silently introduce unsupported React/Babel/Webpack combinations.
- Fresh H5 assets and the Pages /SudokuTaro/ subpath must load without runtime errors.
- Existing saved progress and victory state must survive framework upgrades without duplicate records.
- Small portrait, 240px landscape, visualViewport compression and language changes must preserve all controls.

### Task 1: Baseline and dependency dispositions

**Files:** package.json, package-lock.json (read); docs/DEPENDENCY_UPGRADE.md (create).
**Interfaces:** Consumes current npm metadata; produces exact target versions and reasons for retained/removed packages.

- [x] Read AGENTS.md, CONTEXT.md, workflows, Babel/Taro/TS configuration and direct dependency tree.
- [x] Run npm test; expected 9 passes, no failures.
- [ ] Resolve latest metadata, peers, engines and deprecated dependencies; record supported targets.
- [ ] Verify work is on chore/dependency-upgrade-20261019, with no unrelated changes.

### Task 2: Update compatible framework and tools

**Files:** Modify package.json, package-lock.json and only required configuration; tests/browser.cjs or tests/*.test.cjs only for actual regressions.
**Interfaces:** Consumes Task 1 targets; produces a clean-installable dependency tree and unchanged game behavior.

- [ ] Upgrade Taro packages together; Babel 7 patches, PostCSS, Sass, Playwright, Node 22 types and compatible refresh plugin. Evaluate latest TypeScript against real compiler/API use.
- [ ] Remove unused direct class-properties proposal plugin; retain hls.js only if Taro H5 requires it, updated to stable.
- [ ] Run npm ci without peer bypasses; npm ls must not report invalid direct peers.
- [ ] For any failure: load systematic-debugging, reproduce it, fix the smallest root cause and keep relevant regression coverage. Dependency/config changes use actual installation/build/type checks rather than artificial tests asserting package strings.
- [ ] Run npm run typecheck, npm test, npm run build:h5, npm run test:browser; expected exit 0, 9 logic tests and runtimeErrors [].
- [ ] Run GITHUB_PAGES=true npm run build:h5, PAGES_BUILD=true npm run test:browser; expected exit 0 and runtimeErrors []. Capture final screenshots if rendering changed.
- [ ] Commit verified dependency changes.

### Task 3: Documentation, PR and independent review

**Files:** README.md, CONTEXT.md, docs/DEPENDENCY_UPGRADE.md, package.json/version lock metadata.
**Interfaces:** Consumes verified tree; produces reviewable PR and exact release notes.

- [ ] Set application version 1.1.0; update README versions, Node requirements, upgrade results and unresolved upstream constraints. Keep accurate gameplay screenshots.
- [ ] Verify final tree and create PR against main with test evidence and limitations.
- [ ] Use requesting-code-review: dispatch a fresh reviewer with base/head SHAs, this plan, AGENTS.md and test logs. Resolve critical/important findings; do not merge a failing PR.
- [ ] Confirm GitHub CI and Pages preview build success on final PR head; merge without force push.

### Task 4: Deploy, document and release

**Files:** Existing Pages/CI workflows; README already included in the released tree.
**Interfaces:** Consumes reviewed merge SHA; produces successful production deploy and v1.1.0 tag/Release at that exact SHA.

- [ ] Check main CI and Pages deployment conclusions; fix failures through PR if needed.
- [ ] Verify published page assets and an actual browser interaction; README links/images must resolve at release ref.
- [ ] Create v1.1.0 tag and stable Release containing targets, tests, retained constraints and live URL.
- [ ] Verify tag commit equals deployed merge SHA and Release is published, not draft/prerelease. Report actual outcomes and blockers honestly.

## Execution decisions and evidence

- User's explicit unattended authorization overrides skill check-in menus; no request for redundant plan/worktree/merge approval.
- Work in the dedicated session checkout on a feature branch; main remains the deployment target. No extra worktree or duplicate install tree is needed for dependency-only maintenance.
- Baseline: npm test passed 9/9 on 2026-10-19 (log /tmp/sudoku-upgrade-baseline.log).
