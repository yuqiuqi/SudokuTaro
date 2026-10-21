import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {CSSProperties} from 'react'
import type {Difficulty} from '../../utils/sudokuEngine'
import {
  cellLocation,
  completedUnits,
  createGame,
  DIGITS,
  findHint,
  hintSteps,
  isSavedGame,
  move,
  peers,
  undoMove,
  UNITS,
  type Game,
  type Hint,
  type Language,
} from '../../utils/gameplay'
import {GameIcon} from './GameIcon'
import {useGameLayout} from './useGameLayout'
import {VictoryResult, VictorySeams, VictorySparkles} from './VictoryResult'
import './index.scss'

const STORAGE = 'sudokutaro:glass:v1',
  RECORDS = 'sudokutaro:records:v1'
type Records = {wins: number; best: Partial<Record<Difficulty, number>>}
type Modal = 'rules' | 'settings' | 'new' | 'won' | null
const time = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
function restore(): Game {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || 'null')
    if (isSavedGame(saved)) return {...saved, history: []}
  } catch {
    /* Private browsing or old storage: start a playable game. */
  }
  return createGame()
}
function readRecords(): Records {
  try {
    const r = JSON.parse(localStorage.getItem(RECORDS) || 'null')
    if (
      r &&
      Number.isInteger(r.wins) &&
      r.wins >= 0 &&
      r.best &&
      typeof r.best === 'object'
    )
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
  } catch {
    /* Records are optional. */
  }
  return {wins: 0, best: {}}
}
const tutorial = {
  zh: [
    [
      '一个目标，三条规则',
      '每行、每列、每个 3 × 3 宫，都要填入 1～9，且各出现一次。题目给定的数字不能修改。',
    ],
    [
      '记录你的可能性',
      '先选择空格，再开启「笔记」。点击 1～9 添加或取消候选数；同一格可以记录多个数字。笔记不算正式答案。',
    ],
    [
      '从排除开始',
      '观察目标格的行、列、宫，排除已经出现的数字。当只剩一种可能，就关闭笔记模式，亲手填写。',
    ],
    [
      '需要一点启发？',
      '提示先定位，再提问，最后解释推理。它不会自动填数。撤销和擦除可自由使用；填入冲突数字时会标出相关位置。',
    ],
  ],
  en: [
    [
      'One goal. Three rules.',
      'Every row, column and 3 × 3 box must contain each digit from 1 to 9 exactly once. Original clues cannot be changed.',
    ],
    [
      'Record the possibilities',
      'Select an empty cell and turn on Notes. Tap 1–9 to add or remove candidates. Multiple notes can share a cell; they are not final answers.',
    ],
    [
      'Start by eliminating',
      'Look at the row, column and box. Eliminate digits already present. When only one possibility remains, turn Notes off and enter it yourself.',
    ],
    [
      'A little inspiration',
      'Hints locate a cell, ask a question, then explain the reasoning. They never fill it for you. Undo and Erase are free; conflicting entries highlight the related cells.',
    ],
  ],
}

export default function IndexPage() {
  const [game, setGame] = useState<Game>(restore)
  const [selected, setSelected] = useState<number | null>(null)
  const [noteMode, setNoteMode] = useState(false)
  const [lang, setLang] = useState<Language>(() => {
    try {
      return localStorage.getItem('sudokutaro:language') === 'en' ? 'en' : 'zh'
    } catch {
      return 'zh'
    }
  })
  const [vibration, setVibration] = useState(() => {
    try {
      return localStorage.getItem('sudokutaro:vibration') === 'true'
    } catch {
      return false
    }
  })
  const [modal, setModal] = useState<Modal>(null)
  const [ruleStep, setRuleStep] = useState(0)
  const [hint, setHint] = useState<{value: Hint; stage: number} | null>(null)
  const [conflicts, setConflicts] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const [records, setRecords] = useState<Records>(readRecords)
  const [newBest, setNewBest] = useState(false)
  const [celebration, setCelebration] = useState<'wave' | 'seams' | null>(null)
  const celebrating = celebration !== null
  const gameRef = useRef(game),
    hintRef = useRef(hint),
    winRecorded = useRef(game.won)
  const conflictTimer = useRef<ReturnType<typeof setTimeout>>()
  const resultsTrigger = useRef<HTMLButtonElement>(null)
  const hintClose = useRef<HTMLButtonElement>(null),
    hintTrigger = useRef<HTMLButtonElement>(null),
    hintTry = useRef<HTMLButtonElement>(null)
  const hintOpen = !!hint
  const hadHint = useRef(false)
  useEffect(() => {
    if (hintOpen) hintClose.current?.focus({preventScroll: true})
    else if (hadHint.current) hintTrigger.current?.focus({preventScroll: true})
    hadHint.current = hintOpen
  }, [hintOpen])
  const layout = useGameLayout(),
    en = lang === 'en'
  const say = useCallback(
    (zh: string, english: string) => (en ? english : zh),
    [en],
  )
  const label = (d: Difficulty) =>
    d === 'easy'
      ? say('简单', 'Easy')
      : d === 'medium'
        ? say('中等', 'Medium')
        : say('困难', 'Hard')
  gameRef.current = game
  hintRef.current = hint
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify({...game, history: []}))
    } catch {
      /* Continue without persistence when storage is unavailable. */
    }
  }, [game])
  useEffect(() => {
    try {
      localStorage.setItem('sudokutaro:language', lang)
    } catch {
      /* Optional preference. */
    }
  }, [lang])
  useEffect(() => {
    try {
      localStorage.setItem('sudokutaro:vibration', String(vibration))
    } catch {
      /* Optional preference. */
    }
  }, [vibration])
  useEffect(() => {
    if (game.won || modal) return
    const id = setInterval(() => {
      if (!document.hidden)
        setGame((g) => (g.won ? g : {...g, seconds: g.seconds + 1}))
    }, 1000)
    return () => clearInterval(id)
  }, [game.won, modal])
  useEffect(() => {
    if (!message) return
    const id = setTimeout(() => setMessage(''), 3500)
    return () => clearTimeout(id)
  }, [message])
  useEffect(() => () => clearTimeout(conflictTimer.current), [])
  useEffect(() => {
    if (!game.won || winRecorded.current) return
    winRecorded.current = true
    const oldBest = records.best[game.difficulty],
      best = oldBest === undefined || game.seconds < oldBest
    const next = {
      wins: records.wins + 1,
      best: {...records.best, [game.difficulty]: best ? game.seconds : oldBest},
    }
    setRecords(next)
    setNewBest(best)
    setHint(null)
    setMessage('')
    if (vibration) navigator.vibrate?.([18, 45, 28])
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) setModal('won')
    else setCelebration('wave')
    try {
      localStorage.setItem(RECORDS, JSON.stringify(next))
    } catch {
      /* Keep the in-session achievement. */
    }
  }, [game.won, game.seconds, game.difficulty, records, vibration])
  const finishCelebration = useCallback(() => {
    setCelebration(null)
    setModal((current) => (current === null ? 'won' : current))
  }, [])
  useEffect(() => {
    if (!celebrating) return
    // Opening any menu cancels either stage, even if it closes before it ends.
    if (modal) {
      setCelebration(null)
      return
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const onPreference = () => {
      if (reduced.matches) finishCelebration()
    }
    reduced.addEventListener?.('change', onPreference)
    onPreference()
    return () => reduced.removeEventListener?.('change', onPreference)
  }, [celebrating, modal, finishCelebration])
  useEffect(() => {
    if (game.won && !modal && !celebrating)
      resultsTrigger.current?.focus({preventScroll: true})
  }, [game.won, modal, celebrating])
  const showVictory = () => {
    setCelebration(null)
    setModal('won')
  }

  const choose = useCallback((index: number) => {
    setSelected(index)
    clearTimeout(conflictTimer.current)
    setConflicts([])
    setMessage('')
  }, [])
  const fill = useCallback(
    (value: number, erase = false) => {
      const old = gameRef.current
      if (selected === null) {
        setMessage(say('先选择一个空格', 'Select an empty cell first'))
        return
      }
      if (old.initial[Math.floor(selected / 9)][selected % 9]) {
        setMessage(
          say(
            '这是题目给定的数字，请选择空格',
            'Original clues stay fixed. Choose an empty cell.',
          ),
        )
        return
      }
      const result = move(old, selected, value, !erase && noteMode)
      if (result.conflicts.length) {
        setConflicts(result.conflicts)
        setMessage(
          say(
            '这个数字与高亮位置重复，请再看看',
            'This digit repeats in the highlighted cells. Try another possibility.',
          ),
        )
        clearTimeout(conflictTimer.current)
        conflictTimer.current = setTimeout(() => {
          setConflicts([])
          setMessage('')
        }, 1800)
        return
      }
      if (result.game === old) return
      clearTimeout(conflictTimer.current)
      setConflicts([])
      setMessage('')
      setGame(result.game)
      gameRef.current = result.game
      if (vibration) navigator.vibrate?.(10)
      const newUnits = completedUnits(result.game.board).filter(
        (u) => !old.celebrated.includes(u),
      )
      if (newUnits.length && !result.game.won)
        setMessage(
          say(
            '解开一个区域，又前进一步！',
            'Another unit complete. One step closer!',
          ),
        )
      if (
        hintRef.current &&
        selected === hintRef.current.value.index &&
        result.game.board[Math.floor(selected / 9)][selected % 9]
      ) {
        setHint(null)
        setMessage(say('这一格，由你解开', 'You worked this one out.'))
      }
    },
    [selected, noteMode, vibration, say],
  )
  const undo = useCallback(() => {
    clearTimeout(conflictTimer.current)
    setMessage('')
    setGame((g) => undoMove(g))
    setConflicts([])
    setHint(null)
  }, [])
  const showHint = () => {
    clearTimeout(conflictTimer.current)
    setMessage('')
    if (game.won) return
    const h = findHint(game)
    if (!h) return
    setSelected(h.index)
    setHint({value: h, stage: 0})
    setConflicts([])
    setGame((g) => ({...g, hints: g.hints + 1}))
  }
  const newGame = (d: Difficulty) => {
    clearTimeout(conflictTimer.current)
    const next = createGame(d)
    gameRef.current = next
    winRecorded.current = false
    setGame(next)
    setSelected(null)
    setHint(null)
    setModal(null)
    setConflicts([])
    setMessage('')
    setNewBest(false)
    setCelebration(null)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return
      if (e.key === 'Escape') {
        setCelebration(null)
        setModal(null)
        setHint(null)
        return
      }
      if (modal || hint) return
      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault()
        fill(Number(e.key))
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        fill(0, true)
        return
      }
      if (e.key.toLowerCase() === 'n') {
        setNoteMode((n) => !n)
        return
      }
      const directions: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      }
      if (e.key in directions) {
        e.preventDefault()
        const index = selected ?? 0,
          [dr, dc] = directions[e.key],
          row = Math.max(0, Math.min(8, Math.floor(index / 9) + dr)),
          col = Math.max(0, Math.min(8, (index % 9) + dc))
        const next = row * 9 + col
        choose(next)
        document
          .querySelector<HTMLButtonElement>(`[data-cell="${next}"]`)
          ?.focus({preventScroll: true})
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modal, hint, fill, selected, choose])
  const filled = game.board.flat().filter(Boolean).length
  const clues = hint ? hintSteps(hint.value, lang) : []
  const hintTitles = clues.map((_, stage) =>
    hint?.value.kind === 'review'
      ? say('回看你的填写', 'Review your entry')
      : stage === 0
        ? say('先看高亮的这一格', 'Look at this cell')
        : stage === 1
          ? say('从已有数字里排除', 'Eliminate the known digits')
          : say('核对这一步推理', 'Check the reasoning'),
  )
  const focus = hint?.value.index ?? selected
  const hintUnit =
    hint?.value.kind === 'hidden' && hint.value.unit !== undefined
      ? UNITS[hint.value.unit]
      : null
  const selectedNotes = selected === null ? [] : game.notes[selected]
  const activeCandidates = useMemo(
    () => new Set(selectedNotes),
    [selectedNotes],
  )
  const changeLanguage = () => setLang((l) => (l === 'zh' ? 'en' : 'zh'))

  const renderedCells = useMemo(
    () =>
      game.board.flatMap((row, r) =>
        row.map((value, c) => {
          const index = r * 9 + c,
            fixed = game.initial[r][c] !== 0
          const sel = focus === index,
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
              className={[
                'sudoku-cell',
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
              aria-pressed={selected === index}
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
      ),
    [
      game.board,
      game.initial,
      game.notes,
      focus,
      selected,
      conflicts,
      hintUnit,
      choose,
      say,
      lang,
    ],
  )

  return (
    <main
      className={`sudoku-app layout-${layout.mode} ${layout.thumbGrid ? 'thumb-grid' : ''} ${layout.heightLimited ? 'height-limited' : ''} ${hint ? 'has-hint' : ''} ${celebrating ? 'is-celebrating' : ''} ${celebration === 'wave' ? 'is-victory-wave' : ''} ${celebration === 'seams' ? 'is-victory-seams' : ''}`}
      style={layout.style}
    >
      <div className="game-shell" ref={layout.ref}>
        <header className="topbar">
          <span className="brand">SudokuTaro</span>
          <nav aria-label={say('游戏菜单', 'Game menu')}>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setRuleStep(0)
                setModal('rules')
              }}
            >
              {say('规则', 'Rules')}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setModal('settings')}
            >
              {say('设置', 'Settings')}
            </button>
          </nav>
        </header>
        <div className="play-layout">
          <section
            className="board-pane"
            aria-label={say('数独棋盘', 'Sudoku board')}
          >
            <div className="game-meta">
              <button
                type="button"
                className="difficulty-button"
                onClick={() => setModal('new')}
              >
                {say('自由练习', 'Practice')} · {label(game.difficulty)}{' '}
                <span aria-hidden="true">⌄</span>
              </button>
              <span className="metrics">
                <span aria-label={say('用时', 'Time')}>
                  {time(game.seconds)}
                </span>
                <span>{filled} / 81</span>
              </span>
            </div>
            <div className="board-frame glass-panel">
              <div
                className="sudoku-board"
                role="group"
                aria-label={say(
                  '九行九列，选择格子后使用下方数字按钮',
                  'Nine by nine Sudoku. Select a cell, then a number.',
                )}
                onAnimationEnd={(event) => {
                  // CSS owns the 960ms envelope + 16 × 90ms diagonal stagger.
                  // Wait for actual completion, including in throttled tabs.
                  if (
                    celebration === 'wave' &&
                    event.animationName === 'victory-wave' &&
                    (event.target as HTMLElement).dataset.cell === '80'
                  )
                    setCelebration('seams')
                }}
              >
                {renderedCells}
                {celebration === 'seams' && (
                  <VictorySeams onEnd={finishCelebration} />
                )}
              </div>
              {celebration === 'wave' && <VictorySparkles />}
            </div>
            <div className="selection-caption">
              {game.won ? (
                <span data-victory-status role="status" aria-live="polite">
                  {say('漂亮，解开了！', 'Beautifully solved!')}
                </span>
              ) : selected === null ? (
                say('选一个空格，开始你的推理', 'Choose an empty cell to begin')
              ) : (
                `${cellLocation(selected, lang)} · ${selectedNotes.length ? say('候选数 ', 'Notes ') + selectedNotes.join('、') : noteMode ? say('笔记模式', 'Notes on') : say('点击数字填写', 'Tap a number to fill')}`
              )}
            </div>
          </section>
          <section
            className="control-pane"
            aria-label={say('数字与工具', 'Numbers and tools')}
          >
            <div className="side-intro">
              <h2>{say('每一步，都有依据', 'One thoughtful step')}</h2>
              <p>
                {say(
                  '先观察，再排除。答案由你来填写。',
                  'Observe, eliminate, and enter the answer yourself.',
                )}
              </p>
            </div>
            {game.won ? (
              <div className="completed-controls glass-panel">
                <GameIcon name="check" />
                <h2>{say('这一局，由你完成', 'Puzzle complete')}</h2>
                <p>{say('留一刻，欣赏你的答案。', 'Enjoy your solution.')}</p>
                <div className="victory-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    ref={resultsTrigger}
                    onClick={showVictory}
                  >
                    {say('查看成绩', 'View results')}
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => newGame(game.difficulty)}
                  >
                    {say('再挑战一局', 'Play again')}
                  </button>
                </div>
              </div>
            ) : hint ? (
              <>
                <section
                  className="hint-card glass-panel"
                  role="dialog"
                  aria-modal="false"
                  aria-labelledby="hint-heading"
                >
                  <div className="hint-eyebrow">
                    <span>
                      <GameIcon name="hint" />{' '}
                      {say('一点启发', 'A little inspiration')}
                    </span>
                    <span className="hint-step">
                      {hint.stage + 1} / {clues.length}
                    </span>
                    <button
                      type="button"
                      className="text-button"
                      ref={hintClose}
                      aria-label={say('关闭提示', 'Close hint')}
                      onClick={() => setHint(null)}
                    >
                      <GameIcon name="close" />
                    </button>
                  </div>
                  <div className="hint-copy">
                    <div className="hint-stage">
                      <h2 id="hint-heading">{hintTitles[hint.stage]}</h2>
                      <p>{clues[hint.stage]}</p>
                    </div>
                    {clues.map((clue, stage) => (
                      <div
                        className="hint-stage hint-measure"
                        aria-hidden="true"
                        key={stage}
                      >
                        <span className="hint-measure-title">{hintTitles[stage]}</span>
                        <span className="hint-measure-text">{clue}</span>
                      </div>
                    ))}
                  </div>
                  <div
                    className={`dialog-actions ${clues.length === 1 ? 'hint-single-action' : ''}`}
                  >
                    <button
                      type="button"
                      className="secondary-button"
                      ref={hintTry}
                      onClick={() => setHint(null)}
                    >
                      {say('我来试试', 'Let me try')}
                    </button>
                    {clues.length > 1 && (
                      <button
                        type="button"
                        className="primary-button"
                        disabled={hint.stage >= clues.length - 1}
                        onClick={(e) => {
                          // Move focus before this button becomes disabled; intermediate
                          // clues keep their native focus and the same click coordinates.
                          if (
                            hint.stage === clues.length - 2 &&
                            document.activeElement === e.currentTarget
                          )
                            hintTry.current?.focus({preventScroll: true})
                          setHint((h) =>
                            h
                              ? {
                                  ...h,
                                  stage: Math.min(
                                    h.stage + 1,
                                    clues.length - 1,
                                  ),
                                }
                              : h,
                          )
                        }}
                      >
                        {say('再给一点线索', 'Another clue')}
                      </button>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <div className="game-controls">
                <div className="tools glass-panel">
                  <button
                    type="button"
                    disabled={!game.history.length || game.won}
                    onClick={undo}
                  >
                    <GameIcon name="undo" />
                    <span>{say('撤销', 'Undo')}</span>
                  </button>
                  <button
                    type="button"
                    disabled={game.won}
                    onClick={() => fill(0, true)}
                  >
                    <GameIcon name="erase" />
                    <span>{say('擦除', 'Erase')}</span>
                  </button>
                  <button
                    type="button"
                    className={noteMode ? 'is-active' : ''}
                    aria-pressed={noteMode}
                    disabled={game.won}
                    onClick={() => setNoteMode((n) => !n)}
                  >
                    <GameIcon name="notes" />
                    <span>{say('笔记', 'Notes')}</span>
                  </button>
                  <button
                    type="button"
                    ref={hintTrigger}
                    onClick={showHint}
                    disabled={game.won}
                  >
                    <GameIcon name="hint" />
                    <span>{say('提示', 'Hint')}</span>
                  </button>
                </div>
                <div
                  className="number-panel glass-panel"
                  aria-label={say('填写数字 1 到 9', 'Enter digits 1 to 9')}
                >
                  {DIGITS.map((n) => (
                    <button
                      type="button"
                      key={n}
                      className={`number-key ${noteMode && activeCandidates.has(n) ? 'is-noted' : ''}`}
                      data-number={n}
                      aria-label={
                        noteMode
                          ? say(`候选数 ${n}`, `Candidate ${n}`)
                          : say(`填写 ${n}`, `Enter ${n}`)
                      }
                      aria-pressed={noteMode && activeCandidates.has(n)}
                      disabled={game.won}
                      onClick={() => fill(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className={`input-caption ${message ? 'has-feedback' : ''}`}>
              <div
                className={`feedback ${message ? 'feedback-visible' : ''} ${conflicts.length ? 'feedback-error' : ''}`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {message && (
                  <>
                    <GameIcon name={conflicts.length ? 'warning' : 'info'} />
                    <span>{message}</span>
                  </>
                )}
              </div>
              {!message && (
                <span>
                  {hint
                    ? say(
                        '理解之后，答案由你亲手填写。',
                        'Understand it, then make the move yourself.',
                      )
                    : say(
                        '先观察，再落笔。',
                        'Observe first. Make your next move.',
                      )}
                </span>
              )}
            </div>
          </section>
        </div>
      </div>
      {modal && (
        <div className="dialog-backdrop" onClick={() => setModal(null)}>
          <section
            className={`dialog glass-panel dialog-${modal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogFocus context={modal} onClose={() => setModal(null)} />
            {modal !== 'won' && (
              <div className="dialog-top">
                <button
                  type="button"
                  className="text-button language-button"
                  onClick={changeLanguage}
                >
                  中文 / EN
                </button>
                <button
                  type="button"
                  className="text-button close-button"
                  aria-label={say('关闭', 'Close')}
                  onClick={() => setModal(null)}
                >
                  ×
                </button>
              </div>
            )}
            {modal === 'rules' && (
              <>
                <div className="eyebrow">
                  {say('学会数独', 'LEARN SUDOKU')} · {ruleStep + 1} / 4
                </div>
                <h1 id="dialog-title">{tutorial[lang][ruleStep][0]}</h1>
                <div
                  className={`rule-illustration rule-step-${ruleStep}`}
                  aria-hidden="true"
                >
                  {DIGITS.map((n) => (
                    <span key={n} className={n === 5 ? 'accent' : ''}>
                      {ruleStep === 1 && n > 3 ? '' : n}
                    </span>
                  ))}
                </div>
                <p className="dialog-copy">{tutorial[lang][ruleStep][1]}</p>
                <div className="dialog-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      ruleStep > 0 ? setRuleStep((s) => s - 1) : setModal(null)
                    }
                  >
                    {ruleStep
                      ? say('上一步', 'Back')
                      : say('回到游戏', 'Back to game')}
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      ruleStep < 3 ? setRuleStep((s) => s + 1) : setModal(null)
                    }
                  >
                    {ruleStep < 3
                      ? say('继续', 'Next')
                      : say('我来试试', 'Let me try')}
                  </button>
                </div>
              </>
            )}
            {modal === 'settings' && (
              <>
                <div className="eyebrow">SUDOKUTARO</div>
                <h1 id="dialog-title">
                  {say('按你的节奏', 'At your own pace')}
                </h1>
                <div className="settings-line">
                  <span>{say('轻触振动', 'Touch vibration')}</span>
                  <button
                    type="button"
                    className={`toggle ${vibration ? 'toggle-on' : ''}`}
                    role="switch"
                    aria-checked={vibration}
                    aria-label={say('轻触振动', 'Touch vibration')}
                    onClick={() => setVibration((v) => !v)}
                  >
                    <span />
                  </button>
                </div>
                <div className="settings-line">
                  <span>{say('已完成', 'Completed')}</span>
                  <strong>
                    {records.wins} {say('局', 'games')}
                  </strong>
                </div>
                <p className="dialog-copy">
                  {say(
                    '进度自动保存在当前浏览器。切换屏幕大小或旋转设备，不会重新开局。',
                    'Progress is saved in this browser. Resizing or rotating never starts a new game.',
                  )}
                </p>
                <button
                  type="button"
                  className="primary-button full-width"
                  onClick={() => setModal('new')}
                >
                  {say('选择难度 / 开始新局', 'Choose difficulty / New game')}
                </button>
              </>
            )}
            {modal === 'new' && (
              <>
                <div className="eyebrow">
                  {say('新的挑战', 'A FRESH CHALLENGE')}
                </div>
                <h1 id="dialog-title">
                  {say('选择你的节奏', 'Choose your pace')}
                </h1>
                <p className="dialog-copy">
                  {say(
                    '开始新局会替换当前进度。每道题均验证唯一解；难度以留空数量区分。',
                    'A new game replaces this progress. Each puzzle has one verified solution; levels vary the number of empty cells.',
                  )}
                </p>
                <div className="difficulty-options">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                    <button
                      type="button"
                      key={d}
                      className="secondary-button"
                      onClick={() => newGame(d)}
                    >
                      {label(d)}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-button full-width"
                  onClick={() => setModal(null)}
                >
                  {say('继续这一局', 'Keep playing')}
                </button>
              </>
            )}
            {modal === 'won' && (
              <VictoryResult
                en={en}
                board={game.board}
                elapsed={time(game.seconds)}
                hints={game.hints}
                moves={game.moves}
                usedNotes={game.usedNotes}
                newBest={newBest}
                onLanguage={changeLanguage}
                onClose={() => setModal(null)}
                onViewBoard={() => setModal(null)}
                onPlayAgain={() => newGame(game.difficulty)}
              />
            )}
          </section>
        </div>
      )}
    </main>
  )
}

/** Keep keyboard focus inside a dialog and restore it without opening a mobile keyboard. */
function DialogFocus({context, onClose}: {context: string; onClose: () => void}) {
  const marker = useRef<HTMLSpanElement>(null),
    closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const card = marker.current?.parentElement
    const buttons = () =>
      Array.from(
        card?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ||
          [],
      )
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const list = buttons(),
        first = list[0],
        last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    card?.addEventListener('keydown', onKey)
    return () => {
      card?.removeEventListener('keydown', onKey)
      previous?.focus({preventScroll: true})
    }
  }, [])
  // Context changes reuse this component, preserving the original opener until
  // final dismissal while focusing the new dialog's first available control.
  useEffect(() => {
    marker.current?.parentElement
      ?.querySelector<HTMLButtonElement>('button:not(:disabled)')
      ?.focus({preventScroll: true})
  }, [context])
  return <span ref={marker} hidden />
}
