# Codebase Concerns

**Analysis Date:** 2026-04-23

## Tech Debt

**Duplicated game logic (Taro vs 微信小游戏):**
- Issue: `sudokuEngine` 与 `gameEconomy` 在 `src/utils/` 与 `minigame-wechat/src/` 各有一份实现；`sudokuEngine` 已出现实现细节分叉（类型、`shuffleInPlace`、循环写法等），仅靠注释要求「修改时请同步两处」，无共享包或自动化校验。
- Files: `src/utils/sudokuEngine.ts`, `minigame-wechat/src/sudokuEngine.ts`, `src/utils/gameEconomy.ts`, `minigame-wechat/src/gameEconomy.ts`
- Impact: 修 bug 或改规则时极易只改一端，导致小程序端与小游戏端行为不一致。
- Fix approach: 抽成 `packages/core` 或构建时从单源复制并加 CI `diff` 门禁；至少增加对两文件关键函数的对比测试或共享 golden fixtures。

**主界面单文件体量过大:**
- Issue: Taro 主页面与微信小游戏入口将 UI、交互、布局、状态揉在同一模块，审阅与回归成本高。
- Files: `src/pages/index/index.tsx`, `minigame-wechat/src/main.ts`
- Impact: 小改动易引入回归；难以单测局部逻辑。
- Fix approach: 按「棋盘 / 计时 / 经济 / 弹窗 / 布局」拆模块；小游戏侧将纯绘制与状态机分离。

**挂载 effect 关闭 exhaustive-deps:**
- Issue: `useEffect` 仅在 mount 时 `newGame('easy')`，使用 `eslint-disable-next-line react-hooks/exhaustive-deps` 固定依赖数组。
- Files: `src/pages/index/index.tsx`
- Impact: 若未来向该 effect 增加依赖 `newGame` 的闭包逻辑，容易静默使用陈旧函数引用。
- Fix approach: 用 `useRef` 保存最新 `newGame` 或在 effect 内显式列出稳定依赖并重构 `stopTimer`/`newGame` 的初始化顺序。

## Known Bugs

**谜题生成未保证唯一解:**
- Issue: `digHoles` 随机挖空至目标洞数，未验证剩余盘面是否仍唯一可解；与严格数独出版物规则可能不符。
- Files: `src/utils/sudokuEngine.ts`, `minigame-wechat/src/sudokuEngine.ts`
- Symptoms: 极少数局面可能存在多解，影响「逻辑解」体验或难度预期。
- Trigger: 高难度、随机性叠加时出现概率性非唯一解盘面。
- Workaround: 无；若需保证唯一解，需在挖空后附加唯一性判定或回溯生成。

**存档解析路径不一致（Taro vs 小游戏）:**
- Issue: Taro 端 `loadEconomy` 接受 `string`（JSON）或对象；小游戏端仅按 `object` 解析，字符串存档会落回 `defaultState()`。
- Files: `src/utils/gameEconomy.ts`, `minigame-wechat/src/gameEconomy.ts`
- Trigger: 若同一 `STORAGE_KEY` 下曾写入字符串形态数据，在小游戏端读档可能与 Taro 端不一致。
- Workaround: 小游戏端对齐 Taro 的 `typeof raw === 'string' ? JSON.parse` 分支。

## Security Considerations

**CI 上传凭据经环境变量注入:**
- Risk: `TT_PASSWORD`、微信私钥路径等若泄露可导致账号或上传通道被滥用。
- Files: `config/index.ts`, `package.json`（`dotenv -e .env.upload`）, `.env.upload.example`（示例文件存在；真实 `.env.upload` 不应入库）
- Current mitigation: 凭据仅通过本地/CI 环境变量加载，配置层不硬编码密钥。
- Recommendations: 确认 `.env.upload` 在 `.gitignore` 中；CI 使用密钥管理服务；避免在日志中打印 `process.env`；文档中强调私钥文件权限。

**H5 诊断日志可能带出 URL 敏感片段:**
- Risk: `logRuntimeDiagnostics` 打印完整 `href`、`search`、`hash`；若用户通过带 token 的链接打开 H5，控制台可能暴露查询参数。
- Files: `src/utils/devDiagnostics.ts`
- Current mitigation: 仅在 `typeof window !== 'undefined'` 时执行，小程序无 `window` 则跳过。
- Recommendations: 生产构建用 `NODE_ENV === 'production'` 短路或脱敏 `search`/`hash`；避免引导用户复制含敏感 query 的整行 JSON。

## Performance Bottlenecks

**回溯求解在弱设备上的尾部延迟:**
- Problem: `solveSudoku` 使用随机打乱数字的回溯；最坏情况下在真机小程序上可能造成可感知卡顿（新局生成时）。
- Files: `src/utils/sudokuEngine.ts`, `minigame-wechat/src/sudokuEngine.ts`
- Cause: 算法非约束传播优化；随机性导致搜索树深度波动。
- Improvement path: 换用确定性填数策略、缓存模板库，或 Web Worker（H5）/ 分帧生成（小程序）。

**Webpack prebundle 关闭:**
- Problem: `compiler.prebundle.enable: false` 可能拉长冷启动与首次编译时间。
- Files: `config/index.ts`
- Cause: 显式配置关闭 Taro 预打包。
- Improvement path: 评估 Taro 版本与依赖后尝试开启并验证构建稳定性。

**小游戏主循环与全屏重绘:**
- Problem: `minigame-wechat/src/main.ts` 内大量绘制与布局计算集中在单文件；`setInterval` 驱动计时与 `requestAnimationFrame` 调度并存。
- Files: `minigame-wechat/src/main.ts`
- Cause: Canvas 游戏常见模式；文件过大时难以证明每帧工作量上界。
- Improvement path: 脏矩形/仅状态变更时重绘；抽离布局缓存单测。

## Fragile Areas

**平台分支与 API 可用性:**
- Files: `src/pages/index/index.tsx`（`Taro.vibrateShort`、`process.env.TARO_ENV !== 'h5'` 下 `document` 键盘监听）, `src/utils/devDiagnostics.ts`
- Why fragile: 各小程序对 `navigator.vibrate`、`document`、事件捕获行为不一致；依赖 `try/catch` 与可选链兜底。
- Safe modification: 改交互前在 `weapp`、`tt`、`h5` 三端手动验证；避免移除 `try/catch` 包裹。
- Test coverage: 无自动化 E2E（见下文）。

**依赖版本错配:**
- Files: `package.json`（`@tarojs/*` 多为 `4.0.9`，`@tarojs/plugin-mini-ci` 为 `^4.1.11`）
- Why fragile: 小版本不一致可能带来上传/CLI 边缘行为差异。
- Safe modification: 升级时对齐官方推荐的一组版本号并跑一次 `build:weapp` / `build:tt` / `build:h5`。

## Scaling Limits

**本地存储无服务端同步:**
- Current capacity: 单设备 `Taro.setStorageSync` / `wx.setStorageSync`，键 `yifang_sudoku_economy_v1`。
- Limit: 无跨端云存档、无防篡改；道具经济仅限本地信任模型。
- Scaling path: 若产品需要账号体系，需新增后端与校验；届时应 bump storage schema 并迁移。

## Dependencies at Risk

**Taro 4.0.x 与插件生态:**
- Risk: 框架大版本升级时 webpack5、各 `plugin-platform-*` 需同步升级。
- Impact: 构建失败或运行时 API 行为变化。
- Migration plan: 跟随 Taro 官方升级指南；先在分支验证三端构建。

## Missing Critical Features

**自动化测试缺失:**
- Problem: 仓库内无 `*.test.*` / `*.spec.*`；数独引擎与经济逻辑无回归保护。
- Blocks: 重构双端共享逻辑时无法快速证明等价性。
- Priority: 高 — 至少为 `sudokuEngine` 与 `gameEconomy` 添加单元测试。

## Test Coverage Gaps

**核心纯函数未覆盖:**
- What's not tested: `generateSolution`、`digHoles`、`hasConflict`、`collectConflictIndices`、`boardsEqual`、经济 `applyDailyBonus` / `tryConsume*`。
- Files: `src/utils/sudokuEngine.ts`, `src/utils/gameEconomy.ts`
- Risk: 规则变更或同步小游戏副本时引入静默错误。
- Priority: 高

**多端 UI / Canvas 无 E2E:**
- What's not tested: 微信/抖音小程序与 H5 的点击填数、撤销、弹窗、键盘路径。
- Files: `src/pages/index/index.tsx`, `minigame-wechat/src/main.ts`
- Risk: 平台升级后交互回归依赖人工。
- Priority: 中

---

*Concerns audit: 2026-04-23*
