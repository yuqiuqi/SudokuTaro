import {useCallback, useEffect, useRef, useState} from 'react'
/** Presentation only: scoring and story credit never depend on animation callbacks. */
export function useVictoryFlow(
  reduced: boolean,
  blocked: boolean,
  onFinish: () => void,
) {
  const [celebration, setCelebration] = useState<'wave' | 'seams' | null>(null)
  const celebrationRef = useRef(celebration)
  celebrationRef.current = celebration
  const callback = useRef(onFinish)
  callback.current = onFinish
  const finishCelebration = useCallback(() => {
    if (!celebrationRef.current) return
    celebrationRef.current = null
    setCelebration(null)
    callback.current()
  }, [])
  useEffect(() => {
    if (!celebration) return
    if (blocked) {
      celebrationRef.current = null
      setCelebration(null)
    } else if (reduced || document.hidden) finishCelebration()
  }, [celebration, blocked, reduced, finishCelebration])
  useEffect(() => {
    const change = () => {
      if (document.hidden) finishCelebration()
    }
    document.addEventListener('visibilitychange', change)
    return () => document.removeEventListener('visibilitychange', change)
  }, [finishCelebration])
  return {celebration, setCelebration, celebrationRef, finishCelebration}
}
