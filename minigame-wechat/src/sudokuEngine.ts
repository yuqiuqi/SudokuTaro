/**
 * 与仓库根目录 src/utils/sudokuEngine.ts 保持逻辑一致（修改时请同步两处）。
 */
import type { Difficulty, Grid } from './types'

function shuffleInPlace<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]!
    a[i] = a[j]!
    a[j] = t
  }
  return a
}

export function getHoleCount(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 45 + Math.floor(Math.random() * 6)
    case 'medium':
      return 50 + Math.floor(Math.random() * 6)
    case 'hard':
      return 55 + Math.floor(Math.random() * 11)
    default:
      return 45
  }
}

function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row]![i] === num || grid[i]![col] === num) {
      return false
    }
  }
  const startRow = Math.floor(row / 3) * 3
  const startCol = Math.floor(col / 3) * 3
  for (let ii = 0; ii < 3; ii++) {
    for (let jj = 0; jj < 3; jj++) {
      if (grid[startRow + ii]![startCol + jj] === num) {
        return false
      }
    }
  }
  return true
}

const DIGITS_POOL: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function solveSudoku(grid: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row]![col] === 0) {
        const nums = shuffleInPlace(DIGITS_POOL.slice())
        for (let k = 0; k < nums.length; k++) {
          const num = nums[k]!
          if (isValid(grid, row, col, num)) {
            grid[row]![col] = num
            if (solveSudoku(grid)) {
              return true
            }
            grid[row]![col] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

export function generateSolution(): Grid {
  const grid: Grid = []
  for (let r = 0; r < 9; r++) {
    grid.push(Array<number>(9).fill(0))
  }
  solveSudoku(grid)
  return grid
}

export function digHoles(
  board: Grid,
  initialBoard: Grid,
  holes: number,
): void {
  const positions: [number, number][] = []
  for (let i = 0; i < 81; i++) {
    positions.push([Math.floor(i / 9), i % 9])
  }
  const order = shuffleInPlace(positions.slice())
  let dug = 0
  for (let p = 0; p < order.length; p++) {
    if (dug >= holes) {
      break
    }
    const row = order[p]![0]
    const col = order[p]![1]
    if (board[row]![col] !== 0) {
      board[row]![col] = 0
      initialBoard[row]![col] = 0
      dug++
    }
  }
}

export function hasConflict(
  board: Grid,
  row: number,
  col: number,
  num: number,
): boolean {
  for (let j = 0; j < 9; j++) {
    if (j !== col && board[row]![j] === num) {
      return true
    }
  }
  for (let i = 0; i < 9; i++) {
    if (i !== row && board[i]![col] === num) {
      return true
    }
  }
  const br = Math.floor(row / 3) * 3
  const bc = Math.floor(col / 3) * 3
  for (let ii = 0; ii < 3; ii++) {
    for (let jj = 0; jj < 3; jj++) {
      const r = br + ii
      const c = bc + jj
      if ((r !== row || c !== col) && board[r]![c] === num) {
        return true
      }
    }
  }
  return false
}

export function collectConflictIndices(
  board: Grid,
  row: number,
  col: number,
  num: number,
): Set<number> {
  const out = new Set<number>()
  out.add(row * 9 + col)
  for (let j = 0; j < 9; j++) {
    if (j !== col && board[row]![j] === num) {
      out.add(row * 9 + j)
    }
  }
  for (let i = 0; i < 9; i++) {
    if (i !== row && board[i]![col] === num) {
      out.add(i * 9 + col)
    }
  }
  const br = Math.floor(row / 3) * 3
  const bc = Math.floor(col / 3) * 3
  for (let ii = 0; ii < 3; ii++) {
    for (let jj = 0; jj < 3; jj++) {
      const r = br + ii
      const c = bc + jj
      if ((r !== row || c !== col) && board[r]![c] === num) {
        out.add(r * 9 + c)
      }
    }
  }
  return out
}

export function boardsEqual(a: Grid, b: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (a[r]![c] !== b[r]![c]) {
        return false
      }
    }
  }
  return true
}
