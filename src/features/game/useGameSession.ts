import {useEffect, useState} from 'react'
import {loadGame, persistGame} from '../../platform/storage'
/** Own the current session and clock. Opening a screen pauses this session. */
export function useGameSession(paused: boolean) {
  const [game, setGame] = useState(loadGame)
  const [saveFailed, setSaveFailed] = useState(false)
  useEffect(() => {
    setSaveFailed(!persistGame(game))
  }, [game])
  useEffect(() => {
    if (game.won || paused) return
    const id = setInterval(() => {
      if (!document.hidden)
        setGame((g) => (g.won ? g : {...g, seconds: g.seconds + 1}))
    }, 1000)
    return () => clearInterval(id)
  }, [game.won, paused])
  return {game, setGame, saveFailed}
}
