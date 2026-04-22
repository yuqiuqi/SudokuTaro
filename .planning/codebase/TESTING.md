# 测试（TESTING）

**映射日期：** 2026-04-22

## 自动化测试

- **当前仓库未发现** 以 `*.test.ts`、`*.spec.ts`、`__tests__` 等命名的测试文件或 Jest/Vitest 配置。
- **引擎与工具函数**（如 `src/utils/sudokuEngine.ts`、`gameEconomy.ts`）目前依赖 **手动试玩** 与多端真机/模拟器验证。

## 手动与端到端验证（文档与脚本暗示）

| 范围 | 方式 |
|------|------|
| H5 | `npm run dev:h5`，浏览器访问（常见 `localhost:10086`） |
| 微信小程序 | `npm run dev:weapp` / `build:weapp`，微信开发者工具 |
| 抖音小程序 | `npm run dev:tt` / `build:tt`，抖音开发者工具 |
| 微信小游戏 | 开发者工具导入 `minigame-wechat/`；改 TS 后 `npm run build:minigame` |
| 上传流水线 | `npm run upload:weapp`、`upload:tt`、`preview:*`（需 `.env.upload`） |

## 静态分析

- **TypeScript**：`tsc` 通过 `tsconfig.json` 检查主工程；小游戏通过 `minigame-wechat/tsconfig.json`。
- **ESLint**：`eslint-config-taro` 已列入依赖；具体 `npm run lint` 是否在 `package.json` 中定义需以仓库脚本为准（当前 `package.json` **无** `lint` 脚本字段）。

## 覆盖率与 CI

- **未见** 覆盖率报告配置（如 Istanbul/c8）或 GitHub Actions / 其他 CI 工作流文件在本次映射的文件列表中。
- **小程序 CI** 指 **构建后上传**（`@tarojs/plugin-mini-ci`），非单元测试流水线。

## 建议（非现状，仅供规划参考）

- 可为 `sudokuEngine` 纯函数补充 **Vitest/Jest** 用例（生成唯一解、冲突检测、边界难度）。
- 可为 `gameEconomy` 的 clamp/合并逻辑做 **mock `Taro.getStorageSync`** 的轻量测试。

## 与本次映射的关系

- 本文件描述 **截至 2026-04-22** 的测试现状；若后续加入 `npm test` 或 CI，请更新 `TESTING.md` 与 `STACK.md` 中的脚本表。
