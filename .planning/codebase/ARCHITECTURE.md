# 架构（ARCHITECTURE）

**映射日期：** 2026-04-22

## 总体形态

仓库包含 **两条并行产品线**，共享数独规则与经济约定，但 **构建与运行时分离**：

1. **Taro 应用**（`src/` + `config/`）：一套 React 代码编译为 **H5**、**微信小程序**、**抖音小程序**。
2. **微信小游戏**（`minigame-wechat/`）：**原生小游戏** + **Canvas**；TypeScript 编译为 `js/`，**不能**由 Taro 直接产出。

> 导入微信开发者工具时：Taro 工程用仓库根；小游戏必须选 `minigame-wechat` 目录（见 `README.md`）。

## Taro 应用：分层与数据流

### 入口与生命周期

- **`src/app.tsx`**：根组件；`useLaunch` 时调用 `logRuntimeDiagnostics('app.useLaunch')`（`src/utils/devDiagnostics.ts`）。
- **`src/app.config.js`**：页面路由等（JS，避免配置阶段访问 `window`）。

### 表现层

- **主页面**：`src/pages/index/index.tsx` — 数独棋盘 UI、难度选择、计时/步数、道具（撤销/擦除）、设置（震动）、H5 键盘/隐藏输入等。
- **子组件模式**：`StatsRow`、`SudokuGrid` 等使用 **`React.memo`**，减少计时器 tick 导致的整盘重绘（`README.md` / `CONTEXT.md` 所述性能策略）。

### 领域逻辑（纯 TS，可跨端复用概念）

- **`src/utils/sudokuEngine.ts`**：难度与挖空、`generateSolution` / `digHoles`、冲突检测、`collectConflictIndices`、`boardsEqual` 等。
- **`src/utils/gameEconomy.ts`**：道具数量、每日赠送、`GameSettings`（震动）、`loadEconomy` / `saveEconomy` / `tryConsume*` 等。

### 数据流（概要）

1. 页面加载时 `loadEconomy()` → 本地状态 + `useEffect` 中 `saveEconomy` 持久化。
2. 新局：`generateSolution`、`digHoles` 等更新 `board` / `initialBoard`。
3. 用户填数：冲突时用 `Set`（格索引 `row * 9 + col`）高亮，延时回退（见页面实现）。
4. 道具：操作前 `tryConsumeUndoProp` / `tryConsumeEraseProp`，失败则提示。

## 微信小游戏架构

- **入口**：`minigame-wechat/game.js` → `require('./js/main.js')`（由 `src/main.ts` 编译）。
- **引擎**：`minigame-wechat/src/sudokuEngine.ts` — 与 `src/utils/sudokuEngine.ts` **逻辑对齐、需人工同步维护**（`CONTEXT.md` 强调）。
- **经济**：`minigame-wechat/src/gameEconomy.ts` — 使用 `wx` API，**`STORAGE_KEY` 与 Taro 端一致**。
- **渲染**：Canvas 绘制与触摸在 `main.ts`（及编译产物 `js/main.js`），布局用 `rp(W,n)` 等与 750 设计稿对齐。

## 横切关注点

- **诊断**：`devDiagnostics.ts`（Taro/H5）；小游戏可有独立日志策略。
- **主题**：`src/utils/theme.ts`（Taro 侧样式变量/主题相关，与页面 SCSS 配合）。
- **配置与 CI**：`config/index.ts` 集中 Taro + mini-ci；`readFileSync` 读取 `package.json` 合并 CI 版本信息。

## 设计决策（来自文档与代码）

- **配置用 JS**：`app.config.js`、`index.config.js` 避免 Node 执行配置时引用浏览器全局。
- **小游戏不引用 Taro**：小游戏目录内仅 `wx` + 自研 TS，避免错误 API。
