# 旧院动态世界与院中日常：增量设计

这是现有 2.0.0 候选的增量，不是发布批准。用户新要求：理解 Donchitos/Claude-Code-Game-Studios，对现有产品查缺补漏，让动态世界和长期游玩更有意义。用户既定方向为治愈、亲情与重逢，允许团队自主推进，最终合并前仍须用户审核。下列数量与实现路线是团队的设计决定，不伪称用户逐项指定。

## 来源与采用范围

参考固定提交 `abc0de79d6ceb0b5d7aa693945849b3937afbe6a`：README、Web best practices、世界/系统/叙事/UX/技术美术角色，以及 adopt、design-system、create-architecture、team-polish、QA 与 run-and-observe 等相关说明。采用已有项目先审、状态唯一所有者、微观/单局/长期循环、真实运行留证与独立审查。上游为 MIT 的 Claude Code 工作室模板；未运行其脚本或安装 hooks，不覆盖 AGENTS、不伪称 Claude 专有机制在 Codex 自动生效。来源记录与适配清单随候选交付。

## 目标与方案

保留八章结局，让“修好院子”之后有具体可见的生活，并让玩家从首篇起就能表达偏好。所有变化有因果、可回看、可保存；关闭故事通知的人继续正常数独。

比较三条路线：仅加天气/观察最小但很快看完；有限生活笺与渐进物件提供中期目标；自运行经营需要经济、日程与照料压力，超出本项目。选择中间方案：免费可控的三种氛围、旧物观察/偏爱、主线后十二张生活笺及六组两层细节。每胜一笺，避免以隔胜发奖人为拉长内容。

不添加账号、联网日期、签到、体力、物件衰退、经济/广告解锁、音频、自动 NPC 日程或无限剧情。继续使用 React18/Vite、原生 DOM/CSS/SVG，不迁移游戏引擎。

## 第一次、第十次与结局后

- 首篇免费院子即可选晴日/暮色/细雨，可观察当前已修物件，选择一件“留在眼前”；偏好跨刷新保留。观察不自动标故事已读。
- 推进八章仍按原规则，每个真正新胜局一章。旧纪录不回填；最后获章的一局只完成第八章。
- 主线已全部解锁后的下一次新胜局才获得生活笺 01；不要求读完正文。每胜一笺，共十二张，所有难度与免费提示平等。
- 每张笺对应物件的第一或第二层变化，十二张构成六组；第十二张明确“这一册已收齐”。之后保留自由数独、偏好、观察和重读，不宣称无限内容。
- 结果保留原三个动作，沿用可选庭院入口；一行简短状态可表达新变化。不得加启动过场或强制阅读。

## 内容与视觉

生活笺采用稳定 ID `courtyard-life-01..12`，结构与原章节相近：`id`、`scene`、`title:{zh,en}`、`body:{zh,en}`。中文每张约35–90字，完整英文对应。人物仍是林禾、林照、陶姨，不把结局改成姐姐搬回来，不安排永久家务或照顾义务。

六组按序为：薄荷新叶/薄荷杯，窗边擦布/画册，椅垫/第二只杯，桌布补片/收好的针线盒，风铃纸签/收起的伞，门牌夹子/三只不同杯。每组两个物件层级由获笺数派生；重读旧章节不倒退实际院子。

三种氛围只改变庭院光色与有限雨线，不改变棋盘主题、时间或角色作息。复用同一 SVG，不复制三套院子。旧物观察使用有名称的原生按钮及 DOM 文字；图中微小热点不能成为唯一入口。偏爱是自由选择，无最佳答案或消费。普通手机目标44px，受限屏沿现有已声明妥协；正文/目录在 reader 内滚动，头尾关闭、语言、返回始终可达。新增功能拆成小组件，不能把全部逻辑堆回页面。

## 状态与接口

旧棋局/纪录/语言/振动、`fangcun:courtyard:v1` 及严格 schema 完全保留。新增两个独立域：

```ts
type CourtyardWorld = {
  version: 1;
  atmosphere: 'day' | 'dusk' | 'rain';
  motion: 'ambient' | 'still';
  favoriteObjectId: string | null;
};
type CourtyardLife = {
  version: 1;
  creditedSessionIds: string[]; // 唯一非空，最多12
  readNoteIds: string[];        // 仅允许已获得的生活笺白名单
};
type CourtyardCompletionState = {progress: CourtyardProgress; life: CourtyardLife};
```

世界偏好 key 为 `fangcun:courtyard:world:v1`，默认暮色/ambient/null；生活 key 为 `fangcun:courtyard-life:v1`，默认零项。获笺数唯一派生自 ledger 长度，物件每组层级为 `clamp(count - groupIndex*2,0,2)`，不另存 count 或 inventory。偏爱 ID 使用既有八个 scene token 白名单；命令拒绝未修物件，读取时派生安全可见值，不改故事上界。

纯函数契约：`createCourtyardWorld()`、`isCourtyardWorld(raw)`、`selectAtmosphere(world,value)`、`setWorldMotion(world,value)`、`setFavoriteObject(world,id,unlockedThrough)`；`createCourtyardLife()`、`isCourtyardLife(raw)`、`markLifeNoteRead(life,id)`；`applyCourtyardCompletion(state,sessionId):CourtyardCompletionState`。

完成命令先拒绝两个 ledger 任一已存在的 sessionId，再按**转换前**主线是否已满路由：未满只调用旧 advanceCourtyard，已满只向 life 加一，最多十二；满册后返回不增长。最后获章 ID 后来重复调用也不能进入生活域。唯一权威完成仍由 game.won + winRecorded 产生；animationend、Encore、打开/关闭、语言、天气、观察、偏爱、阅读均不发奖励。

新增 `useCourtyardState` 聚合主线、生活、世界偏好及命令；纯 updater 不写存储、不嵌套 setState。repository 继续是唯一 IO 边界，增加 load/persist World/Life，effects 保存；UI 只消费快照并请求命令。存储失败当次内存可玩，显示未保存提醒；坏新 key 仅回退本域。旧满篇/旧wins不回填生活笺；旧完成棋局不重新记胜，旧进行局首次合法完成可计入。不承诺跨 key 事务或多标签原子性。

呈现收据与奖励分离：`fangcun:courtyard-life:revealed:v1` 仅记最新呈现数0..12。一次院子会话至多演最新一项600ms opacity，挂载消费，关闭/刷新不连播；静态已得细节始终完整。存储禁用时只保证当前访问内防重放。

## 舒适度与预算

仅目录可运行环境动效；正文、后台、关闭、系统 reduced 或“静止庭院”时静止。晴日最多风铃一组，暮色灯+铃两组，细雨雨线组+灯两组；雨线≤12条、无定时粒子、无 rAF 或每帧 React 更新，不用全院 blur/filter。一次修复及轻触反馈均 transform/opacity，轻触180–300ms、单实例、不排队；静态文字立即反馈，不依赖动画完成。

维持244 decimal kB JS警告预算，不提高门槛，无外部图片/字体/音频依赖。新增 SVG 节点有固定上界并在交付记录实数；对实际包体、三种氛围切换、反复开关/前后台和节点增长取证。云端代理与自动状态压力检查不等于真机帧率、30分钟真人疲劳或留存证据。

## 验收

纯测试覆盖默认/非法 enum、锁物件、同值幂等、主线6→7不发生活笺、跨两 ledger 同 ID、生活1/12/13边界、已读白名单、坏存档与存储失败。真实浏览器覆盖三氛围刷新、观察/偏爱不改棋盘和奖励、通知关闭仍积累、一次新胜获笺、Encore/刷新不重复、全十二笺双语、短屏阅读/焦点/关闭、static/reduced/hidden无运行环境动画、快速重入无堆积。保留所有既有测试与根/Pages匹配的完整验证。

最终需实际截图、连续操作视频、同机包体/代理测量、独立代码/视觉/叙事 review、准确 head PR 检查。真人小米17/移动Edge、iOS、长时间主观体验未实际测试时写 NOT ASSESSED。只把完整候选交给用户最终审核；禁止合并、main push、部署、tag、Release。
