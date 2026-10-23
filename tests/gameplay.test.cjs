const assert = require('node:assert/strict')
const {test, after} = require('node:test')
// Compile only pure game modules, keeping this test independent of the H5 runtime.
// TypeScript 7 is a native compiler and no longer exposes transpileModule.
const {execFileSync} = require('node:child_process'),
  fs = require('node:fs'),
  os = require('node:os'),
  path = require('node:path')
const compiled = fs.mkdtempSync(path.join(os.tmpdir(), 'sudokutaro-tests-'))
after(() => fs.rmSync(compiled, {recursive: true, force: true}))
try {
  execFileSync(process.execPath, [
    path.join(path.dirname(require.resolve('typescript/package.json')), 'bin/tsc'),
    '--ignoreConfig', '--module', 'node16', '--moduleResolution', 'node16',
    '--target', 'ES2020', '--skipLibCheck', '--outDir', compiled,
    path.resolve(__dirname, '../src/utils/sudokuEngine.ts'),
    path.resolve(__dirname, '../src/utils/gameplay.ts'),
  ], {stdio: 'pipe'})
} catch (error) {
  fs.rmSync(compiled, {recursive: true, force: true})
  throw new Error(`Logic test compilation failed:\n${error.stdout || ''}\n${error.stderr || ''}`, {cause: error})
}
const e = require(path.join(compiled, 'sudokuEngine.js')),
  g = require(path.join(compiled, 'gameplay.js'))
const puzzle = [
  '530070000',
  '600195000',
  '098000060',
  '800060003',
  '400803001',
  '700020006',
  '060000280',
  '000419005',
  '000080079',
].map((s) => [...s].map(Number))
function fixture() {
  const solution = g.copy(puzzle)
  e.solveSudoku(solution)
  return {
    ...g.createGame('easy'),
    board: g.copy(puzzle),
    initial: g.copy(puzzle),
    solution,
    notes: Array.from({length: 81}, () => []),
    celebrated: g.completedUnits(puzzle),
  }
}
test('every difficulty generates a unique puzzle and leaves caller data unchanged during counting', () => {
  for (const difficulty of ['easy', 'medium', 'hard'])
    for (let i = 0; i < 3; i++) {
      const game = g.createGame(difficulty),
        before = JSON.stringify(game.board)
      assert.equal(e.countSolutions(game.board), 1)
      assert.equal(JSON.stringify(game.board), before)
      assert.ok(game.board.flat().filter((n) => !n).length >= 35)
    }
})
const givenRanges = {easy: [36, 40], medium: [31, 35], hard: [26, 30]}
function seededRandom(seed) {
  return () => {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}
function assertDifficultyGame(game, difficulty) {
  const given = game.initial.flat().filter(Boolean).length
  const [min, max] = givenRanges[difficulty]
  assert.ok(given >= min && given <= max, `${difficulty}: ${given} givens outside ${min}–${max}`)
  assert.equal(game.difficulty, difficulty)
  assert.deepEqual(game.board, game.initial)
  assert.equal(e.countSolutions(game.board), 1)
  assert.equal(e.countSolutions(game.solution), 1)
  assert.ok(game.initial.every((row, r) => row.every((n, c) => !n || n === game.solution[r][c])))
  assert.ok(g.isSavedGame(game))
}
test('new games keep actual given counts in strictly ordered, disjoint difficulty ranges', () => {
  const original = Math.random
  try {
    for (const difficulty of Object.keys(givenRanges)) {
      for (let seed = 1; seed <= 60; seed++) {
        Math.random = seededRandom(seed)
        assertDifficultyGame(g.createGame(difficulty), difficulty)
      }
    }
  } finally { Math.random = original }
})
test('hole targets remain in the selected difficulty range at both random endpoints', () => {
  const original = Math.random
  try {
    for (const difficulty of Object.keys(givenRanges)) {
      for (const random of [0, 0.999999]) {
        Math.random = () => random
        const given = 81 - e.getHoleCount(difficulty)
        assert.ok(given >= givenRanges[difficulty][0] && given <= givenRanges[difficulty][1], `${difficulty}: target ${given}`)
      }
    }
  } finally { Math.random = original }
})
test('generation stops after two failed attempts and returns a valid in-range unique fallback', () => {
  const originalDig = e.digHoles, originalGenerate = e.generateSolution, originalRandom = Math.random
  try {
    e.digHoles = () => {} // Simulate a generator unable to remove any clue.
    for (const difficulty of Object.keys(givenRanges)) {
      let attempts = 0
      Math.random = seededRandom(29)
      e.generateSolution = () => { attempts++; return originalGenerate() }
      assertDifficultyGame(g.createGame(difficulty), difficulty)
      assert.equal(attempts, 2, 'fallback must bound complete generation attempts')
    }
  } finally { e.digHoles = originalDig; e.generateSolution = originalGenerate; Math.random = originalRandom }
})
test('valid older saves retain their original puzzle even outside the new clue ranges', () => {
  const game = fixture()
  assert.equal(game.initial.flat().filter(Boolean).length, 30)
  assert.equal(game.difficulty, 'easy')
  assert.ok(g.isSavedGame(game))
  assert.deepEqual(game.initial, puzzle)
})
test('counter detects multiple solutions and invalid filled boards', () => {
  assert.equal(
    e.countSolutions(Array.from({length: 9}, () => Array(9).fill(0))),
    2,
  )
  const b = g.copy(puzzle)
  b[0][2] = 5
  assert.equal(e.countSolutions(b), 0)
})
test('notes toggle independently; undo restores notes pruned by a correct placement', () => {
  let game = fixture()
  game = g.move(game, 2, 4, true).game
  game = g.move(game, 3, 4, true).game
  const prior = game
  game = g.move(game, 2, 4, false).game
  assert.equal(game.board[0][2], 4)
  assert.deepEqual(game.notes[2], [])
  assert.deepEqual(game.notes[3], [])
  assert.deepEqual(g.undoMove(game).notes, prior.notes)
  assert.deepEqual(g.undoMove(game).board, prior.board)
  const toggle = g.move(prior, 2, 4, true).game
  assert.deepEqual(toggle.notes[2], [])
})
test('clues are immutable and conflicts never overwrite the board or notes', () => {
  const game = fixture()
  assert.equal(g.move(game, 0, 9, false).game, game)
  const result = g.move(game, 2, 5, false)
  assert.equal(result.game, game)
  assert.ok(result.conflicts.includes(0))
  assert.ok(result.conflicts.includes(2))
})
test('hints explain a justified move without changing the board', () => {
  let game = fixture(),
    before = JSON.stringify(game),
    h = g.findHint(game)
  assert.ok(h)
  assert.equal(JSON.stringify(game), before)
  assert.equal(h.candidates.length, 1)
  assert.equal(
    game.solution[Math.floor(h.index / 9)][h.index % 9],
    h.candidates[0],
  )
  assert.ok(g.hintText(h, 0, 'en').includes('Look'))
  assert.ok(g.hintText(h, 2, 'zh').includes('由你'))
  const wrong = g.copy(game.board)
  wrong[0][2] = 1
  game = {...game, board: wrong}
  assert.equal(g.findHint(game).kind, 'review')
})
test('a completed valid board wins and cannot be edited', () => {
  let game = fixture()
  game = {...game, board: g.copy(game.solution)}
  game.board[0][2] = 0
  game = g.move(game, 2, game.solution[0][2], false).game
  assert.equal(game.won, true)
  assert.equal(g.completedUnits(game.board).length, 27)
  assert.equal(g.move(game, 2, 0, false).game, game)
})
test('storage rejects malformed games and accepts valid progress', () => {
  const game = fixture()
  assert.equal(g.isSavedGame(game), true)
  for (const v of [
    null,
    {},
    {...game, notes: []},
    {...game, seconds: -1},
    {...game, won: true},
    {...game, initial: Array.from({length: 9}, () => Array(9).fill(9))},
  ])
    assert.equal(g.isSavedGame(v), false)
})

test('hints name rows and columns in everyday language in both locales', () => {
  for (const kind of ['single', 'review']) {
    const hint = {index: 37, kind, candidates: [4]}
    for (const [lang, location] of [
      ['zh', '第5行，第2列'],
      ['en', 'row 5, column 2'],
    ]) {
      const text = g.hintText(hint, 0, lang)
      assert.ok(text.includes(location), text)
      assert.doesNotMatch(text, /R\dC\d/)
    }
  }
})

test('hint steps offer one review message or three different teaching clues', () => {
  for (const lang of ['zh', 'en']) {
    for (const kind of ['review', 'single', 'hidden', 'explore']) {
      const hint = {
        index: 37,
        kind,
        candidates: kind === 'explore' ? [1, 4] : [4],
        unit: 4,
      }
      const steps = g.hintSteps(hint, lang)
      assert.equal(steps.length, kind === 'review' ? 1 : 3)
      assert.equal(new Set(steps).size, steps.length)
      assert.ok(steps.every((text) => text.length > 0))
    }
  }
})
