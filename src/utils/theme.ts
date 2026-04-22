/**
 * Figma-inspired tokens (awesome-design-md design-md/figma/DESIGN.md)
 */
export const figma = {
  black: '#000000',
  white: '#FFFFFF',
  glassDark: 'rgba(0, 0, 0, 0.08)',
  glassLight: 'rgba(255, 255, 255, 0.16)',
  hero: {
    green: '#00FF88',
    yellow: '#FFF200',
    purple: '#8B00FF',
    pink: '#FF00AA',
  },
} as const

/** Apple 向 UI 契约（与 `01-UI-SPEC.md`、`_ui-tokens.scss` 对齐） */
export const appleUi = {
  color: {
    bg: '#F5F2EB',
    surface: '#FFFFFF',
    separator: '#E5E5EA',
    labelPrimary: '#1C1C1E',
    labelSecondary: '#8E8E93',
    accent: '#007AFF',
    destructive: '#FF3B30',
    conflictTint: 'rgba(255, 59, 48, 0.22)',
  },
  motion: {
    durationTapMs: 160,
    durationFocusMs: 200,
    durationSheetEnterMs: 360,
    durationSheetExitMs: 280,
    easeStandard: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeSheet: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  radiiPxNote: 'use rpx in SCSS — card 24rpx, btn 16rpx per UI-SPEC',
} as const
