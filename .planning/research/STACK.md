# Stack Research — H5 实现 iOS 26 Liquid Glass 动画与材质

**研究日期：** 2026-04-23  
**环境：** Taro 4.0.9 + React 18 + Sass ^1.75.0 + Webpack 5，仅 H5

---

## 1. 材质实现技术

### 1.1 backdrop-filter 组合

| 属性 | 参数 | 浏览器支持（2025） | 本项目可用 |
|------|------|-------------------|-----------|
| `backdrop-filter: blur(Npx)` | 16-20px 为 Liquid Glass 感官阈值 | ✓ Chrome 76+, Safari 14+, Firefox 103+ | ✓ |
| `backdrop-filter: saturate(N)` | 1.6–2.0，提升折射感 | ✓ 同上 | ✓ |
| `backdrop-filter: brightness(N)` | 1.01–1.05，防止过暗 | ✓ 同上 | ✓ |
| `backdrop-filter: contrast(N)` | 0.95–1.0，降低过饱和 | ✓ 同上 | ✓ |
| 多值组合 | `blur(18px) saturate(1.8) brightness(1.02)` | ✓ | ✓ |

```scss
// 推荐组合（已在 _apple-ui-tokens.scss 中可扩展）
$ui-glass-backdrop: blur(18px) saturate(1.8) brightness(1.02);
$ui-glass-backdrop-modal: blur(22px) saturate(2.0) brightness(1.01);
$ui-glass-backdrop-tab: blur(28px) saturate(2.2) brightness(1.0);
```

### 1.2 CSS linear() — Spring 模拟

| 项目 | 状态 |
|------|------|
| Chrome 117+ | ✓ 支持 |
| Safari 18+ (iOS 18+) | ✓ 支持 |
| Firefox 129+ | ✓ 支持 |
| 性能 | 与 cubic-bezier 相当，无额外开销 |

```scss
// _apple-ui-tokens.scss 中增加
// Spring snappy（按钮回弹）
$ui-spring-snappy: linear(
  0, 0.694 15%, 1.099 28%, 1.202 33%,
  1.218 35%, 1.16 45%, 1.022 59%,
  0.985 66%, 0.996 76%, 1 100%
);
// Spring gentle（弹层、大元素）
$ui-spring-gentle: linear(
  0, 0.4 10%, 0.82 23%, 0.99 34%,
  1.05 41%, 1.06 48%, 1.02 58%,
  1.002 68%, 1 100%
);
// 回退（不支持 linear() 的旧浏览器）
$ui-spring-snappy-fallback: cubic-bezier(0.34, 1.28, 0.64, 1);
$ui-spring-gentle-fallback: cubic-bezier(0.32, 0.72, 0, 1);
```

### 1.3 CSS @starting-style（入场动画）

```css
/* Chrome 117+，Safari 17.4+，Firefox 129+ — ✓ 可用 */
@starting-style {
  .modal__card {
    opacity: 0;
    transform: translateY(32px);
  }
}
.modal__card {
  transition: opacity 320ms ease-out, transform 380ms var(--spring-gentle);
}
```

**本项目判断：** ✓ 可用于弹层入场，需回退保留现有 @keyframes 方案。

### 1.4 CSS @property（动画插值自定义属性）

```css
/* Chrome 85+，Safari 16.4+，Firefox 128+ — ✓ 可用 */
@property --glass-opacity {
  syntax: '<number>';
  inherits: false;
  initial-value: 0.55;
}
/* 允许对 background: rgba(255,255,255, var(--glass-opacity)) 做动画插值 */
```

**用途：** 动画插值玻璃透明度（正常 CSS 无法对 rgba 中的变量做插值，需要此特性）。

### 1.5 View Transitions API

| 项目 | 状态 |
|------|------|
| Chrome 111+ | ✓ |
| Safari 18+ | ✓ |
| Taro H5 环境 | ⚠ 可手动调用，但 Taro Router 不自动集成 |

**本项目判断：** ⚠ 可用于通关弹窗与主界面的转场，需手动触发 `document.startViewTransition()`。

### 1.6 CSS scroll-driven animations

| 项目 | 状态 |
|------|------|
| Chrome 115+ | ✓ |
| Safari 18+ | ✓ |
| Firefox 128+ | ✓ |

```css
/* Hero 光斑随滚动视差 */
.hero {
  animation: heroDim linear both;
  animation-timeline: scroll(root block);
  animation-range: 0 200px;
}
@keyframes heroDim { to { opacity: 0; } }
```

**本项目判断：** ✓ 可用于 Hero 区域滚动时淡出，减少视觉干扰。

---

## 2. 动画驱动方式对比

| 方案 | 优势 | 劣势 | 本项目推荐 |
|------|------|------|-----------|
| **CSS transition + linear()** | 零 JS 开销，GPU 加速 | 复杂 spring 近似有限 | ✓ 首选（≤2次回弹） |
| **CSS @keyframes** | 精确控制多帧 | 无法动态参数化 | ✓ 用于 shake、pulse |
| **Web Animations API** | JS 参数化，支持 play/pause | 需 polyfill（Taro 环境） | ⚠ 慎用 |
| **requestAnimationFrame** | 最灵活 | 增加 JS 主线程压力 | ✗ 仅数字滚动用 |
| **Framer Motion** | 功能全 | +120KB，与 Taro 不完全兼容 | ✗ 不引入 |

---

## 3. Sass 动效 token 扩展结构

```
src/styles/
├── _apple-ui-tokens.scss      ← 现有：色板、玻璃、基础 motion
├── _motion-tokens.scss        ← 新建：spring、入场/出场、环境动效
├── _component-tokens.scss     ← 新建：按钮/弹层/格子 组件级变量
└── _mixins.scss               ← 新建：five-state、liquid-glass、spring-btn 等 mixin
```

```scss
// _motion-tokens.scss 结构示例
// === 时长分级 ===
$dur-micro: 80ms;      // hover 提示
$dur-fast: 140ms;      // 格子选中、按下
$dur-default: 240ms;   // 按钮回弹
$dur-enter: 380ms;     // 弹层入场
$dur-exit: 280ms;      // 弹层出场
$dur-ambient: 22000ms; // Hero 光斑漂移

// === Easing 扩展 ===
$ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
$ease-in-quart: cubic-bezier(0.5, 0, 0.75, 0);
$ease-spring-snappy: cubic-bezier(0.34, 1.28, 0.64, 1);  // 有超调
$ease-spring-default: cubic-bezier(0.32, 0.72, 0, 1);    // 无超调
$ease-spring-gentle: cubic-bezier(0.25, 0.46, 0.45, 0.94);
$ease-spring-stiff: cubic-bezier(0.36, 0.07, 0.19, 0.97); // shake 用
```

---

## 4. will-change 使用规范

```scss
// ✓ 正确：仅在动画即将发生时临时添加（通过 .is-animating 类）
.modal__card.is-animating {
  will-change: transform, opacity;
}
// ✓ 正确：持续动画的元素（Hero 光斑）
.hero__a, .hero__b, .hero__c, .hero__d {
  will-change: transform;
}
// ✗ 错误：不要对静止元素永远开启
.content-wrap { will-change: transform; } /* 会常驻 GPU 层，浪费内存 */
```

---

## 5. 技术选型决策

| 决策 | 选择 | 理由 |
|------|------|------|
| Spring 动画 | CSS linear() + cubic-bezier 回退 | 无 JS 开销，足够精确 |
| 入场动画 | CSS @starting-style + @keyframes 回退 | 现代语法优先 |
| 材质 | backdrop-filter + @supports 回退 | 已有实现，继续扩展 |
| 五态驱动 | data-state 属性 + CSS [data-state="X"] | 最小侵入，无新依赖 |
| 视差 | CSS scroll-driven animations | 零 JS |
| 数字滚动 | requestAnimationFrame（仅通关弹窗） | 仅限必要场景 |

---

## RESEARCH COMPLETE
