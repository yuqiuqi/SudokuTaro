# Coding Conventions

**Analysis Date:** 2026-04-23

## Naming Patterns

**Files:**
- Page entry: `index.tsx` under `src/pages/<route>/` (e.g. `src/pages/index/index.tsx`).
- Page styles: `index.scss` co-located with the page; shared SCSS partials use leading underscore (e.g. `src/pages/index/_ui-tokens.scss`).
- Utilities: `camelCase.ts` in `src/utils/` (e.g. `src/utils/gameEconomy.ts`, `src/utils/sudokuEngine.ts`).
- App config uses **`.js`** for Taro global config to avoid Node evaluating browser APIs — see `src/app.config.js`, `src/pages/index/index.config.js` (per `README.md` / `CONTEXT.md`).

**Functions:**
- `camelCase` for functions and hooks (`newGame`, `fillNumber`, `vibrateLight`).
- `PascalCase` for React components and memo-wrapped subcomponents (`StatsRow`, `SudokuGrid`, default export `IndexPage`).

**Variables:**
- `camelCase` for locals; `const` UPPER_SNAKE for module-level constants where used (e.g. difficulty list as `DIFFICULTIES` in `src/pages/index/index.tsx`).
- Ref + state mirror pattern: `boardRef` / `board`, `economyRef` / `economy` to avoid stale closures in callbacks.

**Types:**
- `PascalCase` for types/interfaces (`CellSel`, `SudokuGridProps`, `GameEconomyState` in `src/pages/index/index.tsx` and `src/utils/gameEconomy.ts`).
- Use `type` for unions and simple aliases; `interface` for object shapes where exported from modules.

## Code Style

**Formatting:**
- No Prettier or Biome config committed; style follows hand-formatted TypeScript/React in-tree.
- Indentation and JSX match existing files (2 spaces in `src/pages/index/index.tsx`).

**Linting:**
- `eslint` and `eslint-config-taro` appear in `package.json` devDependencies; **no** committed `.eslintrc*`, `eslint.config.*`, or root `lint` npm script.
- **Use** Taro + React rules if you add an ESLint config; one inline exception exists: `// eslint-disable-next-line react-hooks/exhaustive-deps` on the mount-only `useEffect` in `src/pages/index/index.tsx` (intentional: run `newGame('easy')` once on mount).

**TypeScript (`tsconfig.json`):**
- `strictNullChecks: true`, `noUnusedLocals` / `noUnusedParameters: true`.
- `noImplicitAny: false` — new code should still prefer explicit types on public APIs.

## Import Organization

**Order (observed in `src/app.tsx`, `src/pages/index/index.tsx`):**
1. External packages (`@tarojs/components`, `@tarojs/taro`, `react`).
2. Blank line.
3. Parent/relative imports for project code (`../../utils/...`, `./utils/...`).
4. Blank line.
5. Side-effect style import: `import './index.scss'` last among imports.

**Path Aliases:**
- `tsconfig.json` defines `"@/*": ["./src/*"]`, but current sources use **relative** paths (e.g. `../../utils/sudokuEngine`). Either convention is valid; pick one when adding files for consistency.

## Error Handling

**Patterns:**
- **User feedback:** `Taro.showToast({ title: '...', icon: 'none' })` for business rules (e.g. undo/erase props exhausted) in `src/pages/index/index.tsx`.
- **Storage / parse:** `try` / `catch` with **fallback to defaults** in `src/utils/gameEconomy.ts` (`loadEconomy` → `defaultState()`; `saveEconomy` swallows errors).
- **Platform APIs:** `vibrateLight` wraps `Taro.vibrateShort` in `try` / `catch` with H5 `navigator.vibrate` fallback (`src/pages/index/index.tsx`).
- **Diagnostics:** `src/utils/devDiagnostics.ts` guards `typeof window === 'undefined'`, wraps `Taro.getEnv()` in `try` / `catch`, and ignores `JSON.stringify` failures in `catch` blocks.
- **Config:** `config/index.ts` `loadPackageJson()` returns `{}` on read/parse failure.

**Guidance:** Prefer silent degradation for non-critical persistence; use toast for actionable user-visible errors.

## Logging

**Framework:** `console` only for diagnostics.

**Patterns:**
- Prefix `console.log` with `[SudokuTaro:diag]` via `logRuntimeDiagnostics` in `src/utils/devDiagnostics.ts` (H5 boot debugging). Not used for production logging pipelines.

## Comments

**When to Comment:**
- Section comments in large SCSS (e.g. `src/pages/index/index.scss`) and high-level notes in `src/utils/theme.ts` linking design tokens to `_ui-tokens.scss`.

**JSDoc/TSDoc:**
- Sparse; use for exported utilities that need contract clarity (e.g. `logRuntimeDiagnostics` in `src/utils/devDiagnostics.ts`).

## Function Design

**Size:** Main page component in `src/pages/index/index.tsx` is large; prefer extracting presentational pieces (already done for `StatsRow`, `SudokuGrid`).

**Parameters:** Explicit small objects for component props (`SudokuGridProps`); avoid boolean soup.

**Return Values:** Pure helpers return values; economy APIs return `{ ok, next }` tuples for consume operations (`tryConsumeUndoProp` in `src/utils/gameEconomy.ts`).

## Module Design

**Exports:** Default export for page components (`export default function IndexPage`); named exports for utilities and types from `src/utils/*`.

**Barrel Files:** Not used; import from concrete modules.

## React / Taro Hooks

**Patterns:**
- `useCallback` for event handlers and game actions passed deep or listed in dependency arrays (`newGame`, `fillNumber`, `undo`, `erase`).
- `useRef` for **timer handles** and **latest state mirrors** (`boardRef`, `economyRef`) updated synchronously before async/timer callbacks.
- `useEffect` for: mount bootstrap + cleanup (`stopTimer`, `clearTimeout`); H5-only `document` `keydown` listener with `TARO_ENV` guard; focus choreography for hidden `Input`.
- `memo` on grid and stats rows to limit re-renders when parent timer state updates.

## Styling (SCSS)

**Structure:**
- Global page chrome: `src/app.scss` (Taro `page` selector, base font stack).
- Page scope: `src/pages/index/index.scss` uses `@use 'sass:color'` and `@use './ui-tokens' as *` for variables from `src/pages/index/_ui-tokens.scss`.
- **BEM-like** class names: block `cell`, element `cell__txt`, modifier `cell--thick-r`, `cell--dim` (see `src/pages/index/index.tsx` `className` assembly).

**Tokens:**
- SCSS variables in `src/pages/index/_ui-tokens.scss` mirror `appleUi` in `src/utils/theme.ts` — keep both in sync when changing palette.

## Internationalization (i18n)

**Not used:** UI strings are **inline Simplified Chinese** in JSX and `Taro.showToast` calls (e.g. `src/pages/index/index.tsx`). No `i18n` / locale files or Taro i18n plugin detected.

## CI / Automation (quality-related)

**GitHub Actions:** No `.github/workflows` (or other `.github` content) in this repository — no automated lint/test on push.

**Release / upload:** Documented in `README.md` — `@tarojs/plugin-mini-ci` and `npm run upload:*` with `dotenv-cli` and `.env.upload` (local/CI-agnostic; not a GitHub workflow file).

---

*Convention analysis: 2026-04-23*
