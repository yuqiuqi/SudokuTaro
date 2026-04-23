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

/**
 * Apple 向 UI 契约。样式真源为 `src/styles/_apple-ui-tokens.scss`；
 * 本对象供 TS 与文档交叉引用，修改须与 SCSS 同提交。
 */
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
  /** 与棋盘/高亮/用户填写数字一致（_apple-ui-tokens） */
  board: {
    dimBackground: 'rgba(0, 122, 255, 0.1)',
    dimBackgroundAlt: 'rgba(0, 122, 255, 0.12)',
    sameBackground: 'rgba(52, 199, 89, 0.22)',
    sameBackgroundAlt: 'rgba(52, 199, 89, 0.26)',
    badBackgroundAlt: 'rgba(255, 59, 48, 0.26)',
    userInput: '#0C7C83',
  },
  /** 顶区 hero 光斑起止色（与 index.scss 四块光斑一一对应） */
  hero: {
    a: ['#9ECFFF', '#3D8AD6'] as const,
    b: ['#FFECC7', '#E0B878'] as const,
    c: ['#C9C4EB', '#7B73B8'] as const,
    d: ['#9FE8E0', '#4AB8A8'] as const,
    blobOpacity: 0.4,
  },
  motion: {
    durationTapMs: 160,
    durationFocusMs: 200,
    durationSheetEnterMs: 360,
    durationSheetExitMs: 280,
    easeStandard: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeSheet: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  /** OS 26 / Liquid Glass 在 Web 上仅模拟：层次、半透、顶缘高光（非实时光学） */
  liquidGlassSubset: {
    contentBlurPx: 18,
    modalBlurPx: 20,
    specularNote: 'top-edge linear highlight on cards/buttons, see index.scss',
  },
  radiiPxNote: 'use rpx in SCSS — card 24rpx, btn 16rpx per UI-SPEC',
} as const
