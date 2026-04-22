# 风险与关注点（CONCERNS）

**映射日期：** 2026-04-22

## 双轨代码同步

- **`src/utils/sudokuEngine.ts`** 与 **`minigame-wechat/src/sudokuEngine.ts`**（以及 **`gameEconomy`** 双份）需 **人工保持行为一致**。遗漏同步会导致小程序/H5 与小游戏 **规则或存档不一致**。
- **缓解**：修改引擎或经济逻辑时，按 `CONTEXT.md`  checklist 同时改两处并执行 `npm run build:minigame`。

## 无自动化测试

- **无单元/集成测试**（见 `TESTING.md`）。回归依赖手动与多端验证，重构 `sudokuEngine` 或状态机时 **回归成本较高**。

## 类型与严格性

- **`noImplicitAny: false`** 允许隐式 any，长期可能掩盖跨端 API 误用；新代码建议显式标注公共 API。

## 安全与密钥

- **`.env.upload`**、**`key/` 下私钥** 不应提交；`.gitignore` 已覆盖常见敏感文件（以仓库实际规则为准）。
- **文档与映射**：生成 `.planning/codebase/*.md` 时避免粘贴真实 AppID/密钥/Token（本次映射仅描述环境变量名与路径约定）。

## 平台差异与碎片化

- **震动、存储、键盘**：H5 与小程序/小游戏 API 不同，代码中已有分支与 try/catch；新功能需逐端验证。
- **Taro 与小游戏**：二者 **独立发布与调试**，问题定位时要先确认复现端。

## 性能（已知已优化方向）

- Taro 页已通过 **`React.memo`** 与冲突 **`Set`** 减轻渲染压力；小游戏侧 `CONTEXT.md` 提到避免每帧重置 canvas 宽度、缓存渐变等 — 后续改动 Canvas 主循环时仍需注意帧率。

## 依赖与构建

- **Taro/Webpack/Babel 链** 版本锁定在 4.0.9 周边；大版本升级需完整回归三端 + 小游戏。
- **`prebundle: false`**：以当前配置为准，影响启动与依赖预打包行为，升级 CLI 时需重测 dev 体验。

## 许可证约束

- **CC BY-NC-ND 4.0**：非商业、禁止演绎等限制可能影响 fork 与二次分发策略（见 `LICENSE`）；协作时需让贡献者知悉。

## 维护时优先查阅

- 玩法与经济变更：`CONTEXT.md`、`README.md`
- Taro 构建与上传：`config/index.ts`、`package.json` 脚本
- 小游戏编译与入口：`minigame-wechat/game.js`、`npm run build:minigame`
