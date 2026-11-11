# 方寸数独旧院重设计实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付具备新架构、暖瓷旧院视觉、有限深入叙事与分级反馈的2.0候选PR，留用户最终审核。
**Architecture:** 保留纯数独规则及原生DOM交互，以React18+Vite取代仅H5的Taro包装；拆分存档、会话、演出和故事状态。庭院/正文独立呈现，棋盘保持尺寸稳定。
**Tech Stack:** React18、TypeScript、Sass、Vite、SVG、Node test、Playwright。
**Spec:** `docs/superpowers/specs/2026-11-11-courtyard-redesign-design.md`

## Global Constraints

- 禁止合并、push main、部署、打标签、发布Release；最终用户审核是硬闸门。
- 旧key、旧存档、`#/pages/index/index`、根和Pages base、原生81格/题面只读、难度九键/笔记撤销/免费提示/中英教程/浪潮→缝隙/再赏契约保留。
- 14px最小留白、5/4键盘、反馈不缩放/晃动、完整可达；故事正文可内部滚动，游戏页面不滚动。
- 8篇首篇免费，首次新胜局每次至多1篇；旧wins不补发，再赏/刷新无奖励；不新增体力、签到、广告门槛。
- 所有动态图形尊重reduced及hidden；资产原创SVG/CSS、真实文字与来源清单。
- 单一控制者运行build/browser，不与dev服务或另一套浏览器并发；只使用正确base的最新构建。

## Review Focus

1. 旧完成存档、刷新和迟到animationend不能重复记胜/发章；有效旧档不得被新schema淘汰。
2. 存储禁用、坏JSON、非法故事IDs时能玩，正文翻页不写游戏盘面。
3. 280×320/320×480与240px横屏、英文长文、viewport400下所有操作可达；正文滚动不滚动游戏。
4. 全新材质仍分清给定数/输入/候选/冲突/禁用，键盘焦点可见；新故事屏完整焦点循环与恢复。
5. 减少动态/hidden即时停环境及一次反馈，取消演出/换课/关故事不留计时器。

### Task 1: 基线、技能来源与设计复核

**Files:** 本规格/计划；外部`redesign-work/`报告/安装manifest/基线产物。
- [x] 官方路径安装78项并固定上游SHA，核对所有文件一致；四角色独立评估并交叉讨论。
- [x] 用户选择旧院题材；重跑基线typecheck、34逻辑和生产构建，保留产物。
- [x] 新鲜builder审阅规格/接口，处理遗漏并记录团队决策，保留用户最终审核门。

### Task 2: Web工具链与可测试存档边界

**Files:** `package*.json`、`index.html`、`vite.config.ts`、`src/main.tsx`、`src/app.tsx/.scss`、`src/platform/storage.ts`、`src/utils/devDiagnostics.ts`、`tsconfig.json`、旧Taro配置/历史经济模块、`.github/workflows/`。
**Interfaces:** 规格storage导出，script仍为`build:h5/dev:h5/typecheck/test/test:browser`，`GITHUB_PAGES=true`保持子路径。
- [x] 先为旧档恢复/history清空、坏存档、存储失败、records过滤、稳定sessionId写行为测试并观察RED（新模块缺失先用外部真实场景证明缺口）。
- [x] 用最小React入口替换Taro，清理未使用Taro/hls/babel/webpack依赖与活跃配置；历史经济模块若保留需去Taro存储，不能残留必须安装Taro的import。
- [x] 实现防御性存档仓库及ID边界；保持所有旧数据语义，确认GREEN/类型/构建。
- [x] Pages PR验证增加匹配浏览器回归；禁止改main发布闸门或自动部署候选。

### Task 3: 旧院故事与可视场景

**Files:** `src/features/courtyard/{story.ts,chapters.ts,CourtyardStory.tsx,CourtyardStory.scss,CourtyardScene.tsx}`、故事单元/浏览器测试、`docs/art/`。
**Interfaces:** 规格CourtyardProgress及4个纯函数；CourtyardStory props完全按规格；全套8章中英与8物件派生场景。
- [x] 先测试免费第一章、首次新session解锁、重复/再赏不解锁、上限/已读/非法或锁章/损坏/关闭重开，观察RED。
- [x] 实现纯状态、全文内容、八阶段SVG与可重读正文。内部滚动的读区与固定关闭/语言/翻页，所有交互原生可访问。
- [x] 实现有限物件显现和至多两处低幅环境动态；reduced/hidden时静止，不用网页时间触发剧情。
- [x] 核验中文版每章120–220字，英文完整对应，第一卷结束明确；记录原创资产来源。

### Task 4: 会话、演出与新美术整合

**Files:** `src/pages/index/index.tsx`、`src/features/game/`、既有SCSS/token/图标/胜利结果。
**Interfaces:** 存档仓库为唯一持久化边界；首次胜局事件调用`advanceCourtyard`一次；演出hook只管wave/seams/cancel；story渲染在既有dialog内。
- [x] 提取会话/胜利职责和展示组件，保留全部原回归；品牌入口进入庭院，结果可主动读新章，纯数独模式可关故事提示。
- [x] 收敛暖瓷墨绿token，重做棋盘/工具/键帽/菜单/图标层次；不破坏既有几何预算。
- [x] 给实际落笔和首次完成单元添加分级局部反馈，动画归零后无残留，不读答案来判断“正确”。
- [x] 新增故事/旧hash/存储失败/两种动效偏好等真实浏览器用例；不删旧断言绕过问题。

Task2–4的勾选表示对应实现与回归用例已落地，不表示最新源码已通过完整根／Pages浏览器验收。此前1176例外框几何通过未包含新加入的文字字形边界标准；280×320英文教程标题发现行框与实际字形不符，增强textFits诊断及完整复验仍进行中。普通胜局动画优先级缺陷已有真实GREEN验证。最终完整证据仍由Task5收口。

### Task 5: 验证、独立review与待用户审核PR

**Files:** 测试、README中英、CONTEXT当前、适配/架构/故事/资产说明、实际截图/短视频。
- [x] 含后续动态世界增量的冻结源完成typecheck→60逻辑→root build/full browser→Pages build/full browser。
- [x] 同机器同场景测基线/候选JS字节与gzip、加载及输入代理数据；报告测量范围与未证实真机表现。
- [x] 实际查看13张生产图，录10.92秒连续操作/故事/动态反馈；明确披露测试fixture来源。
- [ ] 新鲜独立代码/视觉review具体提交，解决阻断问题；更新双语文档、链接与证据。
- [ ] 推feature PR，等待准确head远端根/Pages检查；公开review和最终用户审核待办。**停在待审PR，不合并/部署/打tag/release。**

实施组织裁定：用户已委托团队推进，仅最终合并前审核；采用单一产品源码writer，根代理负责测试、证据、文档与整合，避免并发修改主页面。Task2–4形成同一源码轮次，提交前按AGENTS完成整轮验证，不为中间抽取重复制造未验证提交。
