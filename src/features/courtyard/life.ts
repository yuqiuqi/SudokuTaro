import {
  advanceCourtyard,
  isCourtyardProgress,
  type CourtyardProgress,
} from './story'
export const LIFE_NOTE_IDS = Array.from(
  {length: 12},
  (_, i) => `courtyard-life-${String(i + 1).padStart(2, '0')}`,
)
export type CourtyardLife = {
  version: 1
  creditedSessionIds: string[]
  readNoteIds: string[]
}
export type CourtyardCompletionState = {
  progress: CourtyardProgress
  life: CourtyardLife
}
export function createCourtyardLife(): CourtyardLife {
  return {version: 1, creditedSessionIds: [], readNoteIds: []}
}
export function isCourtyardLife(raw: unknown): raw is CourtyardLife {
  if (!raw || typeof raw !== 'object') return false
  const l = raw as CourtyardLife
  return (
    l.version === 1 &&
    Array.isArray(l.creditedSessionIds) &&
    l.creditedSessionIds.length <= 12 &&
    l.creditedSessionIds.every(
      (id) => typeof id === 'string' && id.trim().length > 0,
    ) &&
    new Set(l.creditedSessionIds).size === l.creditedSessionIds.length &&
    Array.isArray(l.readNoteIds) &&
    l.readNoteIds.every(
      (id) =>
        LIFE_NOTE_IDS.indexOf(id) >= 0 &&
        LIFE_NOTE_IDS.indexOf(id) < l.creditedSessionIds.length,
    ) &&
    new Set(l.readNoteIds).size === l.readNoteIds.length
  )
}
export function markLifeNoteRead(l: CourtyardLife, id: string): CourtyardLife {
  const i = LIFE_NOTE_IDS.indexOf(id)
  return i < 0 || i >= l.creditedSessionIds.length || l.readNoteIds.includes(id)
    ? l
    : {...l, readNoteIds: [...l.readNoteIds, id]}
}
/** One completion can enter only one domain, using its state before the event. */
export function applyCourtyardCompletion(
  state: CourtyardCompletionState,
  sessionId: string,
): CourtyardCompletionState {
  const {progress, life} = state
  if (
    !isCourtyardProgress(progress) ||
    !isCourtyardLife(life) ||
    typeof sessionId !== 'string' ||
    !sessionId.trim() ||
    progress.creditedSessionIds.includes(sessionId) ||
    life.creditedSessionIds.includes(sessionId)
  )
    return state
  if (progress.unlockedThrough < 7)
    return {...state, progress: advanceCourtyard(progress, sessionId)}
  return life.creditedSessionIds.length >= 12
    ? state
    : {
        ...state,
        life: {
          ...life,
          creditedSessionIds: [...life.creditedSessionIds, sessionId],
        },
      }
}
