# Challenge, Lightshow and Tutorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. User already authorized autonomous delegation and full delivery; do not request routine approval again.

**Goal:** 分层数字辅助、修正新局白边、可再赏胜利流光、可操控的新手单元演示。
**Architecture:** 保留既有 Game 与动画事件链；availableDigits 按难度决定输入可用性，原 move 继续判冲突。RulesDemo 独立于真实棋盘，复用全局减少动态偏好 hook，有限计时与明确生命周期。
**Tech Stack:** Taro 4.3 / React 18 / TypeScript / Sass；不新增依赖。
**Spec:** ../specs/2026-10-24-challenge-lightshow-tutorial-design.md

## Global Constraints

- 中文产品名方寸数独；v1.3.0。保留 URLs／storage keys／旧存档，44px 语言项、稳定反馈与完整既有回归。
- 使用现有 /workspace/SudokuTaro 分支 feat/challenge-lightshow-tutorial；一个 source writer、一个 tests writer；只运行一个 build/browser 进程，不运行并发 dev:h5。
- 每轮完整源码后 typecheck、npm test、根构建／完整浏览器及匹配 Pages 构建／完整浏览器；后续仅文档改变只检查差异和链接。
- main／About 的外部权限失败不冒充已解决，不改私有、不绕过身份。

## Review Focus

1. 中高难度无选择／只读／已填笔记／胜局边界，错误候选可增可删可撤销，普通冲突仍不入盘。
2. 再赏多次／双击／刷新／Escape／菜单／新局／偏好切换均不重复记分或出现迟到结果。
3. 演示行列宫的九格位置和缺数正确，自动到终步停止，手动暂停、切页、关闭、隐藏页不留下定时器。
4. 中英文 480×240、568×240、280×320 及 visualViewport=400 的演示、三个胜利动作与 44px 语言项完整可达。
5. 白边去除同时保留焦点环、头部预算、实体棋盘与反馈稳定、可用键和难度存档一致。

## Task 1: Red evidence before implementation

**Files:** tests/gameplay.test.cjs、tests/browser.cjs；外部 workdir /workspace/sudokutaro-tools/challenge-demo-work。
- [x] 在现有逻辑测试增加 medium/hard 九键、手工错误候选／删除／撤销／非法普通输入边界；easy 原用例保留。
- [x] 在旧生产构建用真实浏览器证明中高难度九键／再赏入口／五步演示尚未满足，分别记录功能失败，不把工具缺失当 RED。
- [x] 新局按钮旧白 inset 的实测样式与截图记录；低影响样式不写镜像断言。
- [x] 给 source writer 明确 RED 后开始信号。

## Task 2: Difficulty and celebration

**Files:** src/utils/gameplay.ts、src/pages/index/index.tsx、index.scss、VictoryResult.tsx/.scss、新 useReducedMotion.ts；package/lock 版本。
**Interfaces:** availableDigits(Game,index|null,noteMode=false):number[] 保留导出；VictoryResult 新 onEnjoyLight/canEnjoyLight；两入口 data-victory-encore，中文再赏流光／英文See the glow。
- [x] 边界检查后中高难度返回全部 DIGITS，普通 move 的 hasConflict 判定不变，noteMode 使用同一可用数字规则。
- [x] 新局按钮去白 inset，只保留同色边界／柔和外阴影，不改变原几何。
- [x] 完成态两处新增再赏，复用 celebration 原动画事件，不触碰记分 effect；共享减少动态偏好监听，不重复振动。
- [x] 两处三列动作保持紧凑可达；同步教学难度文案与版本1.3.0。

## Task 3: Five-step tutorial

**Files:** 新 src/pages/index/RulesDemo.tsx/.scss、RulesDiagram.tsx、utils/tutorial.ts、index.tsx/.scss。
**Interfaces:** RulesDiagram({kind,lang,body})；前三类委托 RulesDemo({kind:'row'|'column'|'box',lang,body})。演示外层 .rules-demo/data-demo-step=1..5/data-demo-playing，原 .rules-diagram.rules-grid/data-kind 与81个data-row/data-column保留。步骤按钮 data-demo-step-button，自动控件 data-demo-toggle。
- [x] 先静止第1步；中央9缺失、八已知、定位、选择、填9完成的五步，九格高亮始终对应单元。
- [x] 原生步骤1–5与有限自动1600ms步进；手动选择停止自动，第5步停止，播放末步可从第一步再开始。
- [x] 解说含可访问当前步，最大自然文案保留空间；减少动态或hidden停止，卸载清除定时器。
- [x] 常规纵排，短横屏81px图在左、精简完整正文／解说／控件在右；窄短屏控件跨整行，保留44px语言／全文／七页导航。

## Task 4: Verify and review

- [x] 测试 writer 接入所有新真实交互回归；旧合法筛选回归明确置 easy，中高新增对照，不删除旧样例覆盖。
- [x] 单一控制者运行 typecheck → npm test → root build/full browser → Pages build/full browser；失败先读实测再修，不隐藏内容绕过。
- [x] 采本轮主要手机／短横屏／演示终步／再赏截图与元数据。独立代码／交互／视觉 AI 审阅，不冒充真机或真人。
- [x] README 中英、CONTEXT 当前、适配、v1.3.0发布说明仅填真实验证；旧标签不移动。


证据：最新源码的类型检查、34/34逻辑、根路径与匹配Pages完整浏览器均通过，runtimeErrors为空；800几何诊断0失败。五张最新Pages生产图及本地发布核验器已执行，来源见v1.3.0说明；独立AI源码/视觉审阅见PR记录。

## Task 5: Deliver all seven stages

- [ ] Commit/push/PR，公开独立review及交付进度；等待准确head两项远端检查。
- [ ] 正常expected-head合并，main与审核文件树一致；等同main完整CI和Pages实际Deploy。
- [ ] 保留TLS取得实际发布资源执行功能核验，包含难度分层、再赏仅一次记分、教学五步与生命周期。
- [ ] 核对远端README中英，然后准确main附注v1.3.0、正式LatestRelease、核实后端与旧tags；工作区clean，交付记录完整。
