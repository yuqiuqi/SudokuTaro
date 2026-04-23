import {Input, ScrollView, Text, View} from '@tarojs/components'
/** H5 主操作行需 mousedown/leave 配合 data-state；Taro 类型未声明，运行时可用 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ViewAction = View as any
import Taro from '@tarojs/taro'
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {CSSProperties} from 'react'

import {
  type Difficulty,
  boardsEqual,
  collectConflictIndices,
  digHoles,
  generateSolution,
  getHoleCount,
  hasConflict,
} from '../../utils/sudokuEngine'
import {
  applyDailyBonus,
  loadEconomy,
  mergeSettings,
  type GameEconomyState,
  saveEconomy,
  tryConsumeEraseProp,
  tryConsumeUndoProp,
} from '../../utils/gameEconomy'
import {logRuntimeDiagnostics} from '../../utils/devDiagnostics'
import {appleUi} from '../../utils/theme'

import './index.scss'

type CellSel = {row: number; col: number} | null
type Hist = {row: number; col: number; value: number}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const StatsRow = memo(function StatsRow({
  seconds,
  steps,
}: {
  seconds: number
  steps: number
}) {
  return (
    <View className="stats">
      <Text className="stats__t">计时 {formatSeconds(seconds)}</Text>
      <Text className="stats__t">步数 {steps}</Text>
    </View>
  )
})

function cloneGrid(g: number[][]): number[][] {
  return g.map(row => [...row])
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** 通关弹窗：统计数字 0→目标，WIN-02，cleanup cancelAnimationFrame */
const WinResultBody = memo(function WinResultBody({
  active,
  seconds: secT,
  steps: stT,
}: {
  active: boolean
  seconds: number
  steps: number
}) {
  const [dSec, setDSec] = useState(0)
  const [dSt, setDSt] = useState(0)
  const rafId = useRef(0)
  const dur = appleUi.motion.durationWinCountMs

  useEffect(() => {
    if (!active) {
      setDSec(0)
      setDSt(0)
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
        rafId.current = 0
      }
      return
    }
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur)
      const e = 1 - (1 - p) ** 4
      setDSec(Math.round(secT * e))
      setDSt(Math.round(stT * e))
      if (p < 1) {
        rafId.current = requestAnimationFrame(tick)
      }
    }
    rafId.current = requestAnimationFrame(tick)
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
        rafId.current = 0
      }
    }
  }, [active, dur, secT, stT])

  return (
    <Text className="modal__body modal--win-stg-3">
      你在 {formatSeconds(dSec)}（{dSec} 秒）完成数独，步数 {dSt}。
    </Text>
  )
})

function cellIndex(r: number, c: number): number {
  return r * 9 + c
}

function vibrateLight(enabled: boolean): void {
  if (!enabled) {
    return
  }
  try {
    Taro.vibrateShort?.({type: 'light'})
  } catch {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15)
    }
  }
}

type NumPadProps = {
  /** 'off' = 未挂载；'on' = 弹出；'leaving' = 正在滑出（动画中仍挂载） */
  visibility: 'off' | 'on' | 'leaving'
  numPress: number | null
  flash: {key: number; token: number} | null
  onPressStart: (n: number) => void
  onPressEnd: () => void
  onFill: (n: number) => void
}

/** iOS 26 悬浮数字键盘 dock：
 * · 选中格子时从底部滑入，未选中/打开弹层时滑出隐藏
 * · 仅 1-9，擦除按钮统一由顶部 actions 承担（不重复）
 */
const NumPad = memo(function NumPad({
  visibility,
  numPress,
  flash,
  onPressStart,
  onPressEnd,
  onFill,
}: NumPadProps) {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  const pressProps = (n: number) => ({
    onTouchStart: () => onPressStart(n),
    onTouchEnd: () => onPressEnd(),
    onTouchCancel: () => onPressEnd(),
    onMouseDown: (e: {button: number}) => {
      if (e.button !== 0) return
      onPressStart(n)
    },
    onMouseUp: () => onPressEnd(),
    onMouseLeave: () => onPressEnd(),
  })

  if (visibility === 'off') return null

  return (
    <View
      className={`numpad-dock ${
        visibility === 'leaving' ? 'numpad-dock--leaving' : 'numpad-dock--enter'
      }`}
      catchMove
    >
      <View className="numpad-dock__panel">
        <View className="numpad-dock__handle" />
        <View className="numpad-dock__grid">
          {keys.map(n => {
            const pressed = numPress === n
            const flashing = flash?.key === n
            return (
              <ViewAction
                key={n}
                className={`numpad-key ${pressed ? 'numpad-key--pressed' : ''} ${
                  flashing ? 'numpad-key--flash' : ''
                }`}
                data-state={pressed ? 'pressed' : 'idle'}
                data-flash-token={flashing ? flash?.token : undefined}
                hoverClass="numpad-key--hover"
                hoverStartTime={0}
                hoverStayTime={0}
                onClick={() => onFill(n)}
                {...pressProps(n)}
              >
                <Text className="numpad-key__txt">{n}</Text>
              </ViewAction>
            )
          })}
        </View>
      </View>
    </View>
  )
})

type SudokuGridProps = {
  board: number[][]
  initialBoard: number[][]
  selected: CellSel
  conflictCells: Set<number>
  highlightNum: number | null
  onCellClick: (row: number, col: number) => void
  /** 非冲突填数后短暂用于入场动画 */
  fillPopIndex: number | null
  /** 方向键操作时为 true，用于 KBD-02 可见焦点 */
  keyboardNav: boolean
}

const SudokuGrid = memo(function SudokuGrid({
  board,
  initialBoard,
  selected,
  conflictCells,
  highlightNum,
  onCellClick,
  fillPopIndex,
  keyboardNav,
}: SudokuGridProps) {
  const regionMask = (row: number, col: number) => {
    if (!selected) {
      return false
    }
    const {row: sr, col: sc} = selected
    const br = Math.floor(sr / 3) * 3
    const bc = Math.floor(sc / 3) * 3
    return (
      row === sr ||
      col === sc ||
      (row >= br && row < br + 3 && col >= bc && col < bc + 3)
    )
  }

  const sameNum = (row: number, col: number) =>
    highlightNum !== null &&
    board[row][col] === highlightNum &&
    board[row][col] !== 0

  const rippleOrder = useMemo(() => {
    const map = new Map<number, number>()
    if (!selected || highlightNum == null) {
      return map
    }
    const {row: sr, col: sc} = selected
    const cells: {r: number; c: number; d: number}[] = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!(sameNum(r, c) && regionMask(r, c))) {
          continue
        }
        const d = Math.abs(r - sr) + Math.abs(c - sc)
        cells.push({r, c, d})
      }
    }
    cells.sort((a, b) => a.d - b.d || a.r - b.r || a.c - b.c)
    cells.forEach((cell, i) => {
      map.set(cell.r * 9 + cell.c, i)
    })
    return map
  }, [board, highlightNum, selected])

  return (
    <View className="grid">
      {board.map((row, r) =>
        row.map((val, c) => {
          const isSel = selected?.row === r && selected?.col === c
          const idx = cellIndex(r, c)
          const thickR = c === 2 || c === 5
          const thickB = r === 2 || r === 5
          const fixed = initialBoard[r][c] !== 0
          const user = !fixed && val !== 0
          const conflict = conflictCells.has(idx)
          const dim = regionMask(r, c)
          const hl = sameNum(r, c) && regionMask(r, c)
          const blockAlt = (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 1
          const cls = [
            'cell',
            thickR ? 'cell--thick-r' : '',
            thickB ? 'cell--thick-b' : '',
            blockAlt ? 'cell--block-alt' : '',
            dim ? 'cell--dim' : '',
            hl ? 'cell--same' : '',
            isSel ? 'cell--sel' : '',
            conflict ? 'cell--bad' : '',
            fillPopIndex === idx ? 'cell--fill-flash' : '',
          ]
            .filter(Boolean)
            .join(' ')
          const h5Style: CSSProperties | undefined = hl
            ? {
                ['--cell-ripple-index' as string]: String(rippleOrder.get(idx) ?? 0),
              }
            : undefined
          return (
            <View
              key={idx}
              className={cls}
              style={h5Style}
              data-keyboard-focus={isSel && keyboardNav ? 'true' : undefined}
              onClick={() => onCellClick(r, c)}>
              <Text
                className={[
                  'cell__txt',
                  fixed ? 'cell__txt--fixed' : '',
                  user ? 'cell__txt--user' : '',
                  isSel ? 'cell__txt--sel' : '',
                  conflict ? 'cell__txt--bad' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}>
                {val === 0 ? '' : String(val)}
              </Text>
              {isSel ? <View className="cell__ring" /> : null}
            </View>
          )
        }),
      )}
    </View>
  )
})

export default function IndexPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [solution, setSolution] = useState<number[][]>(() =>
    Array.from({length: 9}, () => Array(9).fill(0)),
  )
  const [board, setBoard] = useState<number[][]>(() =>
    Array.from({length: 9}, () => Array(9).fill(0)),
  )
  const [initialBoard, setInitialBoard] = useState<number[][]>(() =>
    Array.from({length: 9}, () => Array(9).fill(0)),
  )
  const [selected, setSelected] = useState<CellSel>(null)
  const [history, setHistory] = useState<Hist[]>([])
  const [seconds, setSeconds] = useState(0)
  const [steps, setSteps] = useState(0)
  const [conflictCells, setConflictCells] = useState<Set<number>>(() => new Set())
  const [highlightNum, setHighlightNum] = useState<number | null>(null)
  /** 弹层：'off' | 'on' | 'leaving' — leaving 时 DOM 仍挂载，播完 280ms 再 off（MOD-04） */
  const [modalWon, setModalWon] = useState<'leaving' | 'off' | 'on'>('off')
  const [modalSet, setModalSet] = useState<'leaving' | 'off' | 'on'>('off')
  const [modalHelp, setModalHelp] = useState<'leaving' | 'off' | 'on'>('off')
  const [hiddenFocus, setHiddenFocus] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [economy, setEconomy] = useState<GameEconomyState>(() => {
    let s = loadEconomy()
    s = applyDailyBonus(s)
    saveEconomy(s)
    return s
  })
  const [pageScrollTop, setPageScrollTop] = useState(0)
  const [lowDeviceMemory, setLowDeviceMemory] = useState(false)
  const [usedKeyboardNav, setUsedKeyboardNav] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const conflictTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boardRef = useRef(board)
  const historyRef = useRef(history)
  const economyRef = useRef(economy)
  const pendingConflictRevert = useRef<{row: number; col: number; revertTo: number} | null>(null)
  const fillPopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [fillPopIndex, setFillPopIndex] = useState<number | null>(null)
  const [actionPress, setActionPress] = useState<null | 'erase' | 'new' | 'undo'>(null)
  /** 数字键盘按下态：0=擦除，1-9=数字；用于 iOS 26 spring 动画。 */
  const [numPress, setNumPress] = useState<number | null>(null)
  /** 最近一次按下的键闪动触发（used-number 指示）：key + token，token 变化触发 replay。 */
  const [numPadFlash, setNumPadFlash] = useState<{key: number; token: number} | null>(null)
  const numPadFlashT = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** 悬浮键盘 dock 三态；'leaving' 期间 DOM 仍挂载播放滑出动画。 */
  const [numpadVisibility, setNumpadVisibility] = useState<'off' | 'on' | 'leaving'>('off')
  const leaveNumpadT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveWonT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveSetT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveHelpT = useRef<ReturnType<typeof setTimeout> | null>(null)

  const MODAL_LEAVE_MS = appleUi.motion.exitModalMs

  boardRef.current = board
  historyRef.current = history
  economyRef.current = economy

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const beginCloseWon = useCallback(() => {
    setModalWon(m => {
      if (m !== 'on') {
        return m
      }
      if (leaveWonT.current) {
        clearTimeout(leaveWonT.current)
      }
      leaveWonT.current = setTimeout(() => {
        setModalWon('off')
        leaveWonT.current = null
      }, MODAL_LEAVE_MS)
      return 'leaving'
    })
  }, [MODAL_LEAVE_MS])

  const beginCloseSet = useCallback(() => {
    setModalSet(m => {
      if (m !== 'on') {
        return m
      }
      if (leaveSetT.current) {
        clearTimeout(leaveSetT.current)
      }
      leaveSetT.current = setTimeout(() => {
        setModalSet('off')
        leaveSetT.current = null
      }, MODAL_LEAVE_MS)
      return 'leaving'
    })
  }, [MODAL_LEAVE_MS])

  const beginCloseHelp = useCallback(() => {
    setModalHelp(m => {
      if (m !== 'on') {
        return m
      }
      if (leaveHelpT.current) {
        clearTimeout(leaveHelpT.current)
      }
      leaveHelpT.current = setTimeout(() => {
        setModalHelp('off')
        leaveHelpT.current = null
      }, MODAL_LEAVE_MS)
      return 'leaving'
    })
  }, [MODAL_LEAVE_MS])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('deviceMemory' in navigator)) {
      return
    }
    const m = (navigator as {deviceMemory?: number}).deviceMemory
    setLowDeviceMemory(typeof m === 'number' && m > 0 && m < 4)
  }, [])

  useEffect(() => {
    const anyModalOpen = modalWon !== 'off' || modalSet !== 'off' || modalHelp !== 'off'
    const wantOn = selected != null && !anyModalOpen
    if (wantOn) {
      if (leaveNumpadT.current) {
        clearTimeout(leaveNumpadT.current)
        leaveNumpadT.current = null
      }
      setNumpadVisibility('on')
    } else {
      setNumpadVisibility(v => {
        if (v === 'off') return 'off'
        if (leaveNumpadT.current) {
          clearTimeout(leaveNumpadT.current)
        }
        leaveNumpadT.current = setTimeout(() => {
          setNumpadVisibility('off')
          leaveNumpadT.current = null
        }, MODAL_LEAVE_MS)
        return 'leaving'
      })
    }
  }, [selected, modalWon, modalSet, modalHelp, MODAL_LEAVE_MS])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)
  }, [stopTimer])

  const newGame = useCallback(
    (d?: Difficulty) => {
      if (conflictTimer.current) {
        clearTimeout(conflictTimer.current)
        conflictTimer.current = null
      }
      pendingConflictRevert.current = null

      const e = applyDailyBonus(economyRef.current)
      economyRef.current = e
      setEconomy(e)
      saveEconomy(e)

      const diff: Difficulty = d !== undefined ? d : difficulty
      if (d !== undefined) {
        setDifficulty(d)
      }
      const sol = generateSolution()
      const b = cloneGrid(sol)
      const init = cloneGrid(sol)
      digHoles(b, init, getHoleCount(diff))
      setSolution(sol)
      setBoard(b)
      boardRef.current = b
      setInitialBoard(init)
      setSelected(null)
      setHistory([])
      historyRef.current = []
      setSeconds(0)
      setSteps(0)
      setConflictCells(new Set())
      setHighlightNum(null)
      setModalWon('off')
      stopTimer()
      startTimer()
    },
    [difficulty, startTimer, stopTimer],
  )

  useEffect(() => {
    logRuntimeDiagnostics('pages/index mounted')
    newGame('easy')
    return () => {
      stopTimer()
      if (conflictTimer.current) {
        clearTimeout(conflictTimer.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const wantsHiddenInput =
    selected != null &&
    modalWon === 'off' &&
    initialBoard[selected.row][selected.col] === 0

  useEffect(() => {
    if (!wantsHiddenInput) {
      setHiddenFocus(false)
      return
    }
    setHiddenFocus(false)
    const t = setTimeout(() => setHiddenFocus(true), 50)
    return () => clearTimeout(t)
  }, [wantsHiddenInput, selected?.row, selected?.col])

  const onDifficulty = useCallback(
    (d: Difficulty) => {
      newGame(d)
    },
    [newGame],
  )

  const flushPendingConflict = useCallback(() => {
    if (!conflictTimer.current) {
      return
    }
    clearTimeout(conflictTimer.current)
    conflictTimer.current = null
    const p = pendingConflictRevert.current
    pendingConflictRevert.current = null
    if (!p) {
      return
    }
    const b = cloneGrid(boardRef.current)
    b[p.row][p.col] = p.revertTo
    boardRef.current = b
    historyRef.current = historyRef.current.slice(0, -1)
    setBoard(b)
    setHistory(historyRef.current)
  }, [])

  const selectCell = useCallback(
    (row: number, col: number) => {
      setUsedKeyboardNav(false)
      flushPendingConflict()
      setSelected({row, col})
      setConflictCells(new Set())
      if (boardRef.current[row][col] !== 0) {
        setHighlightNum(boardRef.current[row][col])
      } else {
        setHighlightNum(null)
      }
    },
    [flushPendingConflict],
  )

  const fillNumber = useCallback(
    (num: number) => {
      vibrateLight(economyRef.current.settings.vibration)
      flushPendingConflict()
      setConflictCells(new Set())

      if (!selected) {
        setHighlightNum(num)
        return
      }
      const {row, col} = selected
      if (initialBoard[row][col] !== 0) {
        return
      }

      const prevCell = boardRef.current[row][col]
      if (prevCell === num) {
        return
      }

      const next = cloneGrid(boardRef.current)
      next[row][col] = num
      historyRef.current = [...historyRef.current, {row, col, value: prevCell}]
      boardRef.current = next
      setHistory(historyRef.current)
      setBoard(next)
      setHighlightNum(num)

      if (hasConflict(next, row, col, num)) {
        setConflictCells(collectConflictIndices(next, row, col, num))
        pendingConflictRevert.current = {row, col, revertTo: prevCell}
        conflictTimer.current = setTimeout(() => {
          pendingConflictRevert.current = null
          setBoard(b => {
            const t = cloneGrid(b)
            t[row][col] = prevCell
            boardRef.current = t
            return t
          })
          setHistory(h => {
            const n = h.slice(0, -1)
            historyRef.current = n
            return n
          })
          setConflictCells(new Set())
          conflictTimer.current = null
        }, 1500)
        return
      }

      const placedIdx = cellIndex(row, col)
      setFillPopIndex(placedIdx)
      if (fillPopTimer.current) {
        clearTimeout(fillPopTimer.current)
      }
      fillPopTimer.current = setTimeout(() => {
        setFillPopIndex(null)
        fillPopTimer.current = null
      }, 120)

      setSteps(s => s + 1)
      if (boardsEqual(next, solution)) {
        stopTimer()
        setModalWon('on')
      }
    },
    [initialBoard, selected, solution, stopTimer, flushPendingConflict],
  )

  const undo = useCallback(() => {
    if (conflictTimer.current) {
      flushPendingConflict()
      setConflictCells(new Set())
      return
    }
    if (historyRef.current.length === 0) {
      Taro.showToast({title: '无可撤销', icon: 'none'})
      return
    }
    const r = tryConsumeUndoProp(economyRef.current)
    if (!r.ok) {
      Taro.showToast({title: '撤销道具不足', icon: 'none'})
      return
    }
    economyRef.current = r.next
    setEconomy(r.next)
    saveEconomy(r.next)

    setConflictCells(new Set())
    setHistory(h => {
      if (h.length === 0) {
        return h
      }
      const {row, col, value} = h[h.length - 1]
      setBoard(b => {
        const t = cloneGrid(b)
        t[row][col] = value
        boardRef.current = t
        return t
      })
      const nextH = h.slice(0, -1)
      historyRef.current = nextH
      return nextH
    })
  }, [flushPendingConflict])

  const erase = useCallback(() => {
    flushPendingConflict()
    setConflictCells(new Set())
    if (!selected) {
      return
    }
    const {row, col} = selected
    if (initialBoard[row][col] !== 0) {
      return
    }
    if (boardRef.current[row][col] === 0) {
      return
    }
    const er = tryConsumeEraseProp(economyRef.current)
    if (!er.ok) {
      Taro.showToast({title: '擦除道具不足', icon: 'none'})
      return
    }
    economyRef.current = er.next
    setEconomy(er.next)
    saveEconomy(er.next)

    const prev = boardRef.current[row][col]
    historyRef.current = [...historyRef.current, {row, col, value: prev}]
    setHistory(historyRef.current)
    setBoard(b => {
      const t = cloneGrid(b)
      t[row][col] = 0
      boardRef.current = t
      return t
    })
  }, [initialBoard, selected, flushPendingConflict])

  useEffect(() => {
    if (process.env.TARO_ENV !== 'h5' || typeof document === 'undefined') {
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (modalWon !== 'off') {
        return
      }
      if (e.repeat) {
        return
      }
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        fillNumber(Number(e.key))
        return
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        erase()
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        flushPendingConflict()
        setConflictCells(new Set())
        setSelected(null)
        setHighlightNum(null)
        return
      }
      const arrows: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      }
      const delta = arrows[e.key]
      if (delta && selected) {
        e.preventDefault()
        setUsedKeyboardNav(true)
        const [dr, dc] = delta
        const nr = Math.min(8, Math.max(0, selected.row + dr))
        const nc = Math.min(8, Math.max(0, selected.col + dc))
        if (nr !== selected.row || nc !== selected.col) {
          selectCell(nr, nc)
        }
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [modalWon, fillNumber, erase, flushPendingConflict, selectCell, selected])

  const diffLabel = (d: Difficulty) =>
    d === 'easy' ? '初级' : d === 'medium' ? '中级' : '高级'

  const patchSettings = useCallback((patch: Partial<GameEconomyState['settings']>) => {
    setEconomy(prev => {
      const n = mergeSettings(prev, patch)
      economyRef.current = n
      saveEconomy(n)
      return n
    })
  }, [])

  const anyModal = modalWon !== 'off' || modalSet !== 'off' || modalHelp !== 'off'
  const heroOpacity = Math.max(0, 1 - Math.min(1, pageScrollTop / 200))

  return (
    <ScrollView
      className={`page${lowDeviceMemory ? ' page--low-mem' : ''}${
        numpadVisibility !== 'off' ? ' page--numpad-open' : ''
      }`}
      scrollY
      showScrollbar={false}
      onScroll={e => {
        const t = (e as {detail?: {scrollTop?: number}}).detail?.scrollTop
        if (typeof t === 'number') {
          setPageScrollTop(t)
        }
      }}
    >
      <View
        className="hero"
        style={process.env.TARO_ENV === 'h5' ? {opacity: heroOpacity} : undefined}
      >
        <View className="hero__a" />
        <View className="hero__b" />
        <View className="hero__c" />
        <View className="hero__d" />
      </View>

      <View className={`content-wrap${anyModal ? ' content-wrap--modal-dim' : ''}`}>
        <Text className="title">数独</Text>
        <Text className="mono">SUDOKU</Text>

        <View className="meta-row">
          <View className="meta-row__pill-btn" onClick={() => setModalHelp('on')}>
            <Text className="meta-row__pill-btn-txt">玩法说明</Text>
          </View>
          <View className="meta-row__settings" onClick={() => setModalSet('on')}>
            <Text className="meta-row__settings-txt">设置</Text>
          </View>
        </View>

        <View className="diff">
          {DIFFICULTIES.map(d => (
            <View
              key={d}
              className={`pill ${difficulty === d ? 'pill--on' : ''}`}
              onClick={() => onDifficulty(d)}>
              <Text className={`pill__txt ${difficulty === d ? 'pill__txt--on' : ''}`}>
                {diffLabel(d)}
              </Text>
            </View>
          ))}
        </View>

        <View className="actions">
          <ViewAction
            className={`btn btn--action btn--glass ${
              economy.undoProps < 1 ? 'btn--disabled' : ''
            }`}
            data-state={
              economy.undoProps < 1
                ? 'disabled'
                : actionPress === 'undo'
                  ? 'pressed'
                  : 'idle'
            }
            hoverClass={economy.undoProps < 1 ? 'none' : 'btn--action-tap'}
            hoverStartTime={0}
            hoverStayTime={0}
            onClick={undo}
            onTouchStart={() => {
              if (economy.undoProps < 1) {
                return
              }
              setActionPress('undo')
            }}
            onTouchEnd={() => setActionPress(null)}
            onTouchCancel={() => setActionPress(null)}
            onMouseDown={e => {
              if (e.button === 0 && economy.undoProps >= 1) {
                setActionPress('undo')
              }
            }}
            onMouseUp={() => setActionPress(null)}
            onMouseLeave={() => setActionPress(null)}
          >
            <Text className="btn__txt">撤销</Text>
          </ViewAction>
          <ViewAction
            className={`btn btn--action btn--glass ${
              economy.eraseProps < 1 ? 'btn--disabled' : ''
            }`}
            data-state={
              economy.eraseProps < 1
                ? 'disabled'
                : actionPress === 'erase'
                  ? 'pressed'
                  : 'idle'
            }
            hoverClass={economy.eraseProps < 1 ? 'none' : 'btn--action-tap'}
            hoverStartTime={0}
            hoverStayTime={0}
            onClick={erase}
            onTouchStart={() => {
              if (economy.eraseProps < 1) {
                return
              }
              setActionPress('erase')
            }}
            onTouchEnd={() => setActionPress(null)}
            onTouchCancel={() => setActionPress(null)}
            onMouseDown={e => {
              if (e.button === 0 && economy.eraseProps >= 1) {
                setActionPress('erase')
              }
            }}
            onMouseUp={() => setActionPress(null)}
            onMouseLeave={() => setActionPress(null)}
          >
            <Text className="btn__txt">擦除</Text>
          </ViewAction>
          <ViewAction
            className="btn btn--action btn--solid"
            data-state={actionPress === 'new' ? 'pressed' : 'idle'}
            hoverClass="btn--action-tap"
            hoverStartTime={0}
            hoverStayTime={0}
            onClick={() => newGame()}
            onTouchStart={() => setActionPress('new')}
            onTouchEnd={() => setActionPress(null)}
            onTouchCancel={() => setActionPress(null)}
            onMouseDown={e => {
              if (e.button === 0) {
                setActionPress('new')
              }
            }}
            onMouseUp={() => setActionPress(null)}
            onMouseLeave={() => setActionPress(null)}
          >
            <Text className="btn__txt btn__txt--inv">新局</Text>
          </ViewAction>
        </View>

        <StatsRow seconds={seconds} steps={steps} />

        <View className="board-section">
          <SudokuGrid
            board={board}
            initialBoard={initialBoard}
            selected={selected}
            conflictCells={conflictCells}
            highlightNum={highlightNum}
            fillPopIndex={fillPopIndex}
            keyboardNav={usedKeyboardNav}
            onCellClick={selectCell}
          />

          <Input
            className="hidden-input"
            type="number"
            value={inputValue}
            focus={hiddenFocus}
            confirmType="done"
            onInput={e => {
              const v = (e.detail as {value?: string}).value ?? ''
              const digits = v.replace(/\D/g, '')
              if (digits.length > 0) {
                const d = Number(digits[digits.length - 1])
                if (d >= 1 && d <= 9) {
                  fillNumber(d)
                }
              }
              setInputValue('')
            }}
          />
        </View>
      </View>

      {modalWon !== 'off' ? (
        <View
          className={`modal modal--win ${modalWon === 'leaving' ? 'modal--leaving' : ''}`}
          catchMove
        >
          <View
            className="modal__mask"
            onClick={modalWon === 'on' ? beginCloseWon : undefined}
          />
          <View className="modal__card">
            <Text className="modal__title modal--win-stg-1">恭喜</Text>
            <WinResultBody active={modalWon === 'on'} seconds={seconds} steps={steps} />
            <View
              className="modal__btn modal--win-stg-4"
              onClick={() => {
                beginCloseWon()
                setTimeout(() => newGame(), MODAL_LEAVE_MS)
              }}
            >
              <Text className="modal__btn-txt">再来一局</Text>
            </View>
          </View>
        </View>
      ) : null}

      {modalSet !== 'off' ? (
        <View
          className={`modal modal--settings ${modalSet === 'leaving' ? 'modal--leaving' : ''}`}
          catchMove
        >
          <View
            className="modal__mask"
            onClick={modalSet === 'on' ? beginCloseSet : undefined}
          />
          <View className="modal__card modal__card--settings">
            <Text className="modal__title">设置</Text>
            <View className="settings-row">
              <Text className="settings-row__label">按下数字时震动</Text>
              <View
                className={`settings-toggle ${
                  economy.settings.vibration ? 'settings-toggle--on' : ''
                }`}
                onClick={() => patchSettings({vibration: !economy.settings.vibration})}
              >
                <View className="settings-toggle__track">
                  <View className="settings-toggle__thumb" />
                </View>
              </View>
            </View>
            <Text className="settings-hint">关闭后，按下数字键时不再轻震动。</Text>
            <View className="modal__btn modal__btn--ghost" onClick={beginCloseSet}>
              <Text className="modal__btn-txt modal__btn-txt--ghost">关闭</Text>
            </View>
          </View>
        </View>
      ) : null}

      {modalHelp !== 'off' ? (
        <View
          className={`modal modal--help ${modalHelp === 'leaving' ? 'modal--leaving' : ''}`}
          catchMove
        >
          <View
            className="modal__mask"
            onClick={modalHelp === 'on' ? beginCloseHelp : undefined}
          />
          <View className="modal__card modal__card--help">
            <Text className="modal__title">玩法说明</Text>
            <ScrollView scrollY className="help-scroll" showScrollbar>
              <View className="help-scroll__inner">
                <Text className="help-h">基本规则</Text>
                <Text className="help-p">
                  在 9×9 盘面中填入数字 1～9，使每一行、每一列、每一个粗线围成的 3×3「宫」内，1～9
                  各出现一次且不重复。开局已给出的数字（题面）不能修改。
                </Text>
                <Text className="help-h">基本操作</Text>
                <Text className="help-p">
                  点选空格后，用键盘输入 1～9 填数；再次点击同一格可配合数字键改数字。若与同行、同列或同宫已有数字冲突，格子会标红提示，错误填入会在短时间内自动撤回。
                </Text>
                <Text className="help-h">难度</Text>
                <Text className="help-p">
                  初级 / 中级 / 高级对应不同挖空数量，难度越高需推理越多。切换难度会开启新局。
                </Text>
                <Text className="help-h">道具</Text>
                <Text className="help-p">
                  撤销、擦除需消耗对应道具，数量不足时无法使用。每日首次进入可领取道具。
                </Text>
                <Text className="help-h">其它</Text>
                <Text className="help-p">
                  可使用撤销逐步回退、擦除清空当前选中格中的自填数字。新局将重新生成题目。完成全盘且符合规则即胜利。
                </Text>
              </View>
            </ScrollView>
            <View className="modal__btn modal__btn--ghost" onClick={beginCloseHelp}>
              <Text className="modal__btn-txt modal__btn-txt--ghost">我知道了</Text>
            </View>
          </View>
        </View>
      ) : null}

      <NumPad
        visibility={numpadVisibility}
        numPress={numPress}
        flash={numPadFlash}
        onPressStart={n => setNumPress(n)}
        onPressEnd={() => setNumPress(null)}
        onFill={n => {
          fillNumber(n)
          setNumPadFlash({key: n, token: Date.now()})
          if (numPadFlashT.current) {
            clearTimeout(numPadFlashT.current)
          }
          numPadFlashT.current = setTimeout(() => {
            setNumPadFlash(null)
            numPadFlashT.current = null
          }, 400)
        }}
      />
    </ScrollView>
  )
}
