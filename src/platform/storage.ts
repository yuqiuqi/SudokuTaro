import {
  createCourtyardWorld,
  isCourtyardWorld,
  type CourtyardWorld,
} from '../features/courtyard/world'
import {
  createCourtyardLife,
  isCourtyardLife,
  type CourtyardLife,
} from '../features/courtyard/life'
import {
  createGame,
  createSessionId,
  isSavedGame,
  type Game,
  type Language,
} from '../utils/gameplay'
import type {Difficulty} from '../utils/sudokuEngine'
import {
  createCourtyardProgress,
  isCourtyardProgress,
  type CourtyardProgress,
} from '../features/courtyard/story'
export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}
export type GameRecords = {
  wins: number
  best: Partial<Record<Difficulty, number>>
}
export const GAME_KEY = 'sudokutaro:glass:v1',
  RECORDS_KEY = 'sudokutaro:records:v1',
  COURTYARD_KEY = 'fangcun:courtyard:v1'
const browserStorage = (): StorageLike | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}
function read(
  key: string,
  storage: StorageLike | null = browserStorage(),
): unknown {
  try {
    return JSON.parse(storage?.getItem(key) || 'null')
  } catch {
    return null
  }
}
function write(
  key: string,
  value: unknown,
  storage: StorageLike | null = browserStorage(),
): boolean {
  try {
    if (!storage) return false
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
export function loadGame(storage: StorageLike | null = browserStorage()): Game {
  const raw = read(GAME_KEY, storage)
  if (!isSavedGame(raw)) return createGame()
  const game = {
    ...raw,
    history: [],
    sessionId:
      typeof raw.sessionId === 'string' && raw.sessionId.trim()
        ? raw.sessionId
        : createSessionId(),
  }
  if (game.sessionId !== raw.sessionId) persistGame(game, storage)
  return game
}
export function persistGame(
  game: Game,
  storage: StorageLike | null = browserStorage(),
): boolean {
  return write(GAME_KEY, {...game, history: []}, storage)
}
export function loadRecords(
  storage: StorageLike | null = browserStorage(),
): GameRecords {
  const r = read(RECORDS_KEY, storage) as GameRecords | null
  if (
    !r ||
    !Number.isInteger(r.wins) ||
    r.wins < 0 ||
    !r.best ||
    typeof r.best !== 'object'
  )
    return {wins: 0, best: {}}
  return {
    wins: r.wins,
    best: Object.fromEntries(
      Object.entries(r.best).filter(
        ([k, v]) =>
          ['easy', 'medium', 'hard'].includes(k) &&
          typeof v === 'number' &&
          Number.isFinite(v) &&
          v >= 0,
      ),
    ),
  }
}
export const persistRecords = (
  value: GameRecords,
  storage: StorageLike | null = browserStorage(),
) => write(RECORDS_KEY, value, storage)
export function loadLanguage(
  storage: StorageLike | null = browserStorage(),
): Language {
  try {
    return storage?.getItem('sudokutaro:language') === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}
export function persistLanguage(
  value: Language,
  storage: StorageLike | null = browserStorage(),
): boolean {
  try {
    if (!storage) return false
    storage.setItem('sudokutaro:language', value)
    return true
  } catch {
    return false
  }
}
export function loadVibration(
  storage: StorageLike | null = browserStorage(),
): boolean {
  try {
    return storage?.getItem('sudokutaro:vibration') === 'true'
  } catch {
    return false
  }
}
export function persistVibration(
  value: boolean,
  storage: StorageLike | null = browserStorage(),
): boolean {
  try {
    if (!storage) return false
    storage.setItem('sudokutaro:vibration', String(value))
    return true
  } catch {
    return false
  }
}
export function loadCourtyardProgress(
  storage: StorageLike | null = browserStorage(),
): CourtyardProgress {
  const p = read(COURTYARD_KEY, storage)
  return isCourtyardProgress(p) ? p : createCourtyardProgress()
}
export const persistCourtyardProgress = (
  value: CourtyardProgress,
  storage: StorageLike | null = browserStorage(),
) => write(COURTYARD_KEY, value, storage)

// Presentation receipt only: it neither reads a chapter nor awards story progress.
// In-memory fallback also prevents replay while storage is unavailable this visit.
let revealedInMemory = -1
const REVEALED_KEY = 'fangcun:courtyard:revealed:v1'
export function loadCourtyardReveal(
  storage: StorageLike | null = browserStorage(),
): number {
  const value = read(REVEALED_KEY, storage)
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 7
    ? Math.max(value, revealedInMemory)
    : revealedInMemory
}
export function persistCourtyardReveal(
  stage: number,
  storage: StorageLike | null = browserStorage(),
): boolean {
  if (!Number.isInteger(stage) || stage < 0 || stage > 7) return false
  revealedInMemory = Math.max(revealedInMemory, stage)
  return write(REVEALED_KEY, revealedInMemory, storage)
}

export const WORLD_KEY = 'fangcun:courtyard:world:v1',
  LIFE_KEY = 'fangcun:courtyard-life:v1'
export function loadCourtyardWorld(
  storage: StorageLike | null = browserStorage(),
): CourtyardWorld {
  const w = read(WORLD_KEY, storage)
  return isCourtyardWorld(w) ? w : createCourtyardWorld()
}
export const persistCourtyardWorld = (
  world: CourtyardWorld,
  storage: StorageLike | null = browserStorage(),
) => write(WORLD_KEY, world, storage)
export function loadCourtyardLife(
  storage: StorageLike | null = browserStorage(),
): CourtyardLife {
  const l = read(LIFE_KEY, storage)
  return isCourtyardLife(l) ? l : createCourtyardLife()
}
export const persistCourtyardLife = (
  life: CourtyardLife,
  storage: StorageLike | null = browserStorage(),
) => write(LIFE_KEY, life, storage)
let lifeRevealedInMemory = 0
const LIFE_REVEALED_KEY = 'fangcun:courtyard-life:revealed:v1'
export function loadCourtyardLifeReveal(
  storage: StorageLike | null = browserStorage(),
): number {
  const n = read(LIFE_REVEALED_KEY, storage)
  return typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 12
    ? Math.max(n, lifeRevealedInMemory)
    : lifeRevealedInMemory
}
export function persistCourtyardLifeReveal(
  count: number,
  storage: StorageLike | null = browserStorage(),
): boolean {
  if (!Number.isInteger(count) || count < 0 || count > 12) return false
  lifeRevealedInMemory = Math.max(lifeRevealedInMemory, count)
  return write(LIFE_REVEALED_KEY, lifeRevealedInMemory, storage)
}
