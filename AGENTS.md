# 方寸数独开发约定

开始工作前阅读 `CONTEXT.md`；响应式设计与测试说明见 `docs/RESPONSIVE_DESIGN.md`。

## 协作与规划入口

- 使用中文简体；能自行运行的命令先执行，改动克制并匹配现有风格，无明确要求不写大段无关文档。
- 项目规划入口：`.planning/PROJECT.md`、`.planning/STATE.md`；路线与需求见 `.planning/ROADMAP.md`、`.planning/REQUIREMENTS.md`；代码库地图见 `.planning/codebase/`。
- 涉及历史阶段时，按需阅读对应阶段的计划和 UI-SPEC；Phase 1 设计契约位于 `.planning/phases/01-apple-ui-motion/01-UI-SPEC.md`。历史资料与当前实现冲突时，以 `CONTEXT.md` 的当前实现、现有代码及用户最新要求为准。
- 视觉与动效工作先查看相关 UI-SPEC 的 **Motion** 与 **Color**；动效优先使用 `transform` / `opacity`，遵循减少动态效果偏好。

## 每次代码修改后的必做验证

用户要求：每次完成一轮代码修改后，必须进行浏览器模拟测试，再交付、提交或更新 PR。

1. 运行 `npm run typecheck`、`npm test` 和 `npm run build:h5`。
2. 对本轮最新构建运行 `npm run test:browser`（Playwright + Chromium）。首次运行需安装浏览器：`npx playwright install --with-deps chromium`。
3. 覆盖手机小屏、常规竖屏、横屏、宽屏、模拟折叠分区，以及 `visualViewport` 被浏览器工具栏压缩的情况。
4. 故事阅读屏仅允许正文内部纵向滚动，头部、关闭、翻页始终可达；游戏页面仍不可滚动。检查全部 81 格均可见且给定数保留可读信息；仅可编辑格、数字 1～9、工具按钮和弹窗操作按钮可点击且位于实际可视区域；页面不得上下或左右滚动，也不得靠隐藏溢出来掩盖裁切。
5. 检查填数、笔记、撤销、冲突反馈、分层提示、旋转与刷新后的进度，以及中英文规则、新局、设置、通关弹窗。
6. 对本轮改动涉及的场景补充有针对性的操作验证；修复缺陷时，保留能复现原问题的回归测试。

GitHub Pages 构建使用 `GITHUB_PAGES=true npm run build:h5`，随后以 `PAGES_BUILD=true npm run test:browser` 测试，不能混用根路径和子路径构建。

交付时说明实际执行的测试、结果和未验证范围。测试失败或环境阻塞必须明确报告，不能宣称全部通过；浏览器尺寸/分区模拟不能代替真实 iOS Safari 或折叠设备测试。仅修改文档时检查文档差异即可，无需重跑游戏测试。

## 必须保留的回归场景

以下场景来自 PR #5 审查，现已修复并加入 `tests/browser.cjs`，后续修改必须持续通过：

- 568×240、480×240 下数字 7～9 可见且可以实际点击。
- 568×320 及 240px 高的横屏下，中英文新局、设置、规则、通关弹窗操作均可达。
- 390×720、实际 `visualViewport.height=400` 下规则、设置、新局弹窗操作按钮完整显示。
- 使用过笔记与提示时，通关弹窗的较长英文成就文案完整显示，不挤出按钮。
- 行首/行末方向键应限制在当前行，避免左右移动错误换行。

不得移除这些用例来绕过失败；新增适配缺陷时先复现，再补充回归用例。

## 旧院重设计的最终用户审核闸门

当前 `feat/courtyard-redesign` 为 2.0.0 候选，线上既有版本为 v1.3.0。用户要求团队完成可试玩、可比较、可 review 的候选 PR 后，由用户最终审核。未获得该次明确批准前，禁止合并、推送 main、部署、打标签或发布 Release；绿色 CI、AI review 或包内版本号不能代替用户批准。按需提交／推送 feature 分支和准备待审 PR 在本轮授权内。

当前工具链为 React18 + Vite，旧 Taro/Figma 资料属于历史背景。新架构与保留契约见 `docs/architecture/COURTYARD_V2.md`，技能复现见 `docs/GAMEDEV_SKILLS.md`。保留全部旧回归；补故事双语、正文滚动、焦点循环与恢复、新胜局解锁、旧完成局／刷新／再赏不发章、存储失败与减少动态效果检查。庭院专项需先完成匹配的最新生产构建，再运行 `COURTYARD_ONLY=true npm run test:browser`；Pages 构建后使用 `PAGES_BUILD=true COURTYARD_ONLY=true npm run test:browser` 配对运行。`tests/courtyard.browser.cjs` 是导出的辅助模块，不能直接执行并把无操作退出当作通过证据。
