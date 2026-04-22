/** 难度与引擎一致 */
export type Difficulty = 'easy' | 'medium' | 'hard'

/** 9×9 数独网格，0 表示空 */
export type Grid = number[][]

/** 选中格 */
export interface SelectedCell {
  row: number
  col: number
}

/** 撤销历史一项 */
export interface HistoryItem {
  row: number
  col: number
  value: number
}

/** 数字键松手回弹 */
export interface NumReleaseAnim {
  num: number
  start: number
  duration: number
}

/** 布局：难度胶囊 */
export interface PillRect {
  diff: Difficulty
  x: number
  y: number
  w: number
  h: number
}

/** 布局：底部操作按钮 */
export type ActionKind = 'undo' | 'erase' | 'newgame'

export interface ActionRect {
  kind: ActionKind
  x: number
  y: number
  w: number
  h: number
  label: string
}

/** 棋盘区域 */
export interface BoardLayout {
  left: number
  top: number
  size: number
  radius: number
}

/** 数字键区域 */
export interface NumKeyRect {
  num: number
  x: number
  y: number
  w: number
  h: number
}

/** 顶部「玩法说明 / 设置」胶囊 */
export interface MetaButtonLayout {
  x: number
  y: number
  w: number
  h: number
}

/** 布局结果（getLayout） */
export interface LayoutResult {
  W: number
  H: number
  dpr: number
  topInset: number
  bottomInset: number
  usableH: number
  heroTop: number
  heroH: number
  padX: number
  maxW: number
  monoY: number
  titleY: number
  statsY: number
  /** meta 按钮行（玩法说明 / 设置）起始 Y */
  metaTopY: number
  metaH: number
  metaHelp: MetaButtonLayout
  metaSettings: MetaButtonLayout
  pills: PillRect[]
  actions: ActionRect[]
  board: BoardLayout
  nums: NumKeyRect[]
  compact: boolean
  modal: { mw: number; mh: number }
}

/** 命中测试（弹窗） */
export type HitModal =
  | { kind: 'modal_again' }
  | { kind: 'modal_close' }
  | { kind: 'modal_ignore' }
  | { kind: 'help_close' }
  | { kind: 'help_mask' }
  | { kind: 'help_content' }
  | { kind: 'settings_close' }
  | { kind: 'settings_mask' }
  | { kind: 'set_vibration' }

/** 命中测试（主界面） */
export type HitMain =
  | { kind: 'diff'; diff: Difficulty }
  | { kind: ActionKind }
  | { kind: 'cell'; row: number; col: number }
  | { kind: 'num'; num: number }
  | { kind: 'meta_help' }
  | { kind: 'meta_settings' }

export type HitResult = HitModal | HitMain | null

/** 数字键按下配色（仅 p0/p1/sp） */
export interface NumKeyPaletteHex {
  p0: string
  p1: string
  sp: string
}

/** RGB */
export interface Rgb {
  r: number
  g: number
  b: number
}

/** 数字键 idle 玻璃态 */
export interface NumKeyIdleStyle {
  n0: string
  n1: string
  strokeN: string
  text: string
}

/** 光斑缓存项 */
export interface HeroBlobItem {
  g: CanvasGradient
  cx: number
  cy: number
  rx: number
  ry: number
}

/** 游戏运行时状态 */
export interface GameState {
  difficulty: Difficulty
  solution: Grid
  board: Grid
  initialBoard: Grid
  selected: SelectedCell | null
  history: HistoryItem[]
  seconds: number
  steps: number
  conflictCells: Set<number>
  highlightNum: number | null
  wonOpen: boolean
  conflictTimer: ReturnType<typeof setTimeout> | null
  timerId: ReturnType<typeof setInterval> | null
  numPressed: number | null
  numReleaseAnim: NumReleaseAnim | null
  helpOpen: boolean
  settingsOpen: boolean
  /** 玩法说明正文滚动偏移（像素） */
  helpScrollY: number
  /** 底部操作键按下中（用于视觉反馈） */
  actionPressed: ActionKind | null
}

/** 布局缓存 */
export interface LayoutCache {
  key: string
  L: LayoutResult | null
}

/** 渐变缓存 */
export interface SizeGradientCache {
  w: number
  h: number
  g: CanvasGradient | null
}

/** 光斑缓存 */
export interface HeroBlobCache {
  key: string
  items: HeroBlobItem[] | null
}
