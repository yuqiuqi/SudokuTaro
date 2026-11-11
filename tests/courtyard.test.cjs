const assert = require('node:assert/strict')
const {test, after} = require('node:test')
const {execFileSync} = require('node:child_process')
const fs = require('node:fs'), os = require('node:os'), path = require('node:path')
const compiled = fs.mkdtempSync(path.join(os.tmpdir(), 'fangcun-courtyard-'))
after(() => fs.rmSync(compiled, {recursive:true, force:true}))
try {
  execFileSync(process.execPath, [path.join(path.dirname(require.resolve('typescript/package.json')), 'bin/tsc'),
    '--ignoreConfig','--module','node16','--moduleResolution','node16','--target','ES2020','--skipLibCheck','--outDir',compiled,
    path.resolve(__dirname,'../src/platform/storage.ts'),path.resolve(__dirname,'../src/features/courtyard/story.ts'),path.resolve(__dirname,'../src/features/courtyard/chapters.ts')], {stdio:'pipe'})
} catch (error) {
  fs.rmSync(compiled,{recursive:true,force:true})
  throw new Error(`Courtyard compilation failed:\n${error.stdout || ''}\n${error.stderr || ''}`,{cause:error})
}
const story = require(path.join(compiled,'features/courtyard/story.js'))
const storage = require(path.join(compiled,'platform/storage.js'))
const gameplay = require(path.join(compiled,'utils/gameplay.js'))
const GAME='sudokutaro:glass:v1', RECORDS='sudokutaro:records:v1', COURTYARD='fangcun:courtyard:v1'
function memory(values={}) {
  const map=new Map(Object.entries(values))
  return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),map}
}
const fixture = gameplay.createGame('easy')
const chapter = n => `courtyard-${String(n).padStart(2,'0')}`

test('a new courtyard has one free chapter without using historical win counts',()=>{
  const p=story.createCourtyardProgress()
  assert.equal(p.version,1);assert.equal(p.unlockedThrough,0);assert.equal(p.mode,'story')
  assert.deepEqual(p.creditedSessionIds,[]);assert.deepEqual(p.readChapterIds,[])
  const m=memory({[RECORDS]:JSON.stringify({wins:900,best:{easy:10}})})
  assert.deepEqual(storage.loadCourtyardProgress(m),p)
  assert.equal(JSON.parse(m.getItem(RECORDS)).wins,900)
})
test('each fresh completed session opens exactly one chapter and repeated completion is harmless',()=>{
  const p=story.createCourtyardProgress(), next=story.advanceCourtyard(p,'session-one')
  assert.equal(p.unlockedThrough,0);assert.equal(next.unlockedThrough,1)
  assert.deepEqual(next.creditedSessionIds,['session-one'])
  assert.deepEqual(story.advanceCourtyard(next,'session-one'),next)
  const second=story.advanceCourtyard(next,'session-two')
  assert.equal(second.unlockedThrough,2);assert.deepEqual(second.creditedSessionIds,['session-one','session-two'])
})
test('the finite story caps at eight chapters without an ever-growing session ledger',()=>{
  let p=story.createCourtyardProgress()
  for(let i=1;i<=7;i++) p=story.advanceCourtyard(p,`session-${i}`)
  assert.equal(p.unlockedThrough,7);assert.equal(p.creditedSessionIds.length,7)
  const full=structuredClone(p)
  for(let i=8;i<=50;i++) p=story.advanceCourtyard(p,`session-${i}`)
  assert.deepEqual(p,full)
})
test('opening a chapter only marks unlocked content, never credits a win or unlocks another chapter',()=>{
  const p=story.createCourtyardProgress(), read=story.markChapterRead(p,chapter(1))
  assert.deepEqual(read.readChapterIds,[chapter(1)]);assert.equal(read.unlockedThrough,0)
  assert.deepEqual(read.creditedSessionIds,[]);assert.deepEqual(p.readChapterIds,[])
  assert.deepEqual(story.markChapterRead(read,chapter(1)),read)
  assert.deepEqual(story.markChapterRead(read,chapter(8)),read)
  assert.deepEqual(story.markChapterRead(read,'not-a-chapter'),read)
})
test('sudoku-only mode continues earning chapters without being forced back to story mode',()=>{
  const p={...story.createCourtyardProgress(),mode:'sudoku'}
  const next=story.advanceCourtyard(p,'quiet-session')
  assert.equal(next.mode,'sudoku');assert.equal(next.unlockedThrough,1)
})
test('story validation rejects malformed, future and impossible progress',()=>{
  const p=story.createCourtyardProgress();assert.ok(story.isCourtyardProgress(p))
  for(const bad of [null,{}, {...p,version:2},{...p,unlockedThrough:-1},{...p,unlockedThrough:8},
    {...p,unlockedThrough:1.5},{...p,mode:'unknown'},{...p,readChapterIds:['bogus']},
    {...p,readChapterIds:[chapter(8)]},{...p,creditedSessionIds:['a','a']},
    {...p,creditedSessionIds:Array.from({length:7},(_,i)=>`impossible-${i}`)},
    {...p,creditedSessionIds:Array.from({length:8},(_,i)=>`id-${i}`)}]) {
    assert.equal(story.isCourtyardProgress(bad),false,JSON.stringify(bad))
  }
})
test('story round-trip preserves chapters and deduplication in a separate storage key',()=>{
  const m=memory({[GAME]:JSON.stringify(fixture)})
  const before=m.getItem(GAME)
  const p=story.markChapterRead(story.advanceCourtyard(story.createCourtyardProgress(),'saved-win'),chapter(2))
  assert.equal(storage.persistCourtyardProgress(p,m),true)
  assert.ok(m.getItem(COURTYARD));assert.equal(m.getItem(GAME),before)
  const restored=storage.loadCourtyardProgress(m)
  assert.deepEqual(restored,p);assert.deepEqual(story.advanceCourtyard(restored,'saved-win'),p)
})
test('bad story JSON and unavailable storage safely fall back without changing a saved game',()=>{
  for(const raw of ['{broken',JSON.stringify({version:999}),JSON.stringify(null)]) {
    const m=memory({[COURTYARD]:raw,[GAME]:JSON.stringify(fixture)}),before=m.getItem(GAME)
    assert.deepEqual(storage.loadCourtyardProgress(m),story.createCourtyardProgress())
    assert.equal(m.getItem(GAME),before)
  }
  assert.deepEqual(storage.loadCourtyardProgress(null),story.createCourtyardProgress())
})
test('a valid legacy game receives one stable identity while preserving progress and clearing transient undo history',()=>{
  const old={...structuredClone(fixture),seconds:123,moves:8,hints:2,usedNotes:true,history:[{board:fixture.board,notes:fixture.notes}]}
  delete old.sessionId
  const m=memory({[GAME]:JSON.stringify(old)}),loaded=storage.loadGame(m)
  assert.ok(gameplay.isSavedGame(loaded));assert.equal(typeof loaded.sessionId,'string');assert.ok(loaded.sessionId.length>0)
  for(const key of ['board','initial','solution','notes','difficulty','seconds','moves','hints','usedNotes','won','celebrated']) assert.deepEqual(loaded[key],old[key],key)
  assert.deepEqual(loaded.history,[])
  assert.equal(storage.loadGame(m).sessionId,loaded.sessionId)
})
test('persisting keeps the session identity and game data while omitting undo history',()=>{
  const m=memory(),g=storage.loadGame(m)
  g.history=[{board:g.board,notes:g.notes}]
  const before=structuredClone(g)
  assert.equal(storage.persistGame(g,m),true)
  const saved=JSON.parse(m.getItem(GAME))
  assert.deepEqual(saved.history,[]);assert.equal(saved.sessionId,g.sessionId)
  assert.deepEqual(g,before,'serialization does not mutate the active session')
})
test('loading an already-completed legacy game keeps it complete without granting story credit',()=>{
  const won={...structuredClone(fixture),board:fixture.solution,won:true}
  const m=memory({[GAME]:JSON.stringify(won)})
  assert.equal(storage.loadGame(m).won,true)
  assert.equal(storage.loadCourtyardProgress(m).unlockedThrough,0)
})
test('record and preference adapters preserve only valid existing data',()=>{
  const m=memory({[RECORDS]:JSON.stringify({wins:8,best:{easy:100,medium:-1,hard:250,alien:2}}),
    'sudokutaro:language':'en','sudokutaro:vibration':'true'})
  assert.deepEqual(storage.loadRecords(m),{wins:8,best:{easy:100,hard:250}})
  assert.equal(storage.loadLanguage(m),'en');assert.equal(storage.loadVibration(m),true)
  assert.equal(storage.persistLanguage('zh',m),true);assert.equal(m.getItem('sudokutaro:language'),'zh')
  assert.equal(storage.persistVibration(false,m),true);assert.equal(m.getItem('sudokutaro:vibration'),'false')
  assert.equal(storage.persistRecords({wins:9,best:{easy:90}},m),true)
  assert.deepEqual(storage.loadRecords(m),{wins:9,best:{easy:90}})
})
test('storage exceptions leave gameplay usable and writes report failure',()=>{
  const broken={getItem(){throw new Error('blocked')},setItem(){throw new Error('quota')}}
  const g=storage.loadGame(broken);assert.ok(gameplay.isSavedGame(g));assert.ok(g.sessionId)
  assert.deepEqual(storage.loadRecords(broken),{wins:0,best:{}})
  assert.equal(storage.loadLanguage(broken),'zh');assert.equal(storage.loadVibration(broken),false)
  assert.equal(storage.persistGame(g,broken),false)
  assert.equal(storage.persistRecords({wins:1,best:{}},broken),false)
  assert.equal(storage.persistCourtyardProgress(story.createCourtyardProgress(),broken),false)
})

const chapters = require(path.join(compiled,'features/courtyard/chapters.js')).chapters
test('the first volume contains eight distinct complete bilingual chapters and eight restoration objects',()=>{
  assert.equal(chapters.length,8)
  assert.equal(new Set(chapters.map(c=>c.scene)).size,8)
  for(const [index,c] of chapters.entries()) {
    assert.equal(c.id,chapter(index+1));assert.ok(c.title.zh&&c.title.en)
    const length=[...c.body.zh.replace(/\s/g,'')].length
    assert.ok(length>=120&&length<=220,`${c.id} Chinese prose length ${length}`)
    assert.ok(c.body.en.length>300,`${c.id} has a complete English translation`)
  }
})
