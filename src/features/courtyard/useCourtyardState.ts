import {useCallback, useEffect, useRef, useState} from 'react'
import {
  loadCourtyardProgress,
  loadCourtyardLife,
  loadCourtyardWorld,
  loadCourtyardReveal,
  loadCourtyardLifeReveal,
  persistCourtyardProgress,
  persistCourtyardLife,
  persistCourtyardWorld,
  persistCourtyardReveal,
  persistCourtyardLifeReveal,
} from '../../platform/storage'
import {markChapterRead} from './story'
import {
  applyCourtyardCompletion,
  markLifeNoteRead,
  type CourtyardCompletionState,
} from './life'
import {selectAtmosphere, setWorldMotion, setFavoriteObject} from './world'
import {chapters} from './chapters'
import {lifeNotes} from './lifeNotes'
export type CourtyardPresentation = {
  mainToken: string | null
  lifeToken: string | null
}
/** One in-memory authority for completion routing. IO lives outside pure updaters. */
export function useCourtyardState() {
  const [completion, setCompletion] = useState<CourtyardCompletionState>(
    () => ({progress: loadCourtyardProgress(), life: loadCourtyardLife()}),
  )
  const [world, setWorld] = useState(loadCourtyardWorld)
  const [failures, setFailures] = useState({
    progress: false,
    life: false,
    world: false,
    mainReceipt: false,
    lifeReceipt: false,
  })
  const snapshot = useRef(completion)
  snapshot.current = completion
  const receipts = useRef<{main: number; life: number}>()
  if (!receipts.current)
    receipts.current = {
      main: loadCourtyardReveal(),
      life: loadCourtyardLifeReveal(),
    }
  useEffect(() => {
    const failed = !persistCourtyardProgress(completion.progress)
    setFailures((f) => ({...f, progress: failed}))
  }, [completion.progress])
  useEffect(() => {
    const failed = !persistCourtyardLife(completion.life)
    setFailures((f) => ({...f, life: failed}))
  }, [completion.life])
  useEffect(() => {
    const failed = !persistCourtyardWorld(world)
    setFailures((f) => ({...f, world: failed}))
  }, [world])
  const complete = useCallback(
    (sessionId: string) =>
      setCompletion((s) => applyCourtyardCompletion(s, sessionId)),
    [],
  )
  const readChapter = useCallback(
    (id: string) =>
      setCompletion((s) => ({...s, progress: markChapterRead(s.progress, id)})),
    [],
  )
  const readLifeNote = useCallback(
    (id: string) =>
      setCompletion((s) => ({...s, life: markLifeNoteRead(s.life, id)})),
    [],
  )
  const setMode = useCallback(
    (mode: 'story' | 'sudoku') =>
      setCompletion((s) =>
        s.progress.mode === mode ? s : {...s, progress: {...s.progress, mode}},
      ),
    [],
  )
  const chooseAtmosphere = useCallback(
    (value: string) => setWorld((w) => selectAtmosphere(w, value)),
    [],
  )
  const chooseMotion = useCallback(
    (value: string) => setWorld((w) => setWorldMotion(w, value)),
    [],
  )
  const chooseFavorite = useCallback((id: string | null) => {
    const upper = snapshot.current.progress.unlockedThrough
    setWorld((w) => setFavoriteObject(w, id, upper))
  }, [])
  // Called by the actual mounted courtyard, never by opening a result or scoring.
  const preparePresentation = useCallback((): CourtyardPresentation => {
    const {progress, life} = snapshot.current,
      count = life.creditedSessionIds.length,
      seen = receipts.current!
    const freshLife =
      count > seen.life && !life.readNoteIds.includes(lifeNotes[count - 1]?.id)
    const freshMain =
      progress.unlockedThrough > seen.main &&
      !progress.readChapterIds.includes(chapters[progress.unlockedThrough].id)
    const result = {
      mainToken:
        !freshLife && freshMain
          ? chapters[progress.unlockedThrough].scene
          : null,
      lifeToken: freshLife ? lifeNotes[count - 1].scene : null,
    }
    seen.main = Math.max(seen.main, progress.unlockedThrough)
    seen.life = Math.max(seen.life, count)
    const mainReceipt = !persistCourtyardReveal(seen.main),
      lifeReceipt = !persistCourtyardLifeReveal(seen.life)
    setFailures((f) => ({...f, mainReceipt, lifeReceipt}))
    return result
  }, [])
  return {
    progress: completion.progress,
    life: completion.life,
    world,
    complete,
    readChapter,
    readLifeNote,
    setMode,
    chooseAtmosphere,
    chooseMotion,
    chooseFavorite,
    preparePresentation,
    saveFailed: Object.values(failures).some(Boolean),
  }
}
