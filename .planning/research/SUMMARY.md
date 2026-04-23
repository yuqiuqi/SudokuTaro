# Research Summary — v2.0 iOS 26 / Liquid Glass 全量动画与交互精打

**日期：** 2026-04-23  
**研究覆盖：** FEATURES + STACK + ARCHITECTURE + PITFALLS

---

## 核心结论

### Stack additions（新增能力，无新包）

| 技术 | 用途 | 支持情况 |
|------|------|---------|
| `CSS linear()` | 精准 spring 弹性曲线 | Chrome 117+, Safari 18+, FF 129+ ✓ |
| `CSS @starting-style` | 弹层入场无 JS 动画 | Chrome 117+, Safari 17.4+, FF 129+ ✓ |
| `CSS @property` | 玻璃透明度动画插值 | Chrome 85+, Safari 16.4+, FF 128+ ✓ |
| `CSS scroll-driven` | Hero 随滚动淡出 | Chrome 115+, Safari 18+, FF 128+ ✓ |
| `data-state 属性` | 五态驱动，零新依赖 | 全部 ✓ |
| `backdrop-filter + saturate + brightness` | 扩展材质质感 | 全部（已有） ✓ |

**不引入任何新 npm 包。**

### 关键设计数值（设计师定稿数值）

```
== 按钮按下 ==
  时长: 120ms ease-out
  scale: 1 → 0.95
  opacity: 1 → 0.88
  specular: 收缩（::after width 80% → 40%）

== 按钮回弹 ==
  时长: 240ms spring(stiffness:400, damping:28)
  CSS: cubic-bezier(0.34, 1.28, 0.64, 1)
  scale: 0.95 → 1.03 → 1.0（超调 3%）

== 数独格选中 ==
  时长: 140ms ease-out
  scale: 1 → 0.96 → 1.0（回弹）
  背景: transparent → rgba(accent, 0.12)

== 格子高亮涟漪 ==
  stagger delay: 每格 8ms
  时长: 180ms ease-out

== 冲突 shake ==
  时长: 220ms cubic-bezier(0.36, 0.07, 0.19, 0.97)
  位移: ±4rpx × 3次

== 弹层入场 ==
  时长: 380ms cubic-bezier(0.32, 0.72, 0, 1)
  translateY(100%) → 0 + opacity 0.5 → 1
  backdrop-blur: 0 → 18px（同步）

== 弹层出场 ==
  时长: 280ms cubic-bezier(0.55, 0, 1, 0.45)
  translateY(0) → 60% + opacity → 0.3

== Switch 开关 ==
  时长: 280ms spring（squash-stretch）
  thumb 宽度: 运动中压扁 80% / 拉长 120%

== 通关弹窗编排 ==
  蒙层: 0ms + 300ms淡入blur
  卡片: 40ms + 380ms spring
  标题: 120ms + 260ms fade+上移
  数字: 200ms + 200ms滚动
  按钮: 300ms + 180ms淡入
```

### 架构关键决策

| 决策 | 方案 |
|------|------|
| 五态驱动 | `data-state` 属性 + CSS `[data-state="X"]` |
| Token 扩展 | 3 个新 Sass 文件（_motion-tokens / _component-tokens / _mixins-lg） |
| 弹层卸载 | `setTimeout` 延迟卸载（280ms = 出场时长） |
| Spring easing | CSS `linear()` 主方案 + `cubic-bezier` 回退 |
| hover | `@media (hover: hover) and (pointer: fine)` 限制 |
| reduced-motion | `*, *::before, *::after` 全覆盖 + 例外白名单 |

### Watch Out For（关键风险）

| 风险 | 预防 |
|------|------|
| 多层 backdrop-filter 性能 | 同屏 ≤ 2 个，弹层开时降低主卡片 blur |
| will-change 内存泄漏 | 仅动画期间临时添加，81格格子禁止永久开启 |
| Safari overflow:hidden + backdrop-filter | 改用 clip-path 或确保层级正确 |
| rpx 在 @keyframes 不被编译 | 改用 CSS var(--px值) 或百分比 |
| prefers-reduced-motion 遗漏 | `*, *::before, *::after` 全覆盖 |
| 弹层关闭闪烁 | data-state="leaving" + setTimeout 延迟卸载 |
| 移动端 hover 粘滞 | `@media (hover: hover)` 限制 |

---

## 功能类别（供需求定义）

### Table Stakes（必须有）
- 按钮/格子 pressed 态：scale + opacity（120ms）
- 按钮回弹：spring overshoot（240ms）
- 弹层 spring 入场/出场
- prefers-reduced-motion 全路径覆盖
- data-state 五态架构
- Token 三层体系建立

### Differentiators（区分体验的关键）
- 格子选中涟漪 stagger（逐格 delay）
- 冲突 shake 动画（物理感）
- 通关弹窗顺序编排（电影感）
- Switch squash-stretch
- specular 高光动态（按下时收缩）
- Hero 光斑 scroll-driven 淡出

### Nice to Have（锦上添花）
- 数字填入时的轻微 pulse
- 棋盘整体的入场编排（游戏开始时）
- 按下时 haptic 反馈增强（已有震动，加精准时机）
- focus-visible 键盘焦点环精细化

### Anti-features（明确不做）
- 实时光学折射（WebGL）
- 设备倾斜 specular（DeviceMotion）
- 引入 Framer Motion 或 GSAP（包体太大）
- 像素级复制 iOS 原生控件

---

## 后续行动

1. **需求定义：** 按 Table Stakes > Differentiators > Nice to Have 优先级排序
2. **单一阶段核心打磨：** 建议 1 个 Phase（Phase 4）覆盖全部组件，每个组件是独立 Plan
3. **UAT 策略：** 手机真机 + 桌面 Chrome DevTools 各主路径截图/录屏对比
