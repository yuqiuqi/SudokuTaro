# Features Research — iOS 26 / Liquid Glass 动画、交互与组件行为

**研究日期：** 2026-04-23  
**来源：** Apple WWDC25 Session 219 "Meet Liquid Glass"、Apple HIG 2025、Apple 新闻稿、CSS-Tricks、smashingmagazine、web.dev

---

## 1. Liquid Glass 核心设计原则

### 1.1 什么是 Liquid Glass

Liquid Glass 是 Apple 随 iOS 26 / iPadOS 26 / macOS Tahoe 引入的全新材质语言。核心理念：

| 原则 | 描述 | 对本项目的意义 |
|------|------|---------------|
| **控件浮在内容上方** | Toolbar/Tab Bar/Nav 作为独立浮动层，内容在其后流动 | 弹层、设置面板需形成明确功能层 |
| **环境感知折射** | 玻璃材质随背景内容色彩实时变色（折射 + 散射） | CSS 近似：backdrop-filter + saturate |
| **动态 Specular** | 顶缘/侧缘随光照/倾斜产生镜面高光流动 | 静态 linear-gradient 近似顶缘高光 |
| **形态流动（Morphing）** | 控件按下时圆角、尺寸平滑变形 | border-radius + scale 组合动画 |
| **层次最少化** | 减少分隔线，靠材质深度区分层级 | 去掉多余边框，靠阴影+透明度分层 |

### 1.2 五大视觉层（从底到顶）

```
Layer 5: 系统覆盖层 (System Overlays)    z: 9000+
Layer 4: 模态层 (Modal / Alert)           z: 1000-8999
Layer 3: 控件层 (Controls / Tab / Toolbar) z: 100-999
Layer 2: 卡片/内容面 (Cards / Surfaces)   z: 10-99
Layer 1: 背景环境层 (Background / Canvas) z: 0-9
```

---

## 2. 组件动画时序完整规范

### 2.1 Button（按钮）

| 状态 | 触发 | 时长 | Easing | 变化 |
|------|------|------|--------|------|
| idle → pressed | touchstart | 120ms | ease-out | scale: 1 → 0.95，opacity: 1 → 0.88，specular 向心收缩 |
| pressed → released（正常松手） | touchend | 240ms | spring(stiffness:400,damping:28) | scale: 0.95 → 1.03 → 1.0，opacity 0.88 → 1 |
| pressed → released（滑出取消） | touchend outside | 180ms | ease-out | scale → 1.0，opacity → 1，无回弹 |
| idle → hover（桌面） | mouseenter | 80ms | ease-out | opacity: 1 → 0.92，轻微高光提亮 |
| any → disabled | prop change | 200ms | ease | opacity → 0.38，scale → 1，pointer-events: none |

**Specular 高光行为：** 按下时 `::after` 伪元素从顶缘向中心收缩（宽度 80% → 40%，opacity 0.4 → 0.1）；松手时弹回并有短暂闪亮（opacity peak 0.6 at 80ms 后恢复 0.4）。

### 2.2 Modal / Sheet（弹层）

| 状态 | 时长 | Easing | 变化 |
|------|------|--------|------|
| 入场（从底部） | 380ms | cubic-bezier(0.32, 0.72, 0, 1) | translateY(100%) → 0，opacity: 0.5 → 1，blur 从 0 → 18px（同步） |
| 入场（淡入+上移） | 320ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) | translateY(32rpx) → 0，opacity: 0 → 1 |
| 出场（向下） | 280ms | cubic-bezier(0.55, 0, 1, 0.45) | translateY(0) → 60%，opacity → 0.3 |
| 背景蒙层入场 | 300ms | ease-out | opacity: 0 → 1，backdrop-filter: blur(0) → blur(8px) |
| 背景蒙层出场 | 220ms | ease-in | opacity → 0 |
| 圆角形态变化 | 与主动画同步 | — | 从屏幕边缘矩形（r:0）→ 弹层圆角（r:24rpx） |

### 2.3 Tab Bar / Navigation（导航）

| 交互 | 时长 | 变化 |
|------|------|------|
| Tab 切换激活态 | 200ms ease-out | 激活 indicator 从前一项 spring 滑动，宽度 morph |
| 页面进入 Tab | 跟随页面切换 | Tab Bar 自身保持固定，不参与过渡 |
| 向下滚动时 Tab Bar 收缩 | 300ms ease | height 缩小，icon 保留，label 淡出 |

### 2.4 选择格 / Cell（数独格）

| 状态 | 时长 | Easing | 变化 |
|------|------|--------|------|
| 选中（tap） | 140ms | ease-out | 背景色从透明 → accent-tint，scale: 1 → 0.96 → 1.0（有回弹） |
| 高亮同数字 | 180ms | ease-out | 背景色涟漪扩散（逐格 delay: n*8ms） |
| 冲突提示 | 220ms | cubic-bezier(0.36, 0.07, 0.19, 0.97) | 轻微 X 方向 shake（±4rpx，3次），背景变红 tint |
| 冲突消除 | 300ms | ease-out | 背景色淡出，scale 回弹 |

### 2.5 Switch 开关

| 状态 | 时长 | 变化 |
|------|------|------|
| off → on | 280ms spring | track 背景色从 neutral → accent，thumb 从左 → 右（spring 回弹），thumb 宽度在运动中略微压扁（squash） |
| on → off | 240ms spring | 反向，thumb 在运动中略拉长（stretch） |

### 2.6 Toast / Alert

| 类型 | 入场 | 出场 |
|------|------|------|
| Toast（顶部） | 从上方 translateY(-120%) → 0，300ms spring，blur 0 → 12px | 240ms ease-in，translateY(-120%)，opacity → 0 |
| Alert（居中模态） | scale(0.8) + opacity(0) → 1，240ms cubic-bezier(0.34,1.56,0.64,1)（小量 overshoot） | scale(0.95) + opacity → 0，160ms ease-in |

### 2.7 通关弹窗（胜利 Modal）

| 元素 | 入场顺序 | 时长 | 动效 |
|------|---------|------|------|
| 蒙层 | 0ms | 300ms | 淡入 + blur |
| 卡片 | 40ms delay | 380ms | 底部 spring 上移 |
| 标题文字 | 120ms delay | 260ms | fade + translateY(8rpx) |
| 统计数字 | 200ms delay | 200ms | 数字滚动（0 → 实际值）|
| 按钮 | 300ms delay | 180ms | fade-in |

---

## 3. Spring 弹性曲线参数映射

### 3.1 iOS 26 常用 Spring 预设

| 名称 | 用途 | mass | stiffness | damping | CSS cubic-bezier 近似 |
|------|------|------|-----------|---------|----------------------|
| **snappy**（快弹） | 按钮按下回弹、格子选中 | 1 | 400 | 28 | `cubic-bezier(0.34, 1.28, 0.64, 1)` |
| **default**（标准） | 弹层入场、导航切换 | 1 | 300 | 30 | `cubic-bezier(0.32, 0.72, 0, 1)` |
| **gentle**（温和） | 大尺寸元素、页面过渡 | 1 | 200 | 28 | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| **stiff**（硬弹） | 错误/警告的 shake | 1 | 600 | 20 | `cubic-bezier(0.36, 0.07, 0.19, 0.97)` |

### 3.2 CSS linear() 模拟（Chrome 117+、Safari 18+）

```css
/* 标准 spring bounce 用 linear() 8 帧模拟 */
--spring-snappy: linear(
  0, 0.694 15%, 1.099 28%, 1.202 33%,
  1.218 35%, 1.16 45%, 1.022 59%,
  0.985 66%, 0.996 76%, 1 100%
);
```

---

## 4. 交互五态完整规范

| 状态 | opacity | scale | blur | shadow | 圆角 |
|------|---------|-------|------|--------|------|
| **idle** | 1.0 | 1.0 | 18px | elevation-md | 正常 |
| **hover**（桌面） | 0.92 | 1.0 | 18px | elevation-lg | 正常 |
| **pressed** | 0.88 | 0.95 | 18px | elevation-sm | 正常→轻微增大 |
| **focused** | 1.0 | 1.0 | 18px | elevation-md + focus-ring | 正常 |
| **disabled** | 0.38 | 1.0 | 12px（减弱） | none | 正常 |

**Focus Ring（焦点环）：** 2px solid accent，offset 2px，border-radius 同元素，过渡时间 100ms。

---

## 5. Liquid Glass 材质行为（可实现子集）

### 5.1 CSS 近似参数（H5 可实现）

```css
.liquid-glass-surface {
  /* 材质基底 */
  background: rgba(255,255,255, 0.55);
  backdrop-filter: blur(18px) saturate(1.8) brightness(1.02);
  -webkit-backdrop-filter: blur(18px) saturate(1.8) brightness(1.02);
  
  /* 边框：顶缘高光 + 细描边 */
  border: 1px solid rgba(255,255,255, 0.65);
  
  /* 顶缘 specular 高光（伪元素） */
  /* ::before: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%) */
  /* height: 40%, top: 0, border-radius: inherit */
  
  /* 景深阴影 */
  box-shadow:
    0 2px 8px rgba(0,0,0, 0.08),
    0 8px 32px rgba(0,0,0, 0.12),
    0 32px 64px rgba(0,0,0, 0.08);
}
```

### 5.2 无 backdrop-filter 时的实色回退（已实现 @supports not）

```css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .liquid-glass-surface {
    background: rgba(255,255,255, 0.96);
    border: 1px solid rgba(0,0,0, 0.08);
  }
}
```

### 5.3 明确不做（本项目范围外）

- 实时光学折射（需 WebGL / Metal）
- 与壁纸的实时色彩联动（需系统 API）
- 动态 specular 随设备倾斜变化（需 DeviceMotion）

---

## 6. 视差与层次感

| 层 | 滚动行为 | 按下行为 |
|----|---------|---------|
| 背景光斑（Hero） | 慢速视差（0.6x 速度） | 无反应 |
| 内容卡片 | 正常滚动 | 轻微 scale down |
| 操作按钮行 | 固定（sticky） | 按下 scale 明显 |
| 弹层 | 固定（fixed） | 背景内容模糊加深 |

---

## RESEARCH COMPLETE

**关键数值总结：**
- 按钮按下：120ms ease-out，scale 0.95，opacity 0.88
- 按钮回弹：240ms spring(400,28)，scale 1.03→1.0
- 弹层入场：380ms cubic-bezier(0.32,0.72,0,1)
- 弹层出场：280ms cubic-bezier(0.55,0,1,0.45)
- 格子选中：140ms ease-out，scale 0.96→1.0 回弹
- 冲突 shake：220ms cubic-bezier(0.36,0.07,0.19,0.97)
