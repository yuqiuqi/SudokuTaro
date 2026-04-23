# Architecture

**Analysis Date:** 2026-04-23

## Pattern Overview

**Overall:** Multi-target delivery with one primary Taro React mini-app plus a separate WeChat **minigame** subtree that reimplements the same product logic behind a Canvas runtime.

**Key Characteristics:**
- **Taro 4 + React 18** for H5, WeChat mini program, and Douyin (Toutiao) mini program from a single `src/` tree; build output under `dist/`.
- **Pure domain modules** in `src/utils/sudokuEngine.ts` and `src/utils/gameEconomy.ts` separate algorithm and persistence from UI; the main page **colocates** presentation and a large local state machine in one file.
- **`minigame-wechat/`** is a second entry (`minigame-wechat/src/main.ts`) that imports parallel copies of engine and economy under the minigame tree, with storage bridged to `wx` instead of `Taro`.

## Layers

**App shell (Taro):**
- Purpose: Mount React, run lifecycle hooks, global styles.
- Location: `src/app.tsx`, `src/app.scss`, `src/app.config.js`
- Contains: `App` component wrapping `children`, `useLaunch` diagnostic hook
- Depends on: `@tarojs/taro`, `./utils/devDiagnostics`
- Used by: Taro runtime for all targets

**Page / feature UI:**
- Purpose: Entire sudoku experience (grid, modals, difficulty, props, input).
- Location: `src/pages/index/index.tsx`, `src/pages/index/index.scss`
- Contains: `IndexPage` default export, `SudokuGrid` / `StatsRow` memoized subcomponents, local hooks (`useState`, `useRef`, `useEffect`, `useCallback`)
- Depends on: `../../utils/sudokuEngine`, `../../utils/gameEconomy`, `../../utils/devDiagnostics`, `../../utils/theme`, `@tarojs/components`, `Taro` APIs
- Used by: Routing (`pages: ['pages/index/index']` in `src/app.config.js`)

**Domain logic (shared concept, two physical copies for minigame):**
- Purpose: Board generation, validation, conflict detection; economy (props, settings, daily bonus) and `Taro.getStorageSync` / `Taro.setStorageSync`.
- Location (Taro): `src/utils/sudokuEngine.ts`, `src/utils/gameEconomy.ts`
- Location (minigame mirror): `minigame-wechat/src/sudokuEngine.ts`, `minigame-wechat/src/gameEconomy.ts` — same `STORAGE_KEY` in economy so saves align when both run as WeChat family apps.
- Contains: Types like `Difficulty`, `GameEconomyState`; functions `generateSolution`, `digHoles`, `loadEconomy`, `tryConsumeUndoProp`, etc.
- Depends on: `Taro` only in Taro `gameEconomy`; `wx` in minigame `gameEconomy`
- Used by: `src/pages/index/index.tsx` and `minigame-wechat/src/main.ts`

**Cross-cutting UI tokens & diagnostics:**
- Purpose: Color/motion contract (`appleUi`, `figma`); H5-only boot logging.
- Location: `src/utils/theme.ts`, `src/utils/devDiagnostics.ts`
- Used by: Theme imports in page SCSS/TS; diagnostics from `src/app.tsx` and index page

**Build & CI config (not runtime app logic):**
- Purpose: Taro/Webpack, design width, `plugin-mini-ci` credentials from env.
- Location: `config/index.ts` (exported as `defineConfig` default), `project.config.json` (WeChat tools: `miniprogramRoot: "dist/"`), `tsconfig.json`, `minigame-wechat/tsconfig.json`, `minigame-wechat/game.json`

## Data Flow

**Game session state (Taro `IndexPage`):**

1. On mount, `useEffect` calls `newGame('easy')` and logs diagnostics; on unmount clears interval timers.
2. `newGame` applies daily economy bonus (`applyDailyBonus` → `saveEconomy`), picks difficulty, runs `generateSolution` → `digHoles` → sets `solution`, `board`, `initialBoard`, resets `history`, `seconds`, `steps`, `conflictCells`, starts timer.
3. User selects cell → `selectCell` updates `selected` / `highlightNum` and may flush pending conflict revert.
4. User enters digit (`fillNumber` or H5 `keydown` / hidden `Input`) → clones grid, appends to `history`, checks `hasConflict` / `collectConflictIndices`; on conflict, schedules revert via `setTimeout` refs; on complete match, `boardsEqual` vs `solution` → win modal, timer stop.
5. Undo/erase call `tryConsumeUndoProp` / `tryConsumeEraseProp`, mutate `economy`, `saveEconomy`, then update board/history.
6. `boardRef`, `historyRef`, `economyRef` mirror latest values for callbacks that must read current state without stale closures (timers, `flushPendingConflict`).

**Persistence:**
- `GameEconomyState` round-trips through `Taro` storage in `src/utils/gameEconomy.ts` (`STORAGE_KEY`).
- Minigame uses the same key via `wx.getStorageSync` / `wx.setStorageSync` in `minigame-wechat/src/gameEconomy.ts`.

**State management paradigm:** No Redux/Zustand; single page owns all React state. Minigame uses imperative `GameState` and layout caches in `minigame-wechat/src/main.ts` (see `minigame-wechat/src/types.d.ts` types imported there).

## Key Abstractions

**Sudoku engine:**
- Purpose: Deterministic puzzle operations independent of React.
- Examples: `src/utils/sudokuEngine.ts` — `Difficulty`, `getHoleCount`, `generateSolution`, `digHoles`, `hasConflict`, `collectConflictIndices`, `boardsEqual`
- Pattern: Pure functions on `number[][]` grids

**Economy + settings:**
- Purpose: Prop counts, daily grant, boolean `vibration` setting.
- Examples: `src/utils/gameEconomy.ts` — `loadEconomy`, `saveEconomy`, `mergeSettings`, `tryConsumeUndoProp`, `tryConsumeEraseProp`
- Pattern: Load on state init, `setEconomy` + `saveEconomy` after mutations

**Presentational subcomponents (Taro only):**
- `SudokuGrid` / `StatsRow` in `src/pages/index/index.tsx` — props-in, events-out; no storage access

**Minigame runtime:**
- Purpose: Canvas rendering, hit-testing, animation; duplicates UX narrative aligned with `index.scss` (comment in `minigame-wechat/src/main.ts`).
- Examples: `minigame-wechat/src/main.ts`, `minigame-wechat/src/types.d.ts`, `minigame-wechat/src/wx.d.ts`

## Entry Points

**Taro application:**
- Location: `src/app.tsx` — default export `App` wrapping route children; `useLaunch` → `logRuntimeDiagnostics('app.useLaunch')`
- Triggers: Platform bootstrap (H5 / weapp / tt)
- Responsibilities: Global SCSS, one-time launch logging

**Route config:**
- Location: `src/app.config.js` — `pages: ['pages/index/index']` only
- Triggers: Taro page loader
- Responsibilities: Declare single home page

**WeChat miniprogram (tools):**
- Location: `project.config.json` — `compileType`, `miniprogramRoot: "dist/"`
- Triggers: WeChat DevTools import of build artifacts

**WeChat minigame:**
- Location: `minigame-wechat/game.json` + `minigame-wechat/src/main.ts` (built via `npm run build:minigame` → `tsc -p minigame-wechat/tsconfig.json`)
- Triggers: WeChat game host loads compiled JS
- Responsibilities: Canvas game loop, input, storage via `wx`

## Error Handling

**Strategy:** Best-effort storage (`try`/`catch` in `loadEconomy` / `saveEconomy`); user feedback via `Taro.showToast` for invalid undo/erase; conflict cells revert with timer; vibrate API wrapped in `try`/`catch` with H5 `navigator` fallback in `vibrateLight` inside `src/pages/index/index.tsx`.

**Patterns:**
- Silent ignore on storage failure in `gameEconomy`
- Defensive `getEnv` in `logRuntimeDiagnostics`

## Cross-Cutting Concerns

**Logging:** `src/utils/devDiagnostics.ts` — `window`-only, merges optional `__SUDOKU_BOOT__` for H5
**Validation:** In-engine checks (`isValid`, `hasConflict`); no separate schema layer
**Authentication:** Not applicable; no user accounts in repo

---

*Architecture analysis: 2026-04-23*
