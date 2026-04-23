# External Integrations

**Analysis Date:** 2026-04-23

## APIs & External Services

**HTTP / REST clients:**
- **Not used in application source** — No matches for `fetch`, `axios`, `Taro.request`, `wx.request`, or `tt.request` under `src/` at audit time. The product is offline-first puzzle gameplay.

**Streaming / media (dependency only):**
- **`hls.js` (npm)** — Declared in `package.json` (`1.6.15`). No direct imports located under `src/`; treat as optional future H5 HLS support or transitive tooling alignment. Install policy documented in `.npmrc` regarding package integrity.

## Platform SDKs & Native APIs

**Taro unified APIs (WeChat / Douyin / H5 where supported):**
- **`Taro.getStorageSync` / `Taro.setStorageSync`** — Persistent local game economy; implementation in `src/utils/gameEconomy.ts`.
- **`Taro.showToast`** — User feedback (e.g. `src/pages/index/index.tsx`).
- **`Taro.vibrateShort`** — Haptic feedback when available (`src/pages/index/index.tsx`).
- **`Taro.getEnv`** — Runtime environment introspection in `src/utils/devDiagnostics.ts`.

**WeChat mini game (`minigame-wechat`):**
- **`wx` global** — Canvas, input, system info, storage, UI primitives; primary implementation `minigame-wechat/src/main.ts` (compiled to `minigame-wechat/js/main.js`).
- **Examples of calls:** `wx.createCanvas`, `wx.getSystemInfoSync`, `wx.onTouchStart` / `onTouchEnd` / `onTouchMove`, `wx.onKeyDown`, `wx.onWindowResize`, `wx.showToast`, `wx.vibrateShort`, `wx.getStorageSync` / `wx.setStorageSync` (see `minigame-wechat/src/gameEconomy.ts`).

Type shims for the minigame host live alongside source, e.g. `minigame-wechat/src/wx.d.ts`.

## Data Storage

**Databases:**
- **None** — No SQL, document store, or remote DB client in the repo.

**Local / device storage:**
- **Mini-program & minigame:** Key-value storage via `Taro` / `wx` sync storage APIs (`STORAGE_KEY` pattern in `src/utils/gameEconomy.ts` and `minigame-wechat/src/gameEconomy.ts`).

**File storage:**
- **Local filesystem (build only)** — `config/index.ts` uses Node `readFileSync` to load root `package.json` for CI metadata (not a user-facing integration).

**Caching:**
- **In-memory only** — Layout/render caches inside game logic (e.g. `minigame-wechat/src/main.ts`); no CDN or Redis.

## Authentication & Identity

**End-user auth:**
- **None** — No OAuth, JWT, or platform login flows in `src/` or minigame sources.

**Developer / CI credentials (upload tooling):**
- Documented in **`.env.upload.example`** (copy to `.env.upload`, gitignored). Variables referenced from `config/index.ts` `miniCiOptions()`:
  - **WeChat mini program CI:** `WECHAT_APPID`, `WECHAT_PRIVATE_KEY_PATH` (miniprogram-ci style private key file path).
  - **Douyin (ByteDance) mini program CI:** `TT_EMAIL`, `TT_PASSWORD`.
  - **Optional overrides:** `CI_VERSION`, `CI_DESC` (else fall back to `package.json` / `taroConfig`).
- **Invocation:** `package.json` scripts `upload:weapp`, `upload:tt`, `upload:mini`, `preview:weapp`, `preview:tt` run `dotenv-cli` with `.env.upload` then `taro build ...`.

Do **not** commit real `.env.upload` values; the example file lists placeholder shapes only.

## Monitoring & Observability

**Error tracking / analytics SDKs:**
- **None detected** — No Sentry, Firebase Analytics, or similar imports in audited paths.

**Logs:**
- **Developer diagnostics** — `src/utils/devDiagnostics.ts` and `src/app.tsx` `useLaunch` hook for lightweight runtime logging; no remote log shipping.

## CI/CD & Deployment

**In-repo CI:**
- **No `.github/workflows`** (or similar) found at audit time — integration with GitHub Actions not defined in this snapshot.

**Deployment surface:**
- **Platform upload** via Taro + `@tarojs/plugin-mini-ci` and local credentials (see above).
- **WeChat minigame** — Open `minigame-wechat/` in WeChat DevTools; `project.config.json` defines game project metadata (app id field present for tooling; rotate/manage per platform policy).

## Webhooks & Callbacks

**Incoming:**
- **None** — No server routes or cloud functions in this repository.

**Outgoing:**
- **None** — No client calls to custom backend URLs in audited `src/` code.

## Summary

| Category | Status |
|----------|--------|
| Third-party HTTP APIs | Not used in app code |
| Cloud / SaaS backends | None |
| Auth providers | None (users) |
| Local platform storage | WeChat / Taro sync storage for game state |
| CI / platform tooling | WeChat + Douyin upload via env-driven mini-ci |

---

*Integration audit: 2026-04-23*
