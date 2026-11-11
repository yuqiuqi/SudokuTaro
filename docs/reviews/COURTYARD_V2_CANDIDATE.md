# 旧院 2.0 候选：用户审核入口

**等待用户最终审核，尚未发布。** 当前分支为`feat/courtyard-redesign`，线上仍为既有[v1.3.0](../releases/v1.3.0.md)。本轮未合并、未推main、未部署、未打标签或发布Release。下列为本地冻结候选证据；准确提交的远端CI与PR状态以本分支实际PR检查为准，不能提前视为通过。

React18/Vite重建Web入口与会话／存档／演出边界，保留数独旧档、输入、免费提示、教程与胜利契约。新暖瓷棋盘配完整八章中英亲情故事、三种可选氛围、静止庭院、旧物观察／偏爱及主线后十二笺／六组两层日常物件。首篇免费，七个新胜局完成主线，再十二个新胜局收齐日常；主线末局不双发，旧胜场不补发。内容有限，游戏不设签到、付费、广告或真实日期门槛。

[八章故事全文（含结局）](../story/COURTYARD_STORY.md) · [十二笺全文](../story/COURTYARD_LIFE_NOTES.md) · [架构](../architecture/COURTYARD_V2.md) · [适配](../RESPONSIVE_DESIGN.md) · [技能安装记录](../GAMEDEV_SKILLS.md) · [新参考采用记录](../CLAUDE_GAME_STUDIOS_ADOPTION.md) · [原创资产清单](../art/courtyard-assets.json)

## 实际画面与连续演示

全部来自最新匹配的Pages生产构建、回环Chromium，非真机。详细状态来源、61文件源码快照SHA-256及生产JS/CSS哈希见[采集元数据](../screenshots/courtyard-capture-metadata.json)。

| 画面 | 来源 |
|---|---|
| [简单棋盘](../screenshots/courtyard-easy-393x720.png) | 原生新局，39给定数，实际选格，当前2个可用数字 |
| [中等棋盘](../screenshots/courtyard-medium-393x720.png) | 原生新局，34给定数，九键可选 |
| [免费初始门灯](../screenshots/courtyard-first-light-393x720.png) | 首次显现后真实初始庭院 |
| [晴日](../screenshots/courtyard-day-393x720.png) | 玩家控件实际切换 |
| [暮色](../screenshots/courtyard-dusk-393x720.png) | 玩家控件实际切换 |
| [细雨](../screenshots/courtyard-rain-393x720.png) | 玩家控件实际切换 |
| [第一篇正文](../screenshots/courtyard-first-page-393x720.png) | 免费主线正文，真实DOM |
| [修复后的院子](../screenshots/courtyard-restored-393x720.png) | 受控七次信用存档，不是自然解完七局 |
| [568×240英文阅读](../screenshots/courtyard-reader-568x240-en.png) | 受控开放状态，原生进入第四章；正文内部滚动、操作固定 |
| [十二笺全部物件](../screenshots/courtyard-life-complete-393x720.png) | 受控主线7／日常12信用存档，不是自然解完十九局 |
| [第十二笺正文](../screenshots/courtyard-life-note-393x720.png) | 由上述受控状态经原生控件打开 |
| [通关波浪帧](../screenshots/courtyard-wave-393x720.png) | 临近完成存档实际填最后一格后的真实动画帧 |
| [通关结果](../screenshots/courtyard-victory-393x720.png) | 实际wave与lime结束后到达结果，不是自然解完整局 |

[连续演示MP4（10.92秒）](../screenshots/courtyard-demo.mp4)：等待应用就绪后录制，受控主线已满／日常0／棋局临近完成状态，实际填数→彩虹波浪→青柠缝隙光→结果→首个日常物件→选雨→风铃观察与偏爱→阅读第一笺。使用原生Chromium CDP逐帧及原事件时间戳，由系统FFmpeg编码，无剪辑或人工UI，H.264偶数像素补边至394×720。视频没有展示自然解完整局或真机输入。

独立AI视觉／叙事审阅实际检查全部13张PNG、最终视频6张关键帧和两张4fps接触表，未留P2问题。抽帧检查不等于人工逐帧播放，更不等于真人长期试玩或用户最终批准。

## 本地验证

同一冻结候选的61个源码／配置／测试文件检查结束后保持未变，源码快照摘要`3a69ed62e0d2a6993f10d8c9a708bdcc8d5e41dab926802100bf253ce13eb3dd`。实际阶段退出码和耗时见[本地验证JSON](courtyard-v2-local-validation.json)。

| 检查 | 实际结果 |
|---|---|
| 类型、60项逻辑、根生产构建 | 通过，构建无warning |
| 原庭院专项／新世界专项 | 通过，31.26s／33.38s |
| 增强几何诊断 | 1176例，0失败，99.11s |
| 最新根路径完整浏览器 | 通过，441.30s，runtimeErrors=[] |
| 匹配Pages构建／完整浏览器 | 通过，1.08s／451.73s，runtimeErrors=[] |

[几何摘要JSON](courtyard-v2-geometry-summary.json)覆盖14种配置、双语、两种动效、七课（前三课五步）及通关／完成态，包含实际visualViewport压缩及文字内部字形边界检查。1176是程序推进的状态几何，不是1176次原生点击；真实操作由完整浏览器和专项分别覆盖。压缩视口检查以document scroll≤clientHeight判断文档滚动，同时所有目标仍受实际visualViewport约束。

审阅发现并已关闭的缺陷包括故事边界焦点、危险语义优先级、非法信用账本、一次显现收据、普通胜局动画优先级、窄屏英文标题字形行距和英文SVG替代文本；测试等待浮点边界、再赏动效偏好和压缩视口文档尺寸口径也已校正。真实RED／GREEN及最终完整回归用于验证，未删除旧断言绕过产品缺陷。准确head独立代码审阅与远端检查待PR形成后核验。

## 同机测量及限制

[基线原始数据](courtyard-v2-baseline.json) · [候选原始数据](courtyard-v2-measurement.json)。两者来自同一云主机、localhost生产产物、系统Chromium、393×720、减少动态效果，三次新浏览器context。字节为全部输出文件之和，不只算入口；gzip为压缩测量，不冒称网络实际传输。

| 资源 | v1.3.0基线原始／gzip字节 | 最终候选原始／gzip字节 | 变化 |
|---|---:|---:|---|
| JS | 341052／114278 | 243973／83424 | -28.46%／-27.00% |
| CSS | 45430／9062 | 54725／10484 | +20.46%／+15.69% |

候选静态入口104132字节、React vendor139841字节，无异步UI加载；构建无warning，未抬高244KiB建议阈值。候选就绪观测为415／399／358ms，包含自动化等待；选格后两帧代理p50约33.3ms、p95为34.8／33.7／34.2ms。它们不是硬件输入延迟、真实启动优化结论或FPS证明。

实测SVG子节点：初始暮色121、初始细雨136、主线全修暮色143、十二笺全收暮色173；日常额外30个节点，有界而非无限增长。节点数也不能独立证明帧率。

未进行小米17移动Edge、iOS Safari、折叠硬件、屏幕阅读器或30分钟真人soak测试；不声称移动触感、真实设备性能或留存提升。localStorage仍没有跨key事务、多标签写入一致性或跨设备同步保证。最终需要用户实际试玩、审阅完整故事与视觉，并明确批准后才可考虑合并。
