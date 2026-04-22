# 代码约定（CONVENTIONS）

**映射日期：** 2026-04-22

## TypeScript 与类型

- **`tsconfig.json`**：`strictNullChecks: true`；`noUnusedLocals` / `noUnusedParameters: true`；`noImplicitAny: false`（允许部分隐式 any）。
- **导出类型**：广泛使用 `export type` / `export interface`（如 `Difficulty`、`GameEconomyState`、`SudokuGridProps`）。
- **小游戏**：`minigame-wechat/src/wx.d.ts`、`types.d.ts` 补充全局与平台类型。

## React（Taro 页）

- **函数组件** + Hooks（`useState`、`useEffect`、`useCallback`、`useRef`、`useMemo` 等，见 `src/pages/index/index.tsx`）。
- **性能**：对棋盘等纯展示块使用 **`React.memo`**（`SudokuGrid`、`StatsRow`），避免父组件高频状态（计时器）触发无意义子树更新。
- **Props 类型**：组件入参使用显式 `type`（如 `SudokuGridProps`）。

## 样式

- **Sass**：页面级 `index.scss`、`app.scss`；设计稿 **750**，样式中常见 **`rpx`**（Taro 转换）。
- **BEM 风格类名**：如 `stats__t`、`grid` 下子元素（见 `index.tsx` 与对应 scss）。

## 模块与导入

- 路径别名 **`@/`** 指向 `src/`（用于 `utils` 等）。
- 配置与页面配置优先 **`*.config.js`**，避免在 Node 读配置时执行依赖 `window` 的代码（`CONTEXT.md` 明确说明）。

## 错误处理与健壮性

- **存储**：`gameEconomy.ts` 中 `loadEconomy` / `saveEconomy` 使用 **try/catch**，失败回退默认状态或静默忽略写入错误。
- **震动**：`vibrateLight` 对 `Taro.vibrateShort` 与 `navigator.vibrate` 做 try/catch 与能力检测。
- **诊断**：`devDiagnostics.ts` 在 `window` 不存在时直接返回，避免小程序/非 H5 报错。

## 数独与状态局部工具

- **格索引**：`cellIndex(r, c) => r * 9 + c`，与 `Set` 冲突集合一致。
- **网格拷贝**：`cloneGrid` 做浅行拷贝，避免直接突变共享引用（见 `index.tsx`）。

## Lint

- **ESLint**：`eslint` + `eslint-config-taro`（`package.json` devDependencies）；无单独 `eslint.config` 在 glob 中列出时以 Taro 默认约定为准。

## 注释语言

- 关键常量与行为多为 **中文注释**（如 `gameEconomy.ts` 的存档版本、`config/index.ts` 的 mini-ci 说明），与 `README.md` / `CONTEXT.md` 一致。

## 提交与协作

- 避免将 `key/` 私钥、`.env.upload` 真实内容写入文档或示例。
- 修改引擎后若影响小游戏，务必同步 `minigame-wechat/src/sudokuEngine.ts` 并重新执行 `npm run build:minigame`。
