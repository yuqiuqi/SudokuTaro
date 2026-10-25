import {useEffect, useState} from 'react'

/** Share the live system preference across the board and tutorial. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(preference.matches)
    preference.addEventListener('change', update)
    update()
    return () => preference.removeEventListener('change', update)
  }, [])
  return reduced
}
