import type {CSSProperties} from 'react'
import type {Language} from '../../utils/gameplay'
import {GameIcon} from './GameIcon'
import {LanguageSwitch} from './LanguageSwitch'
import './VictoryResult.scss'

type Props = {
  en: boolean
  board: number[][]
  elapsed: string
  hints: number
  moves: number
  usedNotes: boolean
  newBest: boolean
  onLanguage: (language: Language) => void
  onClose: () => void
  onViewBoard: () => void
  onPlayAgain: () => void
}

export function VictoryResult(p: Props) {
  const text = (zh: string, en: string) => (p.en ? en : zh)
  return (
    <div className="victory-result">
      <aside
        className="victory-board-preview"
        aria-label={text('完成的棋盘', 'Completed board')}
      >
        <div
          className="victory-mini-board"
          role="img"
          aria-label={text('九宫格已全部完成', 'All nine boxes completed')}
        >
          {p.board.flatMap((row, r) =>
            row.map((n, c) => (
              <span
                key={r * 9 + c}
                aria-hidden="true"
                className={`${c === 2 || c === 5 ? 'mini-box-right' : ''} ${r === 2 || r === 5 ? 'mini-box-bottom' : ''}`}
              >
                {n}
              </span>
            )),
          )}
        </div>
        <p>{text('属于你的答案', 'Your completed board')}</p>
      </aside>
      <div className="victory-content">
        <div className="dialog-top">
          <LanguageSwitch lang={p.en ? 'en' : 'zh'} onChange={p.onLanguage} />
          <button
            type="button"
            className="text-button close-button"
            aria-label={text('关闭', 'Close')}
            onClick={p.onClose}
          >
            <GameIcon name="close" />
          </button>
        </div>
        <header className="victory-hero">
          <div className="victory-emblem" aria-hidden="true">
            <GameIcon name="check" />
          </div>
          <div className="victory-heading">
            <span className="victory-eyebrow">
              {text('数独完成', 'PUZZLE COMPLETE')}
            </span>
            <h1 id="dialog-title">
              {text('漂亮，解开了！', 'Beautifully solved!')}
            </h1>
            {p.newBest && (
              <span className="victory-record">
                <GameIcon name="check" />
                {text('新的个人用时纪录', 'A new personal best')}
              </span>
            )}
          </div>
        </header>
        <p className="victory-subtitle">
          {text(
            '每一步思考，都在这里开花。',
            'Your thoughtful steps brought it all together.',
          )}
        </p>
        <div className="result-metrics">
          <div>
            <strong>{p.elapsed}</strong>
            <span>{text('用时', 'Time')}</span>
          </div>
          <div>
            <strong>{p.hints}</strong>
            <span>{text('次提示', 'Hints')}</span>
          </div>
          <div>
            <strong>{p.moves}</strong>
            <span>{text('次落笔', 'Entries')}</span>
          </div>
        </div>
        <p className="achievement-copy">
          {p.hints === 0
            ? text(
                '独立完成，这份答案属于你。',
                'Solved independently. This achievement is yours.',
              )
            : text(
                '借助线索，亲手完成。',
                'Guided by clues, completed by you.',
              )}
          {p.usedNotes &&
            text(
              ' 也练习了候选数推理。',
              ' Candidate reasoning practiced, too.',
            )}
        </p>
        <div className="victory-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={p.onViewBoard}
          >
            {text('欣赏棋盘', 'Admire board')}
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={p.onPlayAgain}
          >
            {text('再挑战一局', 'Play again')}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Deterministic decorative particles, never part of the board's hit targets. */
export function VictorySparkles() {
  return (
    <div className="victory-sparkles" aria-hidden="true">
      {Array.from({length: 18}, (_, i) => (
        <i
          key={i}
          style={
            {
              '--spark-x': `${8 + ((i * 29) % 84)}%`,
              '--spark-y': `${15 + ((i * 19) % 70)}%`,
              '--spark-drift': `${((i % 3) - 1) * 18}px`,
              '--spark-delay': `${(i % 6) * 45}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

// Percent coordinates track the live CSS grid without measuring or moving cells.
// No viewBox: stroke widths and corner radius stay in physical CSS pixels.
export function VictorySeams({onEnd}: {onEnd: () => void}) {
  const lines = Array.from({length: 8}, (_, i) => i + 1)
  return (
    <svg
      className="victory-seams"
      aria-hidden="true"
      focusable="false"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName === 'victory-seam-light')
          onEnd()
      }}
    >
      {['bloom', 'emission', 'core'].map((layer) => (
        <g className={`seam-${layer}`} key={layer}>
          <rect width="100%" height="100%" />
          {lines.map((i) => (
            <g key={i}>
              <line data-seam={i} data-axis="x" x1={`${i * 100 / 9}%`} x2={`${i * 100 / 9}%`} y1="0" y2="100%" />
              <line data-seam={i} data-axis="y" y1={`${i * 100 / 9}%`} y2={`${i * 100 / 9}%`} x1="0" x2="100%" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  )
}
