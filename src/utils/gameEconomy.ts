import Taro from '@tarojs/taro'

/** 本地存档版本，字段变更时可 bump 并做迁移 */
const STORAGE_KEY = 'yifang_sudoku_economy_v1'

export const INITIAL_UNDO_PROPS = 5
export const INITIAL_ERASE_PROPS = 5
export const MAX_PROP = 99
/** 每日首次进入赠送 */
export const DAILY_UNDO_GRANT = 2
export const DAILY_ERASE_GRANT = 2

export interface GameSettings {
  /** 按下数字键时是否轻震动 */
  vibration: boolean
}

export interface GameEconomyState {
  undoProps: number
  eraseProps: number
  /** 上次领取每日赠送的日期 YYYY-MM-DD */
  dailyDateKey: string
  settings: GameSettings
}

const defaultSettings: GameSettings = {
  vibration: true,
}

function todayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function defaultState(): GameEconomyState {
  return {
    undoProps: INITIAL_UNDO_PROPS,
    eraseProps: INITIAL_ERASE_PROPS,
    dailyDateKey: '',
    settings: {...defaultSettings},
  }
}

export function loadEconomy(): GameEconomyState {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY) as string | GameEconomyState | undefined
    if (raw == null || raw === '') {
      return defaultState()
    }
    const obj = typeof raw === 'string' ? (JSON.parse(raw) as Partial<GameEconomyState>) : raw
    const base = defaultState()
    return {
      undoProps: clampNum(obj.undoProps, 0, MAX_PROP, base.undoProps),
      eraseProps: clampNum(obj.eraseProps, 0, MAX_PROP, base.eraseProps),
      dailyDateKey: typeof obj.dailyDateKey === 'string' ? obj.dailyDateKey : base.dailyDateKey,
      settings: {
        vibration: obj.settings?.vibration ?? base.settings.vibration,
      },
    }
  } catch {
    return defaultState()
  }
}

function clampNum(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' && !Number.isNaN(v) ? v : fallback
  return Math.min(max, Math.max(min, n))
}

export function saveEconomy(state: GameEconomyState): void {
  try {
    Taro.setStorageSync(STORAGE_KEY, state)
  } catch {
    /* ignore */
  }
}

/** 跨天时增加撤销/擦除道具各若干 */
export function applyDailyBonus(state: GameEconomyState): GameEconomyState {
  const today = todayKey()
  if (state.dailyDateKey === today) {
    return state
  }
  return {
    ...state,
    dailyDateKey: today,
    undoProps: Math.min(MAX_PROP, state.undoProps + DAILY_UNDO_GRANT),
    eraseProps: Math.min(MAX_PROP, state.eraseProps + DAILY_ERASE_GRANT),
  }
}

export function tryConsumeUndoProp(state: GameEconomyState): {ok: boolean; next: GameEconomyState} {
  if (state.undoProps < 1) {
    return {ok: false, next: state}
  }
  return {ok: true, next: {...state, undoProps: state.undoProps - 1}}
}

export function tryConsumeEraseProp(state: GameEconomyState): {ok: boolean; next: GameEconomyState} {
  if (state.eraseProps < 1) {
    return {ok: false, next: state}
  }
  return {ok: true, next: {...state, eraseProps: state.eraseProps - 1}}
}

export function mergeSettings(
  state: GameEconomyState,
  patch: Partial<GameSettings>,
): GameEconomyState {
  return {
    ...state,
    settings: {...state.settings, ...patch},
  }
}
