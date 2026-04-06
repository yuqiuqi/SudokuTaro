import {Input, ScrollView, Text, View} from '@tarojs/components'
import React, {memo, useCallback, useEffect, useRef, useState} from 'react'

import {
  type Difficulty,
  boardsEqual,
  collectConflictIndices,
  digHoles,
  generateSolution,
  getHoleCount,
  hasConflict,
} from '../../utils/sudokuEngine'
import {logRuntimeDiagnostics} from '../../utils/devDiagnostics'

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

function cellIndex(r: number, c: number): number {
  return r * 9 + c
}

type SudokuGridProps = {
  board: number[][]
  initialBoard: number[][]
  selected: CellSel
  conflictCells: Set<number>
  highlightNum: number | null
  onCellClick: (row: number, col: number) => void
}

const SudokuGrid = memo(function SudokuGrid({
  board,
  initialBoard,
  selected,
  conflictCells,
  highlightNum,
  onCellClick,
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

  return (
    <View className="grid">
      {board.map((row, r) =>
        row.map((val, c) => {
          const isSel = selected?.row === r && selected?.col === c
          const thickR = c === 2 || c === 5
          const thickB = r === 2 || r === 5
          const fixed = initialBoard[r][c] !== 0
          const user = !fixed && val !== 0
          const conflict = conflictCells.has(cellIndex(r, c))
          const dim = regionMask(r, c)
          const hl = sameNum(r, c)
          const blockAlt = (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 1
          const cls = [
            'cell',
            thickR ? 'cell--thick-r' : '',
            thickB ? 'cell--thick-b' : '',
            blockAlt ? 'cell--block-alt' : '',
            dim ? 'cell--dim' : '',
            hl ? 'cell--same' : '',
            conflict ? 'cell--bad' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <View
              key={cellIndex(r, c)}
              className={cls}
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
  const [wonOpen, setWonOpen] = useState(false)
  const [hiddenFocus, setHiddenFocus] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const conflictTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boardRef = useRef(board)
  const historyRef = useRef(history)
  const pendingConflictRevert = useRef<{row: number; col: number; revertTo: number} | null>(null)

  boardRef.current = board
  historyRef.current = history

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

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
      const diff = d ?? difficulty
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
      setWonOpen(false)
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
    !wonOpen &&
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
      setDifficulty(d)
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

      setSteps(s => s + 1)
      if (boardsEqual(next, solution)) {
        stopTimer()
        setWonOpen(true)
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
      if (wonOpen) {
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
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [wonOpen, fillNumber, erase, flushPendingConflict])

  const diffLabel = (d: Difficulty) =>
    d === 'easy' ? '初级' : d === 'medium' ? '中级' : '高级'

  return (
    <ScrollView className="page" scrollY showScrollbar={false}>
      <View className="hero">
        <View className="hero__a" />
        <View className="hero__b" />
        <View className="hero__c" />
        <View className="hero__d" />
      </View>

      <View className="content-wrap">
        <Text className="title">数独</Text>
        <Text className="mono">SUDOKU</Text>

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
          <View className="btn btn--glass" onClick={undo}>
            <Text className="btn__txt">撤销</Text>
          </View>
          <View className="btn btn--glass" onClick={erase}>
            <Text className="btn__txt">擦除</Text>
          </View>
          <View className="btn btn--solid" onClick={() => newGame()}>
            <Text className="btn__txt btn__txt--inv">新局</Text>
          </View>
        </View>

        <StatsRow seconds={seconds} steps={steps} />

        <View className="board-section">
          <SudokuGrid
            board={board}
            initialBoard={initialBoard}
            selected={selected}
            conflictCells={conflictCells}
            highlightNum={highlightNum}
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

      {wonOpen ? (
        <View className="modal" catchMove>
          <View className="modal__mask" onClick={() => setWonOpen(false)} />
          <View className="modal__card">
            <Text className="modal__title">恭喜</Text>
            <Text className="modal__body">
              你在 {formatSeconds(seconds)}（{seconds} 秒）完成数独，步数 {steps}。
            </Text>
            <View
              className="modal__btn"
              onClick={() => {
                setWonOpen(false)
                newGame()
              }}>
              <Text className="modal__btn-txt">再来一局</Text>
            </View>
          </View>
        </View>
      ) : null}
    </ScrollView>
  )
}
