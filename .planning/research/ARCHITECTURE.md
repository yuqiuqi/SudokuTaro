# Architecture Research — Liquid Glass 组件架构与 Design Token 体系

**研究日期：** 2026-04-23

---

## 1. Token 三层架构

```
Primitive Tokens（原始值）
    ↓
Semantic Tokens（语义）
    ↓
Component Tokens（组件级）
```

### 1.1 Primitive Tokens（已有，扩展）

```scss
// src/styles/_apple-ui-tokens.scss 扩展部分

// === 模糊半径 ===
$blur-sm: 8px;
$blur-md: 18px;    // 内容卡片
$blur-lg: 22px;    // 弹层
$blur-xl: 28px;    // 导航/Tab Bar

// === 透明度梯度 ===
$opacity-glass-weak: 0.42;
$opacity-glass-default: 0.55;
$opacity-glass-strong: 0.78;
$opacity-glass-solid: 0.96;    // @supports not 回退用

// === 圆角梯度 ===
$radius-xs: 8rpx;
$radius-sm: 12rpx;
$radius-md: 16rpx;   // 按钮
$radius-lg: 24rpx;   // 弹层卡片
$radius-xl: 36rpx;   // 主内容卡片
$radius-pill: 999rpx; // 胶囊按钮、tag

// === 阴影分级 ===
$shadow-xs: 0 1rpx 4rpx rgba($ui-label-primary, 0.06);
$shadow-sm: 0 2rpx 12rpx rgba($ui-label-primary, 0.08);
$shadow-md: 0 8rpx 32rpx rgba($ui-label-primary, 0.10);   // 默认卡片
$shadow-lg: 0 16rpx 48rpx rgba($ui-label-primary, 0.14);  // hover 提升
$shadow-xl: 0 32rpx 80rpx rgba($ui-label-primary, 0.18);  // 弹层

// === Focus Ring ===
$focus-ring: 0 0 0 2px $ui-accent;
$focus-ring-offset: 0 0 0 4px rgba($ui-accent, 0.20);
```

### 1.2 Semantic Tokens（新建 _component-tokens.scss）

```scss
// src/styles/_component-tokens.scss

// === 表面 ===
$surface-page:    $ui-bg;
$surface-card:    rgba($ui-surface, $opacity-glass-default);
$surface-modal:   rgba($ui-surface, $opacity-glass-strong);
$surface-control: rgba($ui-surface, $opacity-glass-weak);
$surface-pressed: rgba($ui-label-primary, 0.06);

// === 按钮 ===
$btn-primary-bg:        $ui-accent;
$btn-primary-pressed:   rgba($ui-accent, 0.80);
$btn-ghost-bg:          rgba($ui-surface, 0.60);
$btn-ghost-pressed:     rgba($ui-surface, 0.40);
$btn-pressed-scale:     0.95;
$btn-pressed-opacity:   0.88;
$btn-disabled-opacity:  0.38;

// === 格子（数独） ===
$cell-selected-bg:  rgba($ui-accent, 0.12);
$cell-selected-scale: 0.96;
$cell-conflict-bg:  rgba($ui-destructive, 0.18);
$cell-same-bg:      rgba(52, 199, 89, 0.14);
$cell-dim-bg:       rgba($ui-accent, 0.06);

// === 弹层 ===
$modal-backdrop-blur:     $blur-lg;
$modal-card-blur:         $blur-lg;
$modal-enter-duration:    380ms;
$modal-exit-duration:     280ms;
$modal-enter-easing:      $ui-ease-sheet;  // cubic-bezier(0.32,0.72,0,1)
$modal-exit-easing:       cubic-bezier(0.55, 0, 1, 0.45);
```

### 1.3 Component Tokens（组件内 SCSS）

每个组件的 `.scss` 文件顶部直接引用语义 token，不散落裸数值：

```scss
// src/pages/index/index.scss 组件块示例
.btn--action {
  background: $btn-primary-bg;
  border-radius: $radius-md;
  transition:
    transform $dur-fast $ease-out-quart,
    opacity $dur-fast $ease-out-quart,
    box-shadow $dur-fast $ease-out-quart;

  &[data-state="pressed"] {
    transform: scale($btn-pressed-scale);
    opacity: $btn-pressed-opacity;
    box-shadow: $shadow-xs;
  }
  &[data-state="disabled"] {
    opacity: $btn-disabled-opacity;
    pointer-events: none;
  }
}
```

---

## 2. 组件状态机设计

### 2.1 五态定义

```
idle ──→ hover ──→ pressed ──→ released ──→ idle
  │                              │
  └──────────────→ disabled ─────┘
```

### 2.2 data-state 属性驱动方案（推荐）

**为什么选 data-state 而非 className 拼合：**
- 与 CSS `[data-state="X"]` 选择器配合，可做任意复杂样式切换
- React 侧只需 `data-state={isPressed ? "pressed" : "idle"}` 一个属性
- 避免 `cn(styles.btn, isPressed && styles.pressed)` 的字符串拼合
- 天然支持 CSS 动画触发（属性变化比 class 变化更稳定）

```tsx
// React 组件侧（最小侵入）
function ActionButton({ disabled, children, onPress }) {
  const [state, setState] = useState<'idle'|'pressed'>('idle');
  return (
    <View
      data-state={disabled ? 'disabled' : state}
      onTouchStart={() => !disabled && setState('pressed')}
      onTouchEnd={() => setState('idle')}
      onTouchCancel={() => setState('idle')}
    >
      {children}
    </View>
  );
}
```

```scss
// CSS 侧
.btn--action {
  transition: transform 120ms $ease-out-quart, opacity 120ms ease;
  
  &[data-state="pressed"] {
    transform: scale(0.95);
    opacity: 0.88;
  }
  &[data-state="disabled"] {
    opacity: 0.38;
    pointer-events: none;
  }
}
```

### 2.3 弹层状态机

```
closed → entering → open → leaving → closed
```

```tsx
// 弹层用 data-state 驱动入场/出场动画
// 'entering': 触发 @starting-style 或 keyframe-in
// 'leaving': 触发 keyframe-out
// 在 transitionend 后设置为 'closed'（卸载 DOM）
```

```scss
.modal__card {
  &[data-state="entering"] { animation: modalIn 380ms $ease-spring-default forwards; }
  &[data-state="leaving"]  { animation: modalOut 280ms $modal-exit-easing forwards; }
}
```

---

## 3. 文件结构调整方案

### 3.1 新增文件

```
src/styles/
├── _apple-ui-tokens.scss      ← 已有，扩展 blur/shadow/radius 梯度
├── _motion-tokens.scss        ← 新建：spring/linear() vars + dur/ease 扩展
├── _component-tokens.scss     ← 新建：按钮/格子/弹层语义变量
└── _mixins-lg.scss            ← 新建：liquid-glass(), five-state(), spring-btn() mixin
```

### 3.2 关键 Mixin 设计

```scss
// src/styles/_mixins-lg.scss

// Liquid Glass 材质 mixin
@mixin liquid-glass($blur: $blur-md, $opacity: $opacity-glass-default) {
  background: rgba($ui-surface, $opacity);
  backdrop-filter: blur($blur) saturate(1.8) brightness(1.02);
  -webkit-backdrop-filter: blur($blur) saturate(1.8) brightness(1.02);
  border: 1px solid rgba($ui-surface, 0.65);
  
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    background: rgba($ui-surface, $opacity-glass-solid);
    border: 1px solid $ui-hairline-on-bg;
  }
}

// Spring 按钮 mixin（五态自动注入）
@mixin spring-btn($scale: 0.95, $opacity: 0.88) {
  transition:
    transform 120ms $ease-out-quart,
    opacity 120ms ease,
    box-shadow 120ms ease;
  
  &[data-state="pressed"] {
    transform: scale($scale);
    opacity: $opacity;
  }
  &[data-state="disabled"] {
    opacity: 0.38;
    pointer-events: none;
    cursor: not-allowed;
  }
  &:focus-visible {
    outline: none;
    box-shadow: $focus-ring, $focus-ring-offset;
  }
}

// 数独格 mixin（选中态 + 回弹）
@mixin cell-interactive {
  transition: background-color 140ms ease-out, transform 140ms $ease-spring-snappy;
  
  &[data-state="selected"] {
    background-color: $cell-selected-bg;
    transform: scale($cell-selected-scale);
  }
  &[data-state="conflict"] {
    background-color: $cell-conflict-bg;
    animation: cellShake 220ms $ease-spring-stiff;
  }
}
```

### 3.3 theme.ts 同步扩展

```ts
// src/utils/theme.ts — motion 扩展
export const appleUi = {
  // ... 现有 color / board / hero
  motion: {
    // 现有
    durationTapMs: 120,     // 更新：120（之前160）
    durationFocusMs: 140,
    durationSheetEnterMs: 380,
    durationSheetExitMs: 280,
    // 新增
    durationMicroMs: 80,
    durationDefaultMs: 240,
    durationAmbientMs: 22000,
    // Spring easing（CSS 字符串，供 React style 用）
    easeSpringSnappy: 'cubic-bezier(0.34, 1.28, 0.64, 1)',
    easeSpringDefault: 'cubic-bezier(0.32, 0.72, 0, 1)',
    easeSpringGentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
    easeInQuart: 'cubic-bezier(0.5, 0, 0.75, 0)',
  },
  glass: {
    blurCard: 18,
    blurModal: 22,
    blurTab: 28,
    opacityDefault: 0.55,
    opacityStrong: 0.78,
  },
} as const;
```

---

## 4. Z-index 层级语义

```scss
// src/styles/_component-tokens.scss
$z-background: 0;
$z-content: 1;
$z-card: 10;
$z-sticky: 50;
$z-controls: 100;
$z-modal-mask: 1000;
$z-modal-card: 1001;
$z-toast: 2000;
$z-system: 9999;
```

---

## 5. 组件影响范围清单

| 组件 | 文件 | 需要改造 |
|------|------|---------|
| 主内容卡片 | `index.scss .content-wrap` | liquid-glass mixin、阴影升级 |
| 数独格 | `index.scss .cell` | data-state 五态、选中回弹 |
| 操作按钮行 | `index.scss .btn--action` | spring-btn mixin |
| 设置开关 | `index.scss .switch-like` | squash-stretch 动画 |
| 弹层卡片 | `index.scss .modal__card` | 入场/出场 spring |
| 弹层蒙层 | `index.scss .modal__mask` | blur 渐进入场 |
| 通关弹窗 | `index.scss .modal--win` | 顺序入场编排 |
| 冲突提示 | `index.scss .cell--conflict` | shake keyframe |
| 英雄光斑 | `index.scss .hero__*` | scroll-driven 淡出 |
| 全局 | `app.scss` | tap-highlight 已有，补 focus-visible |

---

## RESEARCH COMPLETE
