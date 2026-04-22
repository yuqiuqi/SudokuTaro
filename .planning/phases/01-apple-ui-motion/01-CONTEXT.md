# Phase 1 — Discussion Context（摘录）

**来源：** 用户在一次消息中给出的偏好，供 planner / implementer 引用。

## 美学与交互

- 偏好 **Apple 设备上的交互与视觉习惯**：清晰层级、跟手、系统感。
- 特别强调 **系统画面与动画**（用户以「OS 26」表述；实现上对齐 **当代 Apple Human Interface 方向**：材质分层、弹性过渡、克制装饰）。
- 需尊重 **`prefers-reduced-motion`**。

## 技术边界

- 栈保持 **Taro + Sass + rpx**；不强制引入 shadcn/Radix。
- 参考仓库：`src/pages/index/index.tsx`、`index.scss`、`src/utils/theme.ts`。
