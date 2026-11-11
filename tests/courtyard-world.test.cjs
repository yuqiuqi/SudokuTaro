const assert = require('node:assert/strict')
const {test,after} = require('node:test')
const {execFileSync} = require('node:child_process')
const fs=require('node:fs'),os=require('node:os'),path=require('node:path')
const compiled=fs.mkdtempSync(path.join(os.tmpdir(),'fangcun-world-'))
after(()=>fs.rmSync(compiled,{recursive:true,force:true}))
try {
  execFileSync(process.execPath,[path.join(path.dirname(require.resolve('typescript/package.json')),'bin/tsc'),
    '--ignoreConfig','--module','node16','--moduleResolution','node16','--target','ES2020','--skipLibCheck','--outDir',compiled,
    path.resolve(__dirname,'../src/features/courtyard/world.ts'),
    path.resolve(__dirname,'../src/features/courtyard/life.ts'),
    path.resolve(__dirname,'../src/features/courtyard/lifeNotes.ts'),
    path.resolve(__dirname,'../src/platform/storage.ts')],{stdio:'pipe'})
} catch(error) {
  fs.rmSync(compiled,{recursive:true,force:true})
  throw new Error(`World compilation failed:\n${error.stdout||''}\n${error.stderr||''}`,{cause:error})
}
const world=require(path.join(compiled,'features/courtyard/world.js'))
const life=require(path.join(compiled,'features/courtyard/life.js'))
const story=require(path.join(compiled,'features/courtyard/story.js'))
const {lifeNotes}=require(path.join(compiled,'features/courtyard/lifeNotes.js'))
const storage=require(path.join(compiled,'platform/storage.js'))
const WORLD='fangcun:courtyard:world:v1',LIFE='fangcun:courtyard-life:v1'
const note=n=>`courtyard-life-${String(n).padStart(2,'0')}`
function memory(values={}) {
  const map=new Map(Object.entries(values))
  return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),map}
}
function state() {return {progress:story.createCourtyardProgress(),life:life.createCourtyardLife()}}
function fullMain() {
  let s=state()
  for(let n=1;n<=7;n++)s=life.applyCourtyardCompletion(s,`main-${n}`)
  return s
}

test('a free courtyard starts with saved-choice defaults and no historical life credit',()=>{
  assert.deepEqual(world.createCourtyardWorld(),{version:1,atmosphere:'dusk',motion:'ambient',favoriteObjectId:null})
  assert.deepEqual(life.createCourtyardLife(),{version:1,creditedSessionIds:[],readNoteIds:[]})
  const m=memory({'sudokutaro:records:v1':JSON.stringify({wins:900,best:{}})})
  assert.deepEqual(storage.loadCourtyardLife(m),life.createCourtyardLife())
  assert.deepEqual(storage.loadCourtyardWorld(m),world.createCourtyardWorld())
})
test('world preferences reject unknown values and same choices are idempotent',()=>{
  const w=world.createCourtyardWorld()
  assert.ok(world.isCourtyardWorld(w))
  for(const value of [null,{}, {...w,version:2},{...w,atmosphere:'storm'},{...w,motion:'fast'},{...w,favoriteObjectId:'unknown'}])
    assert.equal(world.isCourtyardWorld(value),false)
  assert.equal(world.selectAtmosphere(w,'dusk'),w)
  assert.equal(world.selectAtmosphere(w,'storm'),w)
  const day=world.selectAtmosphere(w,'day')
  assert.equal(day.atmosphere,'day');assert.equal(w.atmosphere,'dusk')
  const still=world.setWorldMotion(day,'still')
  assert.equal(still.motion,'still');assert.equal(world.setWorldMotion(still,'still'),still)
})
test('favorite selection only accepts a repaired object and can be freely cleared',()=>{
  const w=world.createCourtyardWorld()
  assert.equal(world.setFavoriteObject(w,'mint',0),w)
  assert.equal(world.setFavoriteObject(w,'unknown',7),w)
  const door=world.setFavoriteObject(w,'doorLight',0)
  assert.equal(door.favoriteObjectId,'doorLight')
  assert.equal(world.setFavoriteObject(door,'doorLight',0),door)
  const mint=world.setFavoriteObject(door,'mint',1)
  assert.equal(mint.favoriteObjectId,'mint')
  assert.equal(world.setFavoriteObject(mint,null,1).favoriteObjectId,null)
})
test('the last main chapter completion never also grants a life note',()=>{
  let s=state()
  for(let n=1;n<=6;n++)s=life.applyCourtyardCompletion(s,`main-${n}`)
  assert.equal(s.progress.unlockedThrough,6)
  const last=life.applyCourtyardCompletion(s,'main-7')
  assert.equal(last.progress.unlockedThrough,7)
  assert.equal(last.life.creditedSessionIds.length,0)
  const next=life.applyCourtyardCompletion(last,'first-life')
  assert.deepEqual(next.progress,last.progress)
  assert.deepEqual(next.life.creditedSessionIds,['first-life'])
})
test('a previously credited main session cannot leak into the life ledger later',()=>{
  const s=fullMain()
  for(let n=1;n<=7;n++)assert.deepEqual(life.applyCourtyardCompletion(s,`main-${n}`),s)
  const first=life.applyCourtyardCompletion(s,'life-1')
  assert.deepEqual(life.applyCourtyardCompletion(first,'life-1'),first)
  assert.deepEqual(life.applyCourtyardCompletion(first,'main-7'),first)
  assert.deepEqual(life.applyCourtyardCompletion(first,''),first)
})
test('life is finite at twelve notes and repeated future completions never grow its ledger',()=>{
  let s=fullMain()
  for(let n=1;n<=12;n++) {
    s=life.applyCourtyardCompletion(s,`life-${n}`)
    assert.equal(s.life.creditedSessionIds.length,n)
    assert.ok(life.isCourtyardLife(s.life))
  }
  const complete=structuredClone(s)
  for(let n=13;n<=200;n++)s=life.applyCourtyardCompletion(s,`life-${n}`)
  assert.deepEqual(s,complete)
  assert.equal(s.progress.creditedSessionIds.length+s.life.creditedSessionIds.length,19)
})
test('reading only marks an earned note and cannot award a completion',()=>{
  const zero=life.createCourtyardLife()
  assert.deepEqual(life.markLifeNoteRead(zero,note(1)),zero)
  const one=life.applyCourtyardCompletion(fullMain(),'life-1').life
  const read=life.markLifeNoteRead(one,note(1))
  assert.deepEqual(read.readNoteIds,[note(1)])
  assert.deepEqual(read.creditedSessionIds,one.creditedSessionIds)
  assert.deepEqual(life.markLifeNoteRead(read,note(1)),read)
  assert.deepEqual(life.markLifeNoteRead(read,note(2)),read)
  assert.deepEqual(life.markLifeNoteRead(read,'unknown'),read)
})
test('life validation refuses duplicate sessions, duplicate reads, locked notes and invalid data',()=>{
  const zero=life.createCourtyardLife(),one={...zero,creditedSessionIds:['one']}
  assert.ok(life.isCourtyardLife(one))
  for(const value of [null,{}, {...zero,version:2},{...zero,creditedSessionIds:['']},
    {...zero,creditedSessionIds:['one','one']},{...zero,readNoteIds:[note(1)]},
    {...one,readNoteIds:[note(2)]},{...one,readNoteIds:[note(1),note(1)]},
    {...one,readNoteIds:['unknown']},{...zero,creditedSessionIds:Array.from({length:13},(_,i)=>`id-${i}`)}])
    assert.equal(life.isCourtyardLife(value),false,JSON.stringify(value))
})
test('invalid completion state is rejected without mutation or throwing',()=>{
  const bad={...fullMain(),life:{version:1,creditedSessionIds:['duplicate','duplicate'],readNoteIds:[]}}
  const before=structuredClone(bad)
  assert.deepEqual(life.applyCourtyardCompletion(bad,'new'),before)
  assert.deepEqual(bad,before)
})
test('world and life storage round-trip without changing legacy puzzle, story or records',()=>{
  const legacy={'sudokutaro:glass:v1':'legacy-puzzle','sudokutaro:records:v1':'legacy-records',
    'sudokutaro:language':'en','sudokutaro:vibration':'true','fangcun:courtyard:v1':JSON.stringify(fullMain().progress)}
  const m=memory(legacy)
  const w=world.setFavoriteObject(world.selectAtmosphere(world.createCourtyardWorld(),'rain'),'doorLight',0)
  const l=life.markLifeNoteRead(life.applyCourtyardCompletion(fullMain(),'fresh').life,note(1))
  assert.equal(storage.persistCourtyardWorld(w,m),true)
  assert.equal(storage.persistCourtyardLife(l,m),true)
  assert.deepEqual(storage.loadCourtyardWorld(m),w);assert.deepEqual(storage.loadCourtyardLife(m),l)
  for(const [key,value]of Object.entries(legacy))assert.equal(m.getItem(key),value)
})
test('a damaged new save resets only its own domain and unavailable storage remains safe',()=>{
  const full=fullMain().progress,m=memory({[WORLD]:'{broken',[LIFE]:JSON.stringify({version:99}),'fangcun:courtyard:v1':JSON.stringify(full)})
  assert.deepEqual(storage.loadCourtyardWorld(m),world.createCourtyardWorld())
  assert.deepEqual(storage.loadCourtyardLife(m),life.createCourtyardLife())
  assert.deepEqual(storage.loadCourtyardProgress(m),full)
  const blocked={getItem(){throw new Error('blocked')},setItem(){throw new Error('blocked')}}
  assert.deepEqual(storage.loadCourtyardWorld(blocked),world.createCourtyardWorld())
  assert.deepEqual(storage.loadCourtyardLife(blocked),life.createCourtyardLife())
  assert.equal(storage.persistCourtyardWorld(world.createCourtyardWorld(),blocked),false)
  assert.equal(storage.persistCourtyardLife(life.createCourtyardLife(),blocked),false)
})
test('twelve complete bilingual life notes cover six themes with stable identifiers',()=>{
  assert.equal(lifeNotes.length,12)
  assert.deepEqual(lifeNotes.map(n=>n.id),Array.from({length:12},(_,i)=>note(i+1)))
  assert.equal(new Set(lifeNotes.map(n=>n.scene)).size,6)
  for(const n of lifeNotes) {
    assert.ok(n.title.zh&&n.title.en)
    assert.ok(n.body.zh.length>=35&&n.body.zh.length<=120,n.id)
    assert.ok(n.body.en.length>60,n.id)
  }
})
