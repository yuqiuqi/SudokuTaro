# Codebase Structure

**Analysis Date:** 2026-04-23

## Directory Layout

```
SudokuTaro/
├── config/                 # Taro CLI build config (webpack5, CI plugin)
│   └── index.ts
├── minigame-wechat/        # WeChat minigame: Canvas app + parallel engine/economy
│   ├── game.json
│   ├── project.config.json
│   ├── src/
│   │   ├── main.ts         # Entry: canvas, layout, game loop
│   │   ├── gameEconomy.ts
│   │   ├── sudokuEngine.ts
│   │   ├── types.d.ts
│   │   └── wx.d.ts
│   └── tsconfig.json
├── src/                    # Taro sourceRoot (see config/index.ts)
│   ├── app.config.js       # pages route list
│   ├── app.tsx
│   ├── app.scss
│   ├── pages/
│   │   └── index/
│   │       ├── index.tsx
│   │       └── index.scss
│   └── utils/
│       ├── devDiagnostics.ts
│       ├── gameEconomy.ts
│       ├── sudokuEngine.ts
│       └── theme.ts
├── dist/                   # Taro build output (not hand-edited; gitignore typically)
├── package.json
├── project.config.json     # 根目录 WeChat 小程序工具项目配置，miniprogramRoot → dist/
└── tsconfig.json
```

## Directory Purposes

**`config/`:**
- Purpose: Taro `defineConfig` — `sourceRoot: 'src'`, `outputRoot: 'dist'`, plugins, `mini.postcss`, H5 `devServer`
- Contains: `config/index.ts`
- Key files: `config/index.ts` — `miniCiOptions()` for `@tarojs/plugin-mini-ci` (env-driven WeChat/TT upload)

**`src/`:**
- Purpose: All Taro React pages and shared utilities for H5 / weapp / tt
- Contains: `app.*`, `pages/**`, `utils/**`
- Key files: `src/app.tsx`, `src/app.config.js`, `src/pages/index/index.tsx`

**`src/pages/`:**
- Purpose: Taro file-based pages; one route = one folder with `index.tsx` + `index.scss`
- Contains: `index` only
- Key files: `src/pages/index/index.tsx` — product UI and in-component game state

**`src/utils/`:**
- Purpose: Reusable non-UI modules (engine, storage-backed economy, design tokens, diagnostics)
- Contains: `*.ts` helpers
- Key files: `src/utils/sudokuEngine.ts`, `src/utils/gameEconomy.ts`, `src/utils/theme.ts`, `src/utils/devDiagnostics.ts`

**`minigame-wechat/`:**
- Purpose: Standalone WeChat **小游戏** project using Canvas API; **not** part of the Taro compile graph
- Contains: `main.ts` entry, typed `wx` shims, copies of `sudokuEngine` and `gameEconomy` adapted to `wx` storage
- Key files: `minigame-wechat/src/main.ts`, `minigame-wechat/game.json`, `minigame-wechat/tsconfig.json`
- Build: `package.json` script `build:minigame` → `tsc -p minigame-wechat/tsconfig.json`

**Root `project.config.json`:**
- Purpose: WeChat DevTools project metadata; `miniprogramRoot` targets Taro output `dist/`
- Not to confuse with `minigame-wechat/project.config.json` (minigame subproject)

## Key File Locations

**Entry Points:**
- `src/app.tsx` — Taro app root
- `src/app.config.js` — page list
- `config/index.ts` — bundler and platform config
- `minigame-wechat/src/main.ts` — minigame entry

**Configuration:**
- `config/index.ts` — Taro
- `tsconfig.json` — TypeScript (Taro app)
- `minigame-wechat/tsconfig.json` — minigame
- `project.config.json` — WeChat mini program IDE
- `.env.upload` / `.env.upload.example` — existence only for CI secrets (do not commit secrets)

**Core Logic:**
- `src/utils/sudokuEngine.ts` — rules and generation
- `src/utils/gameEconomy.ts` — props and settings (Taro storage)
- `minigame-wechat/src/sudokuEngine.ts`, `minigame-wechat/src/gameEconomy.ts` — parallel implementations for minigame

**Styling:**
- `src/app.scss` — global
- `src/pages/index/index.scss` — page scope

**Testing:**
- No `*.test.*` or `*.spec.*` in repo; test layout not yet established

## Naming Conventions

**Files:**
- Taro pages: `src/pages/<name>/index.tsx`, `index.scss` (Taro convention)
- Utilities: `camelCase.ts` under `src/utils/`
- Config at repo root: `project.config.json` (WeChat), `tsconfig.json`

**Directories:**
- `pages/` — route segments; single segment `index` for home
- `utils/` — shared logic only

**Code:**
- React components: `PascalCase` for components (`SudokuGrid`, `IndexPage`)
- Hooks and handlers: `camelCase` (`newGame`, `fillNumber`)
- Types: `PascalCase` (`CellSel`, `GameEconomyState`, `Difficulty`)

## Where to Add New Code

**New Taro page:**
- Add folder `src/pages/<route>/` with `index.tsx` and optional `index.scss`
- Register in `src/app.config.js` `pages` array (order = default first page)

**New game feature (e.g. hint system):**
- Pure logic: extend or add modules under `src/utils/`; mirror changes in `minigame-wechat/src/` if minigame must stay in sync
- UI: `src/pages/index/index.tsx` or split into new components under `src/pages/index/` (e.g. `components/HintBar.tsx` — create folder only if you introduce multiple files)

**New shared constant / theme:**
- `src/utils/theme.ts` or co-locate SCSS variables in `src/pages/index/index.scss` per existing UI-SPEC workflow

**Minigame-only behavior:**
- `minigame-wechat/src/main.ts` and `minigame-wechat/src/types.d.ts`

**Build or CI changes:**
- `config/index.ts` for Taro; `package.json` scripts; never embed secrets in committed files

## Special Directories

**`dist/`:**
- Purpose: Taro compiler output for weapp/tt/h5
- Generated: Yes (by `taro build` / `dev:*`)
- Committed: Typically no (check `.gitignore`)

**`.planning/`:**
- Purpose: GSD / planning artifacts including this `codebase/` documentation
- Generated: By workflow
- Committed: Per project policy

---

*Structure analysis: 2026-04-23*
