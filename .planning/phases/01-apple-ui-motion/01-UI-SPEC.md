---
phase: 1
slug: apple-ui-motion
status: approved
shadcn_initialized: false
preset: apple-like-taro
created: 2026-04-22
---

# Phase 1 — UI Design Contract（Apple 向 · Taro）

> 面向 `src/pages/index/` 主游戏界面及全局 `app.scss` 的增量。与微信小程序 / H5 / 抖音小程序共用一套 token。

---

## Design System

| Property | Value |
|----------|-------|
| Tool | **none**（手写 Sass + 可选 `theme.ts` 常量） |
| Preset | **apple-like-taro**（行为与层级对齐 Apple HIG 方向，非官方资源） |
| Component library | **none**（保持页面内 `React.memo` 子组件） |
| Icon library | **none**（暂用文本与简单几何；若引入图标须为 **SVG**，禁止 emoji 充当图标） |
| Font | **系统字体栈**：`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`（H5）；小程序以各端系统字体为准，不强制 Web 字体文件（减包体） |

---

## Spacing Scale

**基准：** 750 设计稿，**4 的倍数 rpx**（与 Taro 习惯一致）。

| Token | rpx | 用途 |
|-------|-----|------|
| xs | 8 | 紧密间隙、小圆角内边距 |
| sm | 16 | 按钮内边距、格线邻近区域 |
| md | 24 | 卡片内边距、主列元素间隙 |
| lg | 32 | 区块分隔 |
| xl | 48 | 大段留白、棋盘外呼吸区 |

**Exceptions：** 九宫格 **81 格** 区域以「撑满主列宽」优先，内部 `gap` 可为 **0**（由边框表现宫格）；仅外层容器使用上表 token。

---

## Typography

| Role | rpx | Weight | Line height |
|------|-----|--------|-------------|
| Display（通关标题） | 40–44 | 600 | 1.2 |
| Heading（区块标题） | 32–34 | 600 | 1.25 |
| Body | 28–30 | 400 | 1.35 |
| Label / 辅助 | 24–26 | 500 | 1.3 |
| **Digits（棋盘内数字）** | 32–36 | 500–600 | 1（格内居中） |
| Tabular nums | 计时、步数使用 **等宽数字感**（可用 `font-variant-numeric: tabular-nums` 于 H5；小程序若不支持则保持字重一致即可） |

**最小可读：** 关键统计（计时、步数）在 750 宽下 **≥ 26rpx**。

---

## Color

**方向：** 浅色、纸感基底 + **系统式分隔**；强调色克制。

| Role | 建议 hex | 用途 |
|------|-----------|------|
| Dominant (60%) | `#F2F2F7`（可融合现有暖纸色至 `#F5F2EB`） | 页面背景 |
| Surface / Secondary (30%) | `#FFFFFF` 或 94–98% 不透明叠在背景上 | 卡片、棋盘衬底 |
| Separator / Hairline | `#C6C6C8` @ 0.35 opacity 或 `#E5E5EA` | 列表分隔、轻边框 |
| Label primary | `#1C1C1E` | 主文案 |
| Label secondary | `#8E8E93` | 次要说明 |
| Accent (10%) | `#007AFF`（或 `#0A84FF` 深色模式预留） | **每局一次**主 CTA、链接式操作；**不**用于所有按钮铺色 |
| Destructive | `#FF3B30` | 清空/危险确认（若产品定义） |
| Conflict / Error tint | `#FF3B30` @ 15–25% 背景或 1.5px 描边 | 冲突格 |

**Accent 仅用于：** 「新开一局」主按钮、关键文字链接、选中态强调边（择一，避免滥用）。

**深色模式：** Phase 1 **不强制**；若实现，Surface 用 `#1C1C1E`，Label 用 `#F2F2F7`，需在 UAT 单列。

---

## Motion（动画契约）

**原则：** 优先 **`transform` + `opacity`**；避免对 `width`/`height`/`top` 做连续动画。

| 场景 | Duration | Easing | 备注 |
|------|-----------|--------|------|
| 按钮 / 格子按下 | 120–180ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` | `scale(0.97)` 或背景色过渡 |
| 选中格焦点环 | 200ms | 同上 | 环或背景浅高亮 |
| 冲突提示出现 | 180–240ms | ease-out | 可单次轻微 `translateY(2rpx)->0` |
| 弹窗 / 结果 sheet 进入 | 320–400ms | `cubic-bezier(0.32, 0.72, 0, 1)` | 自底部或淡入+上移 ≤ 24rpx |
| 弹窗关闭 | 240–300ms | ease-in | 略快于进入 |

**`prefers-reduced-motion: reduce`：** 所有位移动画改为 **opacity only** 或直接 **无过渡**；时长 ≤ 120ms。

---

## Copywriting Contract

| Element | Copy（zh-CN） |
|---------|----------------|
| Primary CTA | **新开一局** |
| 难度 | **初级 / 中级 / 高级**（保持现有） |
| 清空/擦除（若单独文案） | **擦除** |
| 撤销 | **撤销** |
| Empty / 无道具提示 | **道具不足** + 次句 **明天再来或完成每日领取**（与现有逻辑一致即可） |
| 通关标题 | **完成！** 或 **恭喜通关** |
| Error / 冲突 | 无需长句；可用 **与规则冲突**（若需文案） |
| Destructive confirmation | **新开一局**：**当前进度将丢失，确定继续？** |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | **无** | not required |
| 第三方动画库 | **默认不引入**；若引入须 bundle 体积评估 + 小程序兼容证明 | 需 Phase 1 PLAN 记录 |

---

## Implementation Notes（Taro 特有条目）

- **小程序 hover：** 继续 **`hoverStayTime={0}`** 与避免粘滞 hover（见 `CONTEXT.md`）。
- **棋盘：** 保持 `React.memo`；动效类加在 **容器或单格**，避免 81 格同时长跑动画。
- **Token 落地：** 优先扩展 `src/utils/theme.ts` 导出常量，在 SCSS 通过 **类名 BEM** 或构建时注入（避免在 TS 中散落魔法数）。

---

## Checker Sign-Off（六维自检 · 2026-04-22）

- [x] Dimension 1 Copywriting: **PASS**（中文契约覆盖主路径）
- [x] Dimension 2 Visuals: **PASS**（层级、材质、圆角语义已定义）
- [x] Dimension 3 Color: **PASS**（主/次/强调/破坏/冲突）
- [x] Dimension 4 Typography: **PASS**（rpx 阶梯 + 数字格）
- [x] Dimension 5 Spacing: **PASS**（4 倍数 rpx）
- [x] Dimension 6 Registry Safety: **PASS**（无 shadcn；第三方默认不引）

**Approval:** approved 2026-04-22（编排器自检；非 gsd-ui-checker 子代理）

---

## UI-SPEC COMPLETE

**Phase 1 — Apple-style UI & motion** 设计契约已就绪，可进入 `/gsd-plan-phase 1`。
