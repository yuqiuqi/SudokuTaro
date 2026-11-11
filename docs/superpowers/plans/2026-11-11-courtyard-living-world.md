# 旧院动态世界增量实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在当前候选中完成可保存、自主选择的庭院氛围与旧物互动，以及主线后十二笺生活闭环。
**Architecture:** 纯 world/life 命令、聚合 courtyard hook、单一 storage 边界、拆分小型 UI 和同一 SVG；继续单一产品 writer，root 独占测试和浏览器。
**Tech Stack:** 现有 React18 / Vite8 / TypeScript7 / Sass / SVG / Node test / Playwright，无新依赖。
**Spec:** `docs/superpowers/specs/2026-11-11-courtyard-living-world-design.md`

## Global Constraints

- 旧数据/八章/纯数独/免费提示/虹浪→缝光/几何与全部旧回归保留；仍是2.0.0候选。
- world 为 day/dusk/rain、ambient/still、一个已修物件偏爱；life最多12项，同胜先查两域再路由，最后主章不同时获生活笺。
- 生活笺ID `courtyard-life-01..12`，主线后每真正新胜一张，无真实日历/经济/签到/自动音频。
- 动态最多两组、hidden/reduced/still停止，关闭/返回不补播；同一SVG、无rAF/粒子定时器。
- JS警告244kB不提高；无新外部资源。源冻结后根与Pages完整验证。
- 本轮只推待审feature PR，用户最终审核前不得合并/main push/部署/tag/release。

## Review Focus

1. 第7个主线获章ID在新状态重放，不能钻入生活域；测试跨域重放与到12后不增长。
2. 世界设置/观察/偏爱/读笺只改各自域，不能标主章已读或记胜；浏览器比较独立快照。
3. 锁物件或损坏新key不能拖垮旧八章/棋盘；纯函数和存储例外用注入仓库验证。
4. 紧屏reader新增按钮仍能真实点击和键盘滚动，末篇禁用控件不漏焦点；全内容双语操作检查。
5. static、reduced、hidden、目录→正文与快速重入都停止环境/暂态反馈，且不吞奖励；检查实际动画与重复开关节点。

### Task 1：设计来源、合同与现有阻断

- [x] 团队读取固定上游，比较三方案，记录本增量合同；保留最终用户闸门。
- [x] Pages header真实失败取证：入场平移导致约0.000002px相邻边界差；逐帧RED复现，等待真实appear结束后60轮GREEN，严格断言与容差保留。
- [x] 新鲜builder检查合同，落实收据IO迁移/跨域去重/失败OR/氛围预算；READY后已发solewriter任务。

### Task 2：纯世界/生活状态与兼容仓库

**Files:** 新 `src/features/courtyard/world.ts`、`life.ts`、`lifeNotes.ts`、`objects.ts`；扩 `src/platform/storage.ts`；root新 `tests/courtyard-world.test.cjs`。
**Interfaces:** 规格的 World/Life/CompletionState 及全部纯函数；storage新增 `loadCourtyardWorld`/`persistCourtyardWorld`、`loadCourtyardLife`/`persistCourtyardLife`，注入StorageLike语义同旧仓库。lifeNotes字段与旧chapters同形，scene映射六组。
- [x] root写12个默认/非法/幂等/主线边界/跨域ID/12上限/只读白名单/旧key不变测试，实际观察模块缺失RED。
- [x] solewriter实现上述纯函数与仓库；人物内容writer外部起草，由solewriter整合，完整双语。
- [x] root验证60项逻辑与类型GREEN；独立检查schema/跨域去重未发现未解决问题。

### Task 3：聚合权威状态与可玩的世界闭环

**Files:** 新 `useCourtyardState.ts`、世界/生活小组件与样式；改 `CourtyardStory.tsx/.scss`、`CourtyardScene.tsx`、`pages/index/index.tsx`，必要时VictoryResult接线。
**Interfaces:** hook拥有progress/life/world、唯一complete命令、阅读/模式/氛围/静止/偏爱命令和saveFailed；Story接收快照与事件函数，不直接IO或奖励；Scene只接派生展示props。
- [x] 保留真实浏览器三氛围0!=3缺口RED，已向writer定义世界/日常data attributes。
- [x] 移出页面原主线state/persist到聚合hook，胜局effect只发一次complete，原record/演出逻辑不变。
- [x] 加三氛围、静止、已修物件观察/偏爱及十二笺目录/全文；控制在reader内，旧主章测试属性语义不变。
- [x] 六组两层生活细节随count变化，新receipt只演最新600ms一次，环境预算/hidden/reduced/静止全部实现。
- [x] root专项验证真实点击、完整内容、快照隔离、刷新、跨域胜局、Encore、动态停止与焦点；WORLD_ONLY通过，最终完整双base仍待验。

### Task 4：证据、审查与候选PR

**Files:** root browser测试扩展；README双语、CONTEXT、适配/架构/来源/资产与候选审核入口；真实截图与MP4。
- [x] 源冻结，typecheck/60逻辑/root build/full browser/Pages build/full browser通过；不混base、不移旧断言。
- [x] 三氛围与后期细节13张真实截图/10.92秒连续视频、30次打开关闭/前后台检查；记录自动压力与真人soak区别。
- [x] 同机基线/候选JS/CSS raw+gzip和加载/两帧代理完成，注明非真机/非留存。
- [ ] 独立代码、视觉及叙事检查，关闭重要发现；记录新上游MIT来源/实际采用范围，不宣称运行其专有hooks。
- [ ] 整理提交，推feature PR，公开准确head独立AI review并等远端root/Pages检查，停在用户最终审核。

执行裁定：延续用户自主团队授权；不引入逐文件审批。Task2–3共用接口，由既有solewriter完成同轮源码，root负责全部测试/构建/browser，避免并发写。完成一轮完整验证后再提交；先前候选的部分通过不当作本增量证据。

提交时检查点：本地完整证据及工作树独立代码/视觉/叙事审查已完成；准确提交的远端检查与复核随候选 PR 评论记录。最后两项在计划提交时保持待办，用户最终审核始终未完成。
