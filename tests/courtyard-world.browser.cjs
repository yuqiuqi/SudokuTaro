const assert=require('node:assert/strict')
const GAME='sudokutaro:glass:v1',STORY='fangcun:courtyard:v1',RECORDS='sudokutaro:records:v1'
const WORLD='fangcun:courtyard:world:v1',LIFE='fangcun:courtyard-life:v1'
const emptyLife=()=>({version:1,creditedSessionIds:[],readNoteIds:[]})
const defaultWorld=()=>({version:1,atmosphere:'dusk',motion:'ambient',favoriteObjectId:null})
const main=(count=0,mode='story')=>({version:1,unlockedThrough:count,readChapterIds:[],creditedSessionIds:Array.from({length:count},(_,i)=>`world-main-${i+1}`),mode})
const note=n=>`courtyard-life-${String(n).padStart(2,'0')}`

module.exports=async function worldRegressions(p,url,fixture) {
  const before=await p.evaluate(()=>Object.fromEntries(Object.entries(localStorage)))
  const setupURL=new URL('__test-fixture.html',url).href
  const saved=key=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key)
  // Rendering and the repository's passive save effect are separate commits.
  // Observe the expected persisted field, then keep the exact value assertions.
  const waitSaved=(key,field,value,page=p)=>page.waitForFunction(({key,field,value})=>{
    try{return JSON.stringify(JSON.parse(localStorage.getItem(key))?.[field])===JSON.stringify(value)}catch{return false}
  },{key,field,value},{timeout:2000})
  const seed=async({game={...fixture,sessionId:'world-ordinary'},progress=main(),life=emptyLife(),world=defaultWorld(),wins=99}={})=>{
    await p.goto(setupURL)
    await p.evaluate(({game,progress,life,world,wins,GAME,STORY,LIFE,WORLD,RECORDS})=>{
      localStorage.setItem(GAME,JSON.stringify(game));localStorage.setItem(STORY,JSON.stringify(progress))
      localStorage.setItem(LIFE,JSON.stringify(life));localStorage.setItem(WORLD,JSON.stringify(world))
      localStorage.setItem(RECORDS,JSON.stringify({wins,best:{medium:200}}));localStorage.setItem('sudokutaro:language','zh')
      localStorage.removeItem('fangcun:courtyard:revealed:v1');localStorage.removeItem('fangcun:courtyard-life:revealed:v1')
    },{game,progress,life,world,wins,GAME,STORY,LIFE,WORLD,RECORDS})
    await p.goto(url);await p.waitForSelector('[data-cell="80"]')
  }
  const open=async()=>{await p.locator('[data-courtyard-entry]').first().click();await p.waitForSelector('[data-courtyard-scene]')}
  const close=async()=>{await p.keyboard.press('Escape');await p.waitForSelector('.dialog-courtyard',{state:'detached'})}
  const almost=fixture.solution.map(row=>[...row]);almost[0][2]=0
  const nearWin=id=>({...fixture,board:almost,initial:almost,won:false,seconds:272,moves:42,history:[],notes:Array.from({length:81},()=>[]),sessionId:id})
  const complete=async()=>{await p.locator('[data-cell="2"]').click();await p.locator('[data-number="4"]').click();await p.waitForSelector('.dialog-won')}
  const core=g=>({board:g.board,initial:g.initial,notes:g.notes,moves:g.moves,hints:g.hints,difficulty:g.difficulty,won:g.won,sessionId:g.sessionId})
  try {
    await p.setViewportSize({width:393,height:720});await p.emulateMedia({reducedMotion:'reduce'});await seed();await open()
    const original={game:core(await saved(GAME)),story:await saved(STORY),records:await saved(RECORDS),life:await saved(LIFE)}
    assert.equal(await p.locator('button[data-courtyard-atmosphere]').count(),3,'three free atmosphere choices exist from the first chapter')
    const pictures=[]
    for(const atmosphere of ['day','dusk','rain']) {
      const button=p.locator(`button[data-courtyard-atmosphere="${atmosphere}"]`)
      await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true')
      assert.equal(await p.locator('.courtyard-art').getAttribute('data-atmosphere'),atmosphere)
      pictures.push(await p.locator('.courtyard-art').screenshot())
      await waitSaved(WORLD,'atmosphere',atmosphere)
      assert.equal((await saved(WORLD)).atmosphere,atmosphere)
    }
    for(let i=0;i<pictures.length;i++)for(let j=i+1;j<pictures.length;j++)
      assert.notDeepEqual(pictures[i],pictures[j],'the atmosphere changes actual rendered artwork, not just an attribute')
    assert.equal(await p.locator('button[data-courtyard-object="mint"]').count(),0,'unrepaired objects do not expose actionable observation controls')
    await p.locator('button[data-courtyard-object="doorLight"]').click()
    assert.ok((await p.locator('[data-courtyard-inspection="doorLight"]').innerText()).length>15,'a repaired object has real DOM observation text')
    await p.locator('button[data-courtyard-favorite]').click()
    await waitSaved(WORLD,'favoriteObjectId','doorLight')
    assert.equal((await saved(WORLD)).favoriteObjectId,'doorLight')
    const motion=p.locator('button[data-courtyard-motion]');await motion.click();assert.equal(await motion.getAttribute('aria-pressed'),'true')
    await waitSaved(WORLD,'motion','still')
    assert.equal((await saved(WORLD)).motion,'still')
    assert.deepEqual(core(await saved(GAME)),original.game)
    assert.deepEqual(await saved(STORY),original.story,'observing and choosing preferences never reads or advances a main chapter')
    assert.deepEqual(await saved(RECORDS),original.records);assert.deepEqual(await saved(LIFE),original.life)
    await close();await p.reload();await p.waitForSelector('[data-cell="80"]');await open()
    assert.equal(await p.locator('.courtyard-art').getAttribute('data-atmosphere'),'rain')
    assert.equal((await saved(WORLD)).favoriteObjectId,'doorLight')
    await p.emulateMedia({reducedMotion:'no-preference'})
    assert.equal(await p.locator('.courtyard-art').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'the saved still preference stops courtyard animation independently of system motion')
    await p.locator('button[data-courtyard-motion]').click()
    const loops=await p.locator('.courtyard-art').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.playState==='running'&&a.effect.getTiming().iterations===Infinity).length)
    assert.ok(loops<=2,'courtyard ambience has at most two simultaneous animation groups')
    await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))})
    await p.waitForTimeout(50)
    assert.equal(await p.locator('.courtyard-art').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'hidden courtyard stops all animation')
    await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))})
    await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(50)
    assert.equal(await p.locator('.courtyard-art').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'system reduced motion also stops ambience')
    await close()
    for(let pass=0;pass<30;pass++) {
      await open();assert.equal(await p.locator('.courtyard-art').count(),1)
      await close();assert.equal(await p.locator('.courtyard-art').count(),0,'repeated visits unmount the entire scene')
    }
    assert.deepEqual(await saved(STORY),original.story);assert.deepEqual(await saved(LIFE),original.life)

    // A real completion on either side of the main/life boundary.
    await seed({game:nearWin('world-last-main'),progress:main(6)});await complete()
    await waitSaved(STORY,'unlockedThrough',7)
    assert.equal((await saved(STORY)).unlockedThrough,7)
    assert.equal((await saved(LIFE)).creditedSessionIds.length,0,'the eighth chapter win does not also grant life note one')
    const completedMain=await saved(STORY)
    await p.emulateMedia({reducedMotion:'no-preference'})
    await seed({game:nearWin('world-life-one'),progress:completedMain});await complete()
    await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.creditedSessionIds.length===1,LIFE)
    const earned=await saved(LIFE);assert.deepEqual(earned.creditedSessionIds,['world-life-one'])
    assert.equal((await saved(RECORDS)).wins,100)
    await p.locator('.dialog-won [data-courtyard-entry]').click();await p.waitForSelector('[data-courtyard-scene]')
    assert.equal(await p.locator('.courtyard-art').getAttribute('data-life-count'),'1')
    assert.equal(await p.locator('[data-life-detail="mintLife"]').getAttribute('data-level'),'1','the first new win adds the first real life detail')
    const reveal=await p.locator('.courtyard-art').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.animationName==='courtyard-restore').map(a=>a.effect.getTiming()))
    assert.equal(reveal.length,1,'only the latest life detail has one real reveal, even when the main receipt is also missing')
    assert.equal(reveal[0].duration,600);assert.equal(reveal[0].iterations,1)
    await close();await open()
    assert.equal(await p.locator('.courtyard-art').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.animationName==='courtyard-restore').length),0,'interrupting a life reveal does not replay it on reopening')
    await p.locator('button[data-courtyard-life-open]').click();await p.locator(`button[data-life-note="${note(1)}"]`).click()
    assert.ok((await p.locator(`article[data-life-note="${note(1)}"]`).innerText()).length>35)
    await waitSaved(LIFE,'readNoteIds',[note(1)])
    assert.deepEqual((await saved(LIFE)).readNoteIds,[note(1)])
    assert.deepEqual(await saved(STORY),completedMain,'reading a life note does not mark an old main chapter read')
    await close()
    for(let round=0;round<2;round++) {
      await p.locator('.completed-controls [data-victory-encore]').click();await p.waitForSelector('.dialog-won')
      assert.deepEqual((await saved(LIFE)).creditedSessionIds,earned.creditedSessionIds)
      assert.equal((await saved(RECORDS)).wins,100)
      await p.locator('.dialog-won').getByRole('button',{name:'欣赏棋盘',exact:true}).click()
    }
    await p.reload();await p.waitForSelector('.completed-controls')
    assert.deepEqual((await saved(LIFE)).creditedSessionIds,earned.creditedSessionIds,'refresh never repeats a life reward')
    await open()
    assert.equal(await p.locator('.courtyard-art').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.animationName==='courtyard-restore').length),0,'refreshing also preserves the consumed life presentation receipt')
    await close();await p.emulateMedia({reducedMotion:'reduce'})
    await seed({game:nearWin('world-quiet-life'),progress:{...completedMain,mode:'sudoku'},life:earned,wins:100});await complete()
    await waitSaved(LIFE,'creditedSessionIds',[...earned.creditedSessionIds,'world-quiet-life'])
    assert.equal((await saved(LIFE)).creditedSessionIds.length,2,'sudoku-only mode still earns life notes')
    assert.equal(await p.locator('.dialog-won [data-courtyard-entry]').count(),0,'sudoku-only mode keeps its quiet result')
    await close();await open();assert.equal(await p.locator('.courtyard-art').getAttribute('data-life-count'),'2');await close()
    await seed({game:{...nearWin('world-legacy-complete'),board:fixture.solution,won:true},progress:main(7)})
    await p.waitForSelector('.completed-controls');assert.equal((await saved(LIFE)).creditedSessionIds.length,0,'old completed saves do not backfill life rewards')

    const fullLife={version:1,creditedSessionIds:Array.from({length:12},(_,i)=>`world-fixture-${i+1}`),readNoteIds:[]}
    await seed({progress:main(7),life:fullLife,world:{...defaultWorld(),motion:'still'}})
    await open();assert.equal(await p.locator('.courtyard-art').getAttribute('data-life-count'),'12')
    const levels=await p.locator('[data-life-detail]').evaluateAll(nodes=>nodes.map(n=>[n.getAttribute('data-life-detail'),n.getAttribute('data-level')]))
    assert.equal(levels.length,6);assert.ok(levels.every(([,level])=>level==='2'),'all six life regions reach their second visible layer')
    await close()
    for(const language of ['zh','en'])for(const [width,height,visible=height]of [[393,720],[320,480],[280,320],[280,480],[568,240],[480,240],[390,720,400]]) {
      await p.setViewportSize({width,height})
      await p.evaluate(h=>{if(h!==innerHeight)Object.defineProperty(visualViewport,'height',{configurable:true,value:h});else delete visualViewport.height;visualViewport.dispatchEvent(new Event('resize'))},visible)
      await open();await p.locator('.courtyard-top').getByRole('button',{name:language==='en'?'English':'中文',exact:true}).click()
      await p.locator('button[data-courtyard-life-open]').click();await p.locator(`button[data-life-note="${note(1)}"]`).click()
      for(let i=1;i<=12;i++) {
        const article=p.locator('article[data-life-note]')
        assert.equal(await article.getAttribute('data-life-note'),note(i))
        assert.ok((await article.innerText()).trim().length>(language==='en'?60:35))
        const fit=await p.locator('.dialog-courtyard').evaluate(card=>{
          const w=innerWidth,h=Math.min(innerHeight,visualViewport.height),r=card.getBoundingClientRect()
          const targets=[...card.querySelectorAll('.courtyard-top button,[data-life-previous],[data-life-next],[data-life-back]')]
          return {card:r.left>=-1&&r.right<=w+1&&r.top>=-1&&r.bottom<=h+1,targets:targets.every(n=>{const b=n.getBoundingClientRect();return b.top>=-1&&b.bottom<=h+1&&b.left>=-1&&b.right<=w+1}),page:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1&&document.documentElement.scrollHeight<=document.documentElement.clientHeight+1,documentScrollHeight:document.documentElement.scrollHeight,documentClientHeight:document.documentElement.clientHeight,layoutHeight:innerHeight,visibleHeight:h,app:document.querySelector('.sudoku-app').getBoundingClientRect().toJSON()}
        })
        assert.ok(fit.card&&fit.targets&&fit.page,`life reader fits ${width}x${height}/${visible}/${language}/${i}: ${JSON.stringify(fit)}`)
        if(i<12)await p.locator('[data-life-next]').click()
      }
      assert.ok(await p.locator('[data-life-next]').isDisabled(),'the twelfth note explicitly ends this finite collection')
      const reader=p.locator('[data-life-reader]');await reader.focus()
      const size=await reader.evaluate(n=>({scroll:n.scrollHeight,client:n.clientHeight}))
      if(size.scroll>size.client+2){await p.keyboard.press('Home');await p.keyboard.press('PageDown');await p.waitForTimeout(100);assert.ok(await reader.evaluate(n=>n.scrollTop>0),'life prose really scrolls in a short reader')}
      await p.keyboard.press('Tab');assert.ok(await p.evaluate(()=>!!document.activeElement.closest('.dialog-courtyard')),'life navigation retains keyboard focus')
      await close()
    }
    await waitSaved(LIFE,'readNoteIds',Array.from({length:12},(_,i)=>note(i+1)))
    assert.equal((await saved(LIFE)).readNoteIds.length,12)
    assert.deepEqual((await saved(STORY)).readChapterIds,[])
    await p.evaluate(()=>{delete visualViewport.height;visualViewport.dispatchEvent(new Event('resize'))})

    // One failed save must stay reported after a different domain saves successfully.
    const context=await p.context().browser().newContext({viewport:{width:393,height:720},reducedMotion:'reduce'})
    try {
      await context.addInitScript(({game,progress,GAME,STORY,LIFE,WORLD,RECORDS})=>{
        localStorage.setItem(GAME,JSON.stringify(game));localStorage.setItem(STORY,JSON.stringify(progress))
        localStorage.setItem(LIFE,JSON.stringify({version:1,creditedSessionIds:[],readNoteIds:[]}))
        localStorage.setItem(WORLD,JSON.stringify({version:1,atmosphere:'dusk',motion:'ambient',favoriteObjectId:null}))
        localStorage.setItem(RECORDS,JSON.stringify({wins:99,best:{}}));localStorage.setItem('sudokutaro:language','zh')
        const original=Storage.prototype.setItem
        Storage.prototype.setItem=function(key,value){if(key===LIFE)throw new Error('Life storage unavailable');return original.call(this,key,value)}
      },{game:nearWin('world-unsaved-life'),progress:main(7),GAME,STORY,LIFE,WORLD,RECORDS})
      const blocked=await context.newPage(),runtime=[];blocked.on('pageerror',e=>runtime.push(e.message))
      await blocked.goto(url);await blocked.waitForSelector('[data-cell="80"]')
      await blocked.locator('[data-cell="2"]').click();await blocked.locator('[data-number="4"]').click();await blocked.waitForSelector('.dialog-won')
      await blocked.locator('.dialog-won [data-courtyard-entry]').click();await blocked.waitForSelector('[data-courtyard-scene]')
      assert.equal(await blocked.locator('.courtyard-art').getAttribute('data-life-count'),'1','failed persistence still keeps the earned note in memory')
      await blocked.locator('[data-courtyard-atmosphere="day"]').click()
      await waitSaved(WORLD,'atmosphere','day',blocked)
      assert.equal(await blocked.evaluate(key=>JSON.parse(localStorage.getItem(key)).atmosphere,WORLD),'day')
      assert.equal(await blocked.evaluate(key=>JSON.parse(localStorage.getItem(key)).creditedSessionIds.length,LIFE),0)
      assert.match(await blocked.locator('.feedback').innerText(),/保存|saved/,'a successful world save does not mask a failed life save')
      assert.deepEqual(runtime,[])
    } finally {await context.close()}
  } finally {
    await p.goto(setupURL)
    await p.evaluate(values=>{localStorage.clear();for(const [key,value]of Object.entries(values))localStorage.setItem(key,value)},before)
    await p.setViewportSize({width:390,height:720});await p.emulateMedia({reducedMotion:'no-preference'})
    await p.goto(url);await p.waitForSelector('[data-cell="80"]')
  }
}
