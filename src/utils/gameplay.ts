import {
  collectConflictIndices,
  digHoles,
  generateSolution,
  getHoleCount,
  hasConflict,
  isValid,
  type Difficulty,
} from './sudokuEngine'

export type Language = 'zh' | 'en'
export type Notes = number[][]
export type Snapshot = {board: number[][]; notes: Notes}
export type Game = Snapshot & {
  initial: number[][]
  solution: number[][]
  difficulty: Difficulty
  seconds: number
  moves: number
  hints: number
  usedNotes: boolean
  won: boolean
  history: Snapshot[]
  celebrated: number[]
}
export type Hint = {
  index: number
  kind: 'single' | 'hidden' | 'explore' | 'review'
  candidates: number[]
  unit?: number
}
export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
export const copy = (grid: number[][]) => grid.map((row) => [...row])
export function peers(a: number, b: number): boolean {
  return (
    Math.floor(a / 9) === Math.floor(b / 9) ||
    a % 9 === b % 9 ||
    (Math.floor(a / 27) === Math.floor(b / 27) &&
      Math.floor((a % 9) / 3) === Math.floor((b % 9) / 3))
  )
}
export function candidates(board: number[][], index: number): number[] {
  return board[Math.floor(index / 9)][index % 9]
    ? []
    : DIGITS.filter((n) => isValid(board, Math.floor(index / 9), index % 9, n))
}
export const UNITS = Array.from({length: 27}, (_, u) =>
  Array.from({length: 9}, (_, i) =>
    u < 9
      ? u * 9 + i
      : u < 18
        ? i * 9 + u - 9
        : Math.floor((u - 18) / 3) * 27 +
          ((u - 18) % 3) * 3 +
          Math.floor(i / 3) * 9 +
          (i % 3),
  ),
)
export function completedUnits(board: number[][]): number[] {
  return UNITS.flatMap((cells, i) =>
    new Set(cells.map((j) => board[Math.floor(j / 9)][j % 9])).size === 9 &&
    cells.every((j) => board[Math.floor(j / 9)][j % 9] > 0)
      ? [i]
      : [],
  )
}
export function createGame(difficulty: Difficulty = 'medium'): Game {
  const solution = generateSolution(),
    board = copy(solution),
    initial = copy(solution)
  digHoles(board, initial, getHoleCount(difficulty))
  return {
    solution,
    board,
    initial,
    notes: Array.from({length: 81}, () => []),
    difficulty,
    seconds: 0,
    moves: 0,
    hints: 0,
    usedNotes: false,
    won: false,
    history: [],
    celebrated: completedUnits(board),
  }
}
export function move(
  game: Game,
  index: number,
  value: number,
  noteMode: boolean,
): {game: Game; conflicts: number[]} {
  const r = Math.floor(index / 9),
    c = index % 9
  if (game.won || game.initial[r][c]) return {game, conflicts: []}
  const board = copy(game.board),
    notes = copy(game.notes)
  if (noteMode && value > 0) {
    if (board[r][c]) return {game, conflicts: []}
    notes[index] = notes[index].includes(value)
      ? notes[index].filter((n) => n !== value)
      : [...notes[index], value].sort()
  } else {
    if (board[r][c] === value && (value !== 0 || !notes[index].length))
      return {game, conflicts: []}
    board[r][c] = value
    if (value && hasConflict(board, r, c, value))
      return {game, conflicts: [...collectConflictIndices(board, r, c, value)]}
    notes[index] = []
    if (value)
      notes.forEach((ns, i) => {
        if (peers(index, i)) notes[i] = ns.filter((n) => n !== value)
      })
  }
  const units = completedUnits(board)
  return {
    game: {
      ...game,
      board,
      notes,
      history: [...game.history, {board: game.board, notes: game.notes}].slice(
        -200,
      ),
      moves: game.moves + (noteMode ? 0 : 1),
      usedNotes: game.usedNotes || noteMode,
      won: units.length === 27,
      celebrated: [...new Set([...game.celebrated, ...units])],
    },
    conflicts: [],
  }
}
export function undoMove(game: Game): Game {
  const last = game.history[game.history.length - 1]
  return last && !game.won
    ? {...game, ...last, history: game.history.slice(0, -1)}
    : game
}
export function findHint(game: Game): Hint | null {
  // Review incorrect entries before teaching deductions from an inconsistent position.
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9),
      c = i % 9
    if (game.board[r][c] && game.board[r][c] !== game.solution[r][c])
      return {index: i, kind: 'review', candidates: []}
  }
  const entries = Array.from({length: 81}, (_, index) => ({
    index,
    candidates: candidates(game.board, index),
  })).filter((e) => !game.board[Math.floor(e.index / 9)][e.index % 9])
  const single = entries.find((e) => e.candidates.length === 1)
  if (single) return {...single, kind: 'single'}
  for (let u = 0; u < UNITS.length; u++)
    for (const n of DIGITS) {
      const cells = entries.filter(
        (e) => UNITS[u].includes(e.index) && e.candidates.includes(n),
      )
      if (cells.length === 1)
        return {...cells[0], kind: 'hidden', unit: u, candidates: [n]}
    }
  const best = entries.sort(
    (a, b) => a.candidates.length - b.candidates.length,
  )[0]
  return best ? {...best, kind: 'explore'} : null
}
export function hintText(h: Hint, stage: number, lang: Language): string {
  const en = lang === 'en',
    pos = `R${Math.floor(h.index / 9) + 1}C${(h.index % 9) + 1}`
  if (h.kind === 'review')
    return en
      ? `Review your entry at ${pos}. Compare it with the original clues before continuing.`
      : `回看 ${pos} 的填写。请结合题目给定数字重新检查，再继续推理。`
  if (stage === 0)
    return en
      ? `Look at ${pos}. Observe its row, column and box. Which digits are already present?`
      : `看看 ${pos}。观察它所在的行、列和宫，哪些数字已经出现过？`
  if (stage === 1)
    return h.kind === 'hidden'
      ? en
        ? 'In the highlighted unit, compare where each missing digit can go. Is one digit limited to a single cell?'
        : '比较高亮区域里缺少的数字：有没有一个数字，只能放在一个位置？'
      : en
        ? 'Cross out digits already in its row, column or box. Record the remaining candidates yourself.'
        : '排除同行、同列、同宫里已有的数字，亲手记录剩下的候选数。'
  if (h.kind === 'explore')
    return en
      ? `Legal candidates here: ${h.candidates.join(', ')}. This is not yet a forced move. Compare nearby cells before choosing.`
      : `这里的合法候选数为 ${h.candidates.join('、')}，还不能直接确定答案。继续比较周围格子的候选数。`
  return en
    ? `Only ${h.candidates[0]} fits ${h.kind === 'hidden' ? 'this digit’s placement in the unit' : 'all three constraints'}. Check the reasoning, then enter it yourself.`
    : h.kind === 'hidden'
      ? `在高亮区域中，${h.candidates[0]} 只能放在这个位置。请结合行、列和宫再次核对，再由你填写。`
      : `排除行、列、宫中已有的数字后，只剩候选数 ${h.candidates[0]}。理解后，由你来填写。`
}
// Storage is untrusted: restore only complete, internally consistent versioned games.
export function isSavedGame(value: unknown): value is Game {
  if (!value || typeof value !== 'object') return false
  const g = value as Game
  const grid = (a: unknown): a is number[][] =>
    Array.isArray(a) &&
    a.length === 9 &&
    a.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 9 &&
        row.every((n) => Number.isInteger(n) && n >= 0 && n <= 9),
    )
  if (
    !grid(g.board) ||
    g.board.some((row, r) =>
      row.some((n, c) => n !== 0 && hasConflict(g.board, r, c, n)),
    ) ||
    !grid(g.initial) ||
    !grid(g.solution) ||
    g.solution.some((row, r) =>
      row.some((n, c) => !n || hasConflict(g.solution, r, c, n)),
    )
  )
    return false
  if (
    g.initial.some((row, r) =>
      row.some(
        (n, c) => n !== 0 && (n !== g.solution[r][c] || n !== g.board[r][c]),
      ),
    )
  )
    return false
  if (
    !Array.isArray(g.notes) ||
    g.notes.length !== 81 ||
    !g.notes.every(
      (ns) => Array.isArray(ns) && ns.every((n) => DIGITS.includes(n)),
    )
  )
    return false
  return (
    ['easy', 'medium', 'hard'].includes(g.difficulty) &&
    [g.seconds, g.moves, g.hints].every((n) => Number.isFinite(n) && n >= 0) &&
    typeof g.won === 'boolean' &&
    typeof g.usedNotes === 'boolean' &&
    Array.isArray(g.celebrated) &&
    g.celebrated.every((n) => Number.isInteger(n) && n >= 0 && n < 27) &&
    g.won === (completedUnits(g.board).length === 27)
  )
}
