# Pitfalls Research — H5 落地 iOS 26 Liquid Glass 动画与交互的常见坑

**研究日期：** 2026-04-23

---

## 坑 1：backdrop-filter 与 overflow: hidden 冲突

**症状：** 设置了 `backdrop-filter` 的元素，其父级设置 `overflow: hidden` 后，毛玻璃效果失效（变为纯透明或纯色）。

**根因：** `overflow: hidden` 会在 Chrome/Safari 中隐式创建新的 stacking context，打断 backdrop-filter 的取样区域，导致其只对自身裁剪区域内的像素采样（通常是自身背景）。

**防范：**
```scss
// ✗ 错误写法
.parent { overflow: hidden; }
.child { backdrop-filter: blur(18px); }

// ✓ 正确：用 border-radius + clip-path 替代 overflow:hidden
.parent { clip-path: inset(0 round 36rpx); }
.child { backdrop-filter: blur(18px); border-radius: 36rpx; }

// ✓ 或：让 backdrop-filter 元素直接作为父级
.content-wrap { 
  border-radius: 36rpx;
  overflow: hidden;  // 仅用于裁剪子内容，不影响自身 blur
  backdrop-filter: blur(18px); // 不受自身 overflow 影响
}
```

**修复：** 在本项目中，`.content-wrap` 本身有 `overflow: hidden`，但 backdrop-filter 在其上，不受影响。需注意 `.modal__mask` 的 `backdrop-filter` 不能被 `.modal` 的 overflow 干扰。

---

## 坑 2：多层 backdrop-filter 叠加性能崩溃

**症状：** 同屏同时有 2+ 个使用 `backdrop-filter: blur` 的元素时，帧率骤降至 20fps 以下（尤其移动端）。

**根因：** 每个 backdrop-filter 元素需独立进行一次全屏像素采样+模糊合成，多个叠加时 GPU 带宽压力指数级增长。

**防范：**
```
同屏最多 2 个 backdrop-filter 元素（主卡片 + 弹层）
弹层出现时，主卡片的 backdrop-filter 可降级：
  .content-wrap.modal-open { backdrop-filter: blur(8px); /* 降低 */ }
  
列表项/格子 禁止使用 backdrop-filter
Hero 光斑用 filter: blur（对自身，不采样背景）而非 backdrop-filter
```

**修复代码：**
```scss
// 弹层激活时降低主卡片 blur 成本
.page:has(.modal.is-open) .content-wrap {
  backdrop-filter: blur(8px) saturate(1.4); // 从 18px 降到 8px
  transition: backdrop-filter 200ms ease;
}
```

---

## 坑 3：CSS cubic-bezier 超调（overshoot）在 Safari 的行为差异

**症状：** `cubic-bezier(0.34, 1.28, 0.64, 1)` 在 Chrome 正常显示回弹效果（Y值 > 1），但在旧版 Safari（< 16）中超调被截断，变成普通 ease-out。

**根因：** 旧版 Safari 对 cubic-bezier Y 值超出 [0,1] 范围的处理方式不同，会自动 clamp 到边界值。

**防范：**
```scss
// 方案1：渐进增强——旧浏览器无超调效果，新浏览器有
.btn[data-state="pressed"] {
  transition-timing-function: cubic-bezier(0.34, 1.28, 0.64, 1);
}
// 方案2：@supports 检测 linear()（支持 linear() 的浏览器也支持超调）
@supports (animation-timing-function: linear(1, 2)) {
  .btn[data-state="pressed"] {
    transition-timing-function: var(--spring-snappy); // 用 linear() 版本
  }
}
```

---

## 坑 4：CSS :hover 在移动端粘滞

**症状：** 手指点击按钮后抬起，按钮保持 hover 状态（高亮/提亮）不消除，直到点击其他区域。

**根因：** 移动端浏览器在 touchend 后会触发模拟的 mouseover/mouseenter，导致 :hover 持续激活。

**防范（本项目已有 hoverStayTime={0}，但 CSS 层面还需处理）：**
```scss
// 方案：媒体查询限制 hover 仅在支持真实 hover 的设备上生效
@media (hover: hover) and (pointer: fine) {
  .btn--action:hover {
    opacity: 0.92;
    box-shadow: $shadow-lg;
  }
}
// 不支持真实 hover 的设备（移动端）：hover 样式自动不生效
```

---

## 坑 5：will-change 滥用导致内存泄漏

**症状：** 页面滚动/交互后内存持续增长，低端机内存溢出崩溃。

**根因：** `will-change: transform` 会为元素提前创建独立 GPU 合成层，长时间保持会锁定大块 GPU 内存。81个棋盘格如果全部设置 will-change，相当于创建 81 个 GPU 纹理。

**防范：**
```scss
// ✗ 错误：对静止格子永远开启
.cell { will-change: transform; }

// ✓ 正确：仅在动画期间通过 JS 临时添加
// React 侧：onTouchStart 添加 will-change，transitionEnd 移除
// 或：only open for cells in view（虚拟化）

// ✓ 例外：Hero 光斑（持续动画，合理）
.hero__a { will-change: transform; } // OK，只有4个
```

---

## 坑 6：Taro H5 的 rpx 在动画关键帧中的行为

**症状：** `@keyframes` 中使用 `rpx` 值（如 `translateY(24rpx)`），在某些 Taro 版本中关键帧内的 rpx 不被编译转换，导致动画无效。

**根因：** Taro 的 rpx→px 转换发生在 CSS 编译层，某些 PostCSS 插件不处理 @keyframes 内的值。

**防范与修复：**
```scss
// ✗ 可能出问题
@keyframes modalIn {
  from { transform: translateY(64rpx); }
}

// ✓ 安全方案1：用 em 或百分比替代 rpx
@keyframes modalIn {
  from { transform: translateY(5%); }
}

// ✓ 安全方案2：用 CSS 变量（在 :root 中设好 px 值）
:root { --modal-offset: 32px; }
@keyframes modalIn {
  from { transform: translateY(var(--modal-offset)); }
}
```

---

## 坑 7：prefers-reduced-motion 遗漏场景

**症状：** 用户开启「减少动态效果」后，大部分动画停止，但 Hero 光斑漂移、背景位移、伪元素动画仍在运行。

**根因：** 仅对主动画添加了 reduced-motion 处理，伪元素（::before/::after）、background-position、filter 动画被遗漏。

**完整清单：**
```scss
@media (prefers-reduced-motion: reduce) {
  // 1. 主元素动画
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  // 2. 例外：保留瞬时反馈（opacity）
  .btn--action {
    transition: opacity 80ms ease !important; // 保留极短反馈
  }
  
  // 3. 明确关闭持续动画
  .hero__a, .hero__b, .hero__c, .hero__d {
    animation: none !important;
  }
  
  // 4. 弹层改为淡入（无位移）
  .modal__card {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
}
```

---

## 坑 8：弹层关闭时的闪烁

**症状：** 弹层点击关闭按钮后，先闪一帧白色/透明，再开始出场动画。

**根因：** React 状态更新（从 open → false）导致 DOM 立即消失，出场动画无法执行。

**防范：**
```tsx
// 使用 data-state="leaving" 延迟卸载
const [state, setState] = useState<'closed'|'entering'|'open'|'leaving'>('closed');

const closeModal = () => {
  setState('leaving');
  // 等待出场动画结束后再卸载
  setTimeout(() => setState('closed'), 280); // = $modal-exit-duration
};

// 更好的方案：用 CSS animation 的 animationend 事件
```

---

## 坑 9：Liquid Glass 在浅色内容上的对比度问题

**症状：** 浅色文字（如 `#F2F2F7`）在毛玻璃背景上，当背景内容也是浅色时，对比度不足，违反 WCAG AA（< 4.5:1）。

**防范：**
```scss
// 1. 主文字永远用深色（$ui-label-primary: #1C1C1E），不在浅色玻璃上用浅色字
// 2. 弹层顶部装饰条（spectrum bar）用深色文字区域做分隔
// 3. 使用 text-shadow 增强可读性
.modal__title {
  text-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
// 4. 定期用 WebAIM Contrast Checker 抽查关键文字对比度
```

---

## 坑 10：@starting-style 回退缺失

**症状：** 在不支持 @starting-style 的浏览器（Firefox < 129、Safari < 17.4）中，弹层入场时没有动画，直接出现。

**防范（渐进增强）：**
```scss
// 默认：@keyframes 方案（全兼容）
.modal__card {
  animation: modalIn 380ms $ease-spring-default forwards;
}

// 增强：@starting-style（支持的浏览器用更流畅的 transition）
@supports (animation: auto allow-discrete) {
  .modal__card {
    animation: none;
    opacity: 1;
    transform: translateY(0);
    transition: opacity 320ms ease-out, transform 380ms $ease-spring-default,
                display 380ms allow-discrete;
  }
  @starting-style {
    .modal__card { opacity: 0; transform: translateY(32px); }
  }
}
```

---

## RESEARCH COMPLETE
