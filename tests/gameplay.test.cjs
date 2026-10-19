const assert = require('node:assert/strict')
const {test} = require('node:test')
// Compile only pure game modules, keeping this test independent of the H5 runtime.
const ts = require('typescript'),
  fs = require('node:fs'),
  Module = require('node:module'),
  path = require('node:path')
const cache = new Map()
function load(file) {
  file = path.resolve(__dirname, '../src/utils', file + '.ts')
  if (cache.has(file)) return cache.get(file).exports
  const mod = new Module(file, module)
  cache.set(file, mod)
  mod.filename = file
  mod.paths = module.paths
  mod.require = (id) => (id.startsWith('./') ? load(id.slice(2)) : require(id))
  mod._compile(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    file,
  )
  return mod.exports
}
const e = load('sudokuEngine'),
  g = load('gameplay')
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
