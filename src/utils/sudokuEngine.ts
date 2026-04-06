export type Difficulty = 'easy' | 'medium' | 'hard'

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

function shuffleInPlace<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) {
      return false
    }
  }
  const startRow = Math.floor(row / 3) * 3
  const startCol = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[startRow + i][startCol + j] === num) {
        return false
      }
    }
  }
  return true
}

const DIGITS_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function solveSudoku(grid: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffleInPlace(DIGITS_POOL.slice())
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num
            if (solveSudoku(grid)) {
              return true
            }
            grid[row][col] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

export function generateSolution(): number[][] {
  const grid = Array.from({length: 9}, () => Array(9).fill(0))
  solveSudoku(grid)
  return grid
}

export function digHoles(
  board: number[][],
  initialBoard: number[][],
  holes: number,
): void {
  const positions: [number, number][] = []
  for (let i = 0; i < 81; i++) {
    positions.push([Math.floor(i / 9), i % 9])
  }
  const order = shuffleInPlace([...positions])
  let dug = 0
  for (const [row, col] of order) {
    if (dug >= holes) {
      break
    }
    if (board[row][col] !== 0) {
      board[row][col] = 0
      initialBoard[row][col] = 0
      dug++
    }
  }
}

/** 仅检查同行、同列、同宫，避免 81 格全扫描 */
export function hasConflict(
  board: number[][],
  row: number,
  col: number,
  num: number,
): boolean {
  for (let j = 0; j < 9; j++) {
    if (j !== col && board[row][j] === num) {
      return true
    }
  }
  for (let i = 0; i < 9; i++) {
    if (i !== row && board[i][col] === num) {
      return true
    }
  }
  const br = Math.floor(row / 3) * 3
  const bc = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = br + i
      const c = bc + j
      if ((r !== row || c !== col) && board[r][c] === num) {
        return true
      }
    }
  }
  return false
}

/** 与 hasConflict 相同几何范围，用于高亮冲突格（索引 row*9+col） */
export function collectConflictIndices(
  board: number[][],
  row: number,
  col: number,
  num: number,
): Set<number> {
  const out = new Set<number>()
  out.add(row * 9 + col)
  for (let j = 0; j < 9; j++) {
    if (j !== col && board[row][j] === num) {
      out.add(row * 9 + j)
    }
  }
  for (let i = 0; i < 9; i++) {
    if (i !== row && board[i][col] === num) {
      out.add(i * 9 + col)
    }
  }
  const br = Math.floor(row / 3) * 3
  const bc = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = br + i
      const c = bc + j
      if ((r !== row || c !== col) && board[r][c] === num) {
        out.add(r * 9 + c)
      }
    }
  }
  return out
}

export function boardsEqual(a: number[][], b: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (a[r][c] !== b[r][c]) {
        return false
      }
    }
  }
  return true
}

export function countMissing(board: number[][], digit: number): number {
  let n = 0
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === digit) {
        n++
      }
    }
  }
  return Math.max(0, 9 - n)
}
