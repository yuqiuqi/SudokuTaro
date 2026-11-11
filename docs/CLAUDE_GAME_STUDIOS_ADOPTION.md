# Claude Code Game Studios 研究与采用记录

2026-11-11，用户要求理解新参考、查缺补漏，继续完善动态世界与持久游戏体验。本项目研究了 [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios/tree/abc0de79d6ceb0b5d7aa693945849b3937afbe6a)，固定提交 **`abc0de79d6ceb0b5d7aa693945849b3937afbe6a`**。以下为自行撰写的来源摘要与适配决定，没有导入上游程序或模板正文；“研究采用”不代表安装了新的包、hooks或完整工作室框架。

## 来源与许可

该上游采用 [MIT](https://github.com/Donchitos/Claude-Code-Game-Studios/blob/abc0de79d6ceb0b5d7aa693945849b3937afbe6a/LICENSE)，版权为 Copyright (c) 2026 Donchitos。若后续复制其代码、提示词、模板或其他实质部分，应保留完整版权和许可通知，并标明来源与固定版本；不要把第三方MIT内容改称项目独占作品。本次只以自己的文字总结原则，没有把上游脚本或模板复制到仓库。

这与此前安装的 `gamedev-skills/awesome-gamedev-agent-skills` 是两个独立来源。后者固定提交为 `dcf3bbbb83f365632402c086bf595048aa24aaa8`，Apache-2.0，本云环境安装了77项技能及router；详见[技能记录](GAMEDEV_SKILLS.md)及其lock。原有安装不意味着Claude工作室已安装，也不意味着其他机器已有任何一套技能。项目自有作品许可仍见[LICENSE](../LICENSE)。

## 实际阅读索引

以下路径相对上述固定版本。阅读包括完整文件和与本项目有关的定向章节，不代表逐个执行了对应skill或验证了全部框架行为。

| 上游路径 | 阅读目的 |
|---|---|
| `README.md`、`LICENSE`、`project.yaml` | 项目定位、许可、轻量与完整流程的区别、配置含义 |
| `.claude/docs/setup-requirements.md`、`config-resolution.md`、`automation-modes.md`、`workflow-modes.md`、`workflow-catalog.yaml` | 安装前提、宿主相关配置、授权模式与必需产物分别如何作用 |
| `docs/WORKFLOW-GUIDE.md` | 新建项目与已有项目的不同入口，阶段检查的适用范围 |
| `.claude/skills/adopt/SKILL.md`及`references/1-detect.md`、`2-format-audit.md`、`3-classify.md`、`4-migration-plan.md`、`6-write.md` | 先查已有产物能否实际支撑工作，再按影响排序；不重生成已有文档 |
| `.claude/scripts/compat-inventory.sh`（只读源码） | 识别Claude专有工具、变量、预处理、指令加载、hook与权限机制 |
| `.claude/skills/map-systems/SKILL.md`、`design-system/references/lens-systems-designer.md` | 系统依赖、状态归属、数值边界、重复事件、反馈循环与调参来源 |
| `.claude/skills/team-narrative/SKILL.md` | 先读已有角色与世界设定，维持叙事、美术、世界规则和本地化一致 |
| `.claude/skills/qa-plan/SKILL.md`、`regression-suite/SKILL.md` | 按规则／整合／视觉／界面分类证据，对照实际验收行为查覆盖 |
| `.claude/docs/run-and-observe.md`、`.claude/skills/test-evidence-review/SKILL.md`、`.claude/docs/templates/test-evidence.md` | 真实运行、查看并保留图像、绑定源码版本；未评估不能写成通过 |
| `.claude/skills/soak-test/SKILL.md` | 区分短期功能检查、自动状态压力验证与真人长期疲劳／内容耗尽观察 |

## 在本项目采用的原则

保留已有 React18/Vite/DOM 数独与兼容合同，围绕用户体验的缺口增量设计。先明确玩家做什么、世界怎样回应、什么保存、再次进入能遇见什么，再决定数据和界面；有限八章故事与持续世界状态分别表达，不能把循环灯光当作长期玩法已经完成。

每个事实有一个归属：棋局、首次胜局、故事解锁、世界状态、演出与存档各自有边界。纯状态转换明确输入、结果、上限、重复、取消与旧档行为，动画结束和打开页面不产生奖励事实。对持久化保留浏览器现实限制，不承诺跨key事务或多标签一致性。

审核以可玩结果和实际证据为依据。逻辑测试、真实交互、程序几何、查看截图、连续视频及真人试玩分别说明；截图关联版本与初始状态，空范围或未执行写明未评估。新范围不能借用旧候选结果宣称通过。长期体验需要单独观察，自动浏览器不能证明真人疲劳、真实设备帧率或留存改善。

组织按实际工作缩小，只在需要的边界分工并独立审阅；保留单一产品writer和构建／浏览器控制者。已有规格、架构、测试与文档继续使用现有路径，不为了模板格式生成大量无消费者文件。具体增量见[动态世界规格](superpowers/specs/2026-11-11-courtyard-living-world-design.md)和[实施计划](superpowers/plans/2026-11-11-courtyard-living-world.md)，尚需完成实现及新一轮验证。

## 未导入的Claude机制

没有运行上游scripts/hooks，没有安装Claude Code或其依赖，没有覆盖本仓库AGENTS／CLAUDE，没有复制全部49个agent组织。Claude的`!`命令预处理、`CLAUDE_*`变量、`$ARGUMENTS`、frontmatter权限与模型声明、`settings.json`事件及`Agent/TaskCreate`等工具不能直接视为Codex有效配置。需要的动作由本会话实际工具完成，不把配置文件存在当作机制已生效。

上游Web样例的单文件构建和截图脚本也不替代本项目根路径／Pages配对生产构建及Playwright回归。引擎技能、默认命令和零分配循环要求不能机械套到当前DOM游戏。

## 自主工作与最终审核

用户已授权团队继续研究、查缺补漏和实施，沿同一feature分支推进。上游默认逐文件询问的协作流程不是本次新授权限制；例行实现与文档不需要再次逐项确认。上游自动提交等做法也不会自动成为本仓库操作授权。

最终合并前用户审核仍是硬闸门：先完成可试玩结果、验证与可审阅证据，再等待用户明确批准。不得以AI审阅、绿色CI或参考框架替代批准；本轮不合并、不推main、不部署、不打标签、不发布。当前新的世界增量范围尚未完整验证，最终媒体、比较数据与候选交付记录需待实际结果。
