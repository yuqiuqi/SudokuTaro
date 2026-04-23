# Technology Stack

**Analysis Date:** 2026-04-23

## Languages

**Primary:**
- **TypeScript** — Application and build config: `src/**/*.tsx`, `src/**/*.ts`, `config/index.ts`, `minigame-wechat/src/**/*.ts`.
- **JavaScript** — Taro app routing config `src/app.config.js`, Babel entry `babel.config.js`, compiled minigame output under `minigame-wechat/js/*.js` (generated from `tsc`).

**Secondary:**
- **SCSS/Sass** — Styling per `package.json` `templateInfo.css: "Sass"`; example `src/app.scss`, `src/pages/index/index.scss`.

## Runtime

**Environment:**
- **Node.js** — Required for `@tarojs/cli`, webpack 5, and TypeScript compilation (exact version not pinned in-repo; use an LTS aligned with Taro 4).

**Package Manager:**
- **npm** — Lockfile present: `package-lock.json` (no `pnpm-lock.yaml` / `yarn.lock`).

**Registry:**
- `registry=https://registry.npmjs.org/` in `.npmrc` (comment notes prior mirror issues with `@swc` and `hls.js`).

## Frameworks

**Core:**
- **Taro 4.0.9** — Cross-end React framework; packages pinned in `package.json` (`@tarojs/taro`, `@tarojs/components`, `@tarojs/react`, platform plugins `weapp` / `tt` / `h5`).
- **React 18.3.x** — UI layer (`react`, `react-dom`).

**Build / compiler:**
- **Webpack 5.91.0** — Declared in `devDependencies`; Taro wires it via `@tarojs/webpack5-runner`. Central switch: `config/index.ts` → `compiler: { type: 'webpack5', prebundle: { enable: false } }`.

**Transpilation:**
- **Babel 7.x** — `babel.config.js` uses preset `babel-preset-taro` with `{ framework: 'react', ts: true }`.

## Key Dependencies

**Critical (runtime):**
- `@tarojs/*` **4.0.9** — Runtime, components, React bridge, per-target adapters.
- `react` / `react-dom` **^18.3.1** — UI.
- `hls.js` **1.6.15** — Listed in `dependencies`; no `import` from `hls.js` under `src/` at audit time (likely reserved for H5 media or pulled indirectly; still part of install surface).

**Build & DX:**
- `@tarojs/cli` **4.0.9** — `taro build`, `defineConfig`.
- `@tarojs/plugin-mini-ci` **^4.1.11** — CI upload integration (configured in `config/index.ts`).
- `dotenv-cli` **^7.4.2** — Loads `.env.upload` for upload/preview scripts in `package.json`.
- `typescript` **^5.4.5** — `tsconfig.json` and `minigame-wechat/tsconfig.json`.
- `sass` **^1.75.0** — Stylesheet preprocessing.
- `postcss` **^8.5.6** — Used by Taro pipeline; **no** root-level `postcss.config.*` — PostCSS behavior is configured inside Taro config (see below).
- `tsconfig-paths-webpack-plugin` **^4.1.0** — Path resolution companion for webpack (Taro stack).

**Linting (installed, minimal project wiring):**
- `eslint` **^8.57.0** and `eslint-config-taro` **4.0.9** are in `devDependencies`; **no** committed `.eslintrc*` or `eslint.config.*` — invoke ESLint only after adding a project config or CLI defaults.

## Configuration Entry Points

| Concern | File | Role |
|--------|------|------|
| Taro project | `config/index.ts` | `defineConfig`: `sourceRoot` `src`, `outputRoot` `dist`, plugins, webpack5, `mini.postcss.pxtransform`, H5 `devServer` |
| TypeScript (main) | `tsconfig.json` | `paths`: `@/*` → `./src/*`; includes `src`, `config`, `types` |
| TypeScript (minigame) | `minigame-wechat/tsconfig.json` | `rootDir` `src`, `outDir` `js`, `strict` |
| Babel | `babel.config.js` | `babel-preset-taro` |
| App routes | `src/app.config.js` | `pages: ['pages/index/index']` |
| Browserslist | `package.json` `browserslist` | H5/target baseline |
| WeChat minigame IDE | `minigame-wechat/project.config.json` | `compileType: "game"`, tooling flags |
| Game manifest | `minigame-wechat/game.json` | Orientation / status bar |
| npm registry | `.npmrc` | Official npm registry |

**PostCSS (practical):** Mini-program build enables px transform via `config/index.ts`:

```ts
mini: {
  postcss: {
    pxtransform: { enable: true, config: {} },
  },
},
```

## Build Scripts (`package.json`)

| Script | Command | Purpose |
|--------|---------|---------|
| `build:weapp` | `taro build --type weapp` | WeChat mini program production build → `dist` |
| `build:tt` | `taro build --type tt` | Douyin (ByteDance) mini program |
| `build:h5` | `taro build --type h5` | Web H5 |
| `dev:*` | same as build + `--watch` | Watch mode for each target |
| `build:minigame` | `tsc -p minigame-wechat/tsconfig.json` | Compiles `minigame-wechat/src` → `minigame-wechat/js` |
| `upload:weapp` / `upload:tt` | `dotenv -e .env.upload -- taro build ... --upload` | CI upload (env file present locally only) |
| `preview:*` | `dotenv -e .env.upload -- taro build ... --preview` | Preview builds |

## Platform Requirements

**Development:**
- Node + npm; WeChat / Douyin devtools for respective mini programs; WeChat DevTools for `minigame-wechat` (opens `minigame-wechat/` as game project).

**Production:**
- Builds are static bundles under `dist/` (Taro targets) plus compiled JS under `minigame-wechat/js/`; hosting is platform-specific (WeChat/ByteDance review, or static H5 server).

---

*Stack analysis: 2026-04-23*
