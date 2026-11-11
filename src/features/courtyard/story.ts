export const CHAPTER_IDS = Array.from(
  {length: 8},
  (_, i) => `courtyard-${String(i + 1).padStart(2, '0')}`,
)
export type CourtyardProgress = {
  version: 1
  unlockedThrough: number
  readChapterIds: string[]
  creditedSessionIds: string[]
  mode: 'story' | 'sudoku'
}
export function createCourtyardProgress(): CourtyardProgress {
  return {
    version: 1,
    unlockedThrough: 0,
    readChapterIds: [],
    creditedSessionIds: [],
    mode: 'story',
  }
}
export function isCourtyardProgress(raw: unknown): raw is CourtyardProgress {
  if (!raw || typeof raw !== 'object') return false
  const p = raw as CourtyardProgress
  return (
    p.version === 1 &&
    Number.isInteger(p.unlockedThrough) &&
    p.unlockedThrough >= 0 &&
    p.unlockedThrough <= 7 &&
    ['story', 'sudoku'].includes(p.mode) &&
    Array.isArray(p.readChapterIds) &&
    p.readChapterIds.every(
      (id) =>
        CHAPTER_IDS.indexOf(id) >= 0 &&
        CHAPTER_IDS.indexOf(id) <= p.unlockedThrough,
    ) &&
    new Set(p.readChapterIds).size === p.readChapterIds.length &&
    Array.isArray(p.creditedSessionIds) &&
    p.creditedSessionIds.length === p.unlockedThrough &&
    p.creditedSessionIds.every(
      (id) => typeof id === 'string' && id.trim().length > 0,
    ) &&
    new Set(p.creditedSessionIds).size === p.creditedSessionIds.length
  )
}
export function advanceCourtyard(
  p: CourtyardProgress,
  sessionId: string,
): CourtyardProgress {
  if (
    !isCourtyardProgress(p) ||
    typeof sessionId !== 'string' ||
    !sessionId.trim() ||
    p.unlockedThrough >= 7 ||
    p.creditedSessionIds.includes(sessionId)
  )
    return p
  return {
    ...p,
    unlockedThrough: p.unlockedThrough + 1,
    creditedSessionIds: [...p.creditedSessionIds, sessionId],
  }
}
export function markChapterRead(
  p: CourtyardProgress,
  chapterId: string,
): CourtyardProgress {
  const index = CHAPTER_IDS.indexOf(chapterId)
  return index < 0 ||
    index > p.unlockedThrough ||
    p.readChapterIds.includes(chapterId)
    ? p
    : {...p, readChapterIds: [...p.readChapterIds, chapterId]}
}
