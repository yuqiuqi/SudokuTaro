# Testing Patterns

**Analysis Date:** 2026-04-23

## Test Framework

**Runner:**
- **Not configured.** `package.json` has no `test` script, no Jest, Vitest, Mocha, or Playwright devDependencies.
- No `*.test.*` or `*.spec.*` files under the repository (search covers `src/`, `minigame-wechat/`, and root).

**Assertion Library:** Not applicable.

**Run Commands:**
```bash
# No project test command — use typecheck/build as smoke checks instead:
npx tsc --noEmit -p tsconfig.json
npm run build:h5
npm run build:weapp
npm run build:tt
npm run build:minigame   # compiles minigame-wechat/src → minigame-wechat/js/
```

## Test File Organization

**Location:** Not applicable (no test suite).

**Naming:** When adding tests, a common choice would be co-located `*.test.ts` next to `src/utils/*.ts` or under `__tests__/` — **not** established in this repo.

**Structure:** N/A

## Test Structure

**Suite Organization:** N/A

**Patterns:** N/A

## Mocking

**Framework:** N/A

**What to Mock (future guidance for Taro):** Taro runtime (`@tarojs/taro` storage, `showToast`, `vibrateShort`) and `window` in H5-only code paths in `src/utils/devDiagnostics.ts` and keyboard handlers in `src/pages/index/index.tsx`.

## Fixtures and Factories

**Test Data:** N/A. Production code builds grids via `generateSolution` / `digHoles` in `src/utils/sudokuEngine.ts` — a natural source for future unit test fixtures.

**Location:** N/A

## Coverage

**Requirements:** None enforced; no `coverage` script or CI gate.

**View Coverage:** N/A

## Test Types

**Unit Tests:** Not present. High-value first targets: `src/utils/sudokuEngine.ts` (conflict detection, `boardsEqual`, hole counts), `src/utils/gameEconomy.ts` (daily bonus, clamp, consume props).

**Integration Tests:** Not present.

**E2E Tests:** Not used. Multi-target behavior (H5 vs weapp vs tt) would require simulators or BrowserStack-style tooling — out of scope today.

## Manual Verification (from `README.md` and `CONTEXT.md`)

**H5 (primary dev loop per docs):**
- `npm run dev:h5` — open the URL shown in the terminal (commonly `http://localhost:10086/` per `README.md` and `CONTEXT.md`).
- Verify: difficulty switch, new game, number input, conflict highlight + auto-revert, win modal, settings (vibration), undo/erase economy and toasts, keyboard (H5) per `README.md` feature list.

**WeChat mini program:**
- `npm run dev:weapp` — import project in WeChat DevTools using the Taro output / project root as documented for the template.

**Douyin (Toutiao) mini program:**
- `npm run dev:tt` — import in the corresponding devtools.

**WeChat mini game (separate subproject):**
- After `npm run build:minigame`, open **`minigame-wechat/`** as the mini **game** project (not the Taro app root) — `README.md` and `CONTEXT.md` emphasize this path distinction.
- Validate Canvas gameplay, `wx` storage economy alignment with `src/utils/gameEconomy.ts` / `STORAGE_KEY` contract in `CONTEXT.md`.

**CI upload (smoke, not automated tests):**
- `README.md` documents `upload:weapp` / `upload:tt` with `.env.upload` — use only when validating release pipelines, not as unit tests.

## Common Patterns

**Async Testing:** N/A

**Error Testing:** N/A

## Coverage Gaps (risk-oriented)

- **`src/utils/sudokuEngine.ts`:** Core game correctness; regressions affect all platforms.
- **`src/utils/gameEconomy.ts`:** Storage edge cases and date boundaries for daily bonus.
- **`src/pages/index/index.tsx`:** Large stateful surface — timer cleanup, conflict timer, H5 `keydown` vs mini program paths; any future refactor should add tests or explicit manual checklist.

- **`minigame-wechat/src/*.ts`:** Duplicated/parallel logic to Taro; risk of drift from `src/utils/sudokuEngine.ts` without automated diff or shared tests.

---

*Testing analysis: 2026-04-23*
