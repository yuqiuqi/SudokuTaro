import type {CSSProperties} from 'react'
import {
  cellLocation,
  peers,
  DIGITS,
  UNITS,
  type Game,
  type Language,
} from '../../utils/gameplay'
type Props = {
  game: Game
  focus: number | null
  selected: number | null
  conflicts: number[]
  hintUnit: number[] | null
  lang: Language
  inkFeedback: {cell: number; units: number[]} | null
  choose: (index: number) => void
}
/** Native cells retain their semantics independently of session and screen state. */
export function GameBoardCells({
  game,
  focus,
  selected,
  conflicts,
  hintUnit,
  lang,
  inkFeedback,
  choose,
}: Props) {
  const say = (zh: string, en: string) => (lang === 'en' ? en : zh)
  return (
    <>
      {game.board.flatMap((row, r) =>
        row.map((value, c) => {
          const index = r * 9 + c,
            fixed = game.initial[r][c] !== 0
          const sel = !fixed && focus === index,
            related = focus !== null && peers(focus, index)
          const same =
            selected !== null &&
            value !== 0 &&
            value === game.board[Math.floor(selected / 9)][selected % 9]
          return (
            <button
              type="button"
              key={index}
              data-cell={index}
              style={
                {
                  '--celebration-order': r + c,
                  '--wave-hue': (c * 40 + r * 6) % 360,
                } as CSSProperties
              }
              data-fixed={fixed}
              disabled={fixed}
              className={[
                'sudoku-cell',
                inkFeedback?.cell === index ? 'has-ink-feedback' : '',
                inkFeedback?.units.some((u) => UNITS[u].includes(index))
                  ? 'has-unit-feedback'
                  : '',
                related ? 'is-related' : '',
                same ? 'is-same' : '',
                sel ? 'is-selected' : '',
                conflicts.includes(index) ? 'is-conflict' : '',
                hintUnit?.includes(index) ? 'is-hint-unit' : '',
                fixed ? 'is-given' : 'is-user',
                c === 2 || c === 5 ? 'box-right' : '',
                r === 2 || r === 5 ? 'box-bottom' : '',
              ].join(' ')}
              aria-label={`${cellLocation(index, lang)}: ${value || say('空格', 'empty')}${fixed ? say('，题目给定', ', given') : ''}${!value && game.notes[index].length ? `${say('，候选数', ', notes ')} ${game.notes[index].join(', ')}` : ''}`}
              aria-pressed={!fixed && selected === index}
              onClick={() => choose(index)}
            >
              {value ? (
                <span className="cell-digit">{value}</span>
              ) : (
                <span className="cell-notes" aria-hidden="true">
                  {DIGITS.map((n) => (
                    <span key={n}>
                      {game.notes[index].includes(n) ? n : ''}
                    </span>
                  ))}
                </span>
              )}
            </button>
          )
        }),
      )}
    </>
  )
}
