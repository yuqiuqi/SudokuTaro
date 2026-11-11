const assert = require('node:assert/strict')
const STORY = 'fangcun:courtyard:v1', GAME = 'sudokutaro:glass:v1', RECORDS = 'sudokutaro:records:v1'
const initialStory = () => ({version:1,unlockedThrough:0,readChapterIds:[],creditedSessionIds:[],mode:'story'})

module.exports = async function courtyardRegressions(p,url,fixture) {
  const before = await p.evaluate(() => Object.fromEntries(Object.entries(localStorage)))
  const seed = async (game,progress=initialStory(),wins=99) => {
    await p.evaluate(({game,progress,wins,GAME,STORY,RECORDS})=>{
      localStorage.setItem(GAME,JSON.stringify(game));localStorage.setItem(STORY,JSON.stringify(progress))
      localStorage.setItem(RECORDS,JSON.stringify({wins,best:{easy:100,medium:200}}));localStorage.setItem('sudokutaro:language','zh')
      localStorage.removeItem('fangcun:courtyard:revealed:v1')
    },{game,progress,wins,GAME,STORY,RECORDS})
    await p.reload();await p.waitForSelector('[data-cell="80"]')
  }
  const saved = key => p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key)
  const close = async () => {await p.keyboard.press('Escape');await p.waitForSelector('.dialog-courtyard',{state:'detached'})}
  try {
    await p.setViewportSize({width:393,height:720})
    await seed({...fixture,sessionId:'courtyard-ordinary-game'})
    const originalGame=await saved(GAME)
    await p.locator('[data-cell="2"]').click()
    await p.locator('[data-number="5"]').click()
    const conflictColors=await p.locator('.sudoku-app').evaluate(root=>{
      const sample=document.createElement('span');sample.style.color='var(--danger)';root.append(sample)
      const expected=getComputedStyle(sample).color;sample.remove()
      return {expected,digits:[...root.querySelectorAll('.is-conflict .cell-digit')].map(n=>getComputedStyle(n).color)}
    })
    assert.ok(conflictColors.digits.length>0&&conflictColors.digits.every(c=>c===conflictColors.expected),`conflict digits keep the danger color for both given and player values: ${JSON.stringify(conflictColors)}`)
    await p.locator('[data-cell="2"]').click()
    const inkEvent=p.evaluate(()=>new Promise(resolve=>{
      const done=value=>{clearTimeout(timer);document.removeEventListener('animationstart',start);resolve(value)}
      const start=event=>{if(event.animationName==='porcelain-ink')done({name:event.animationName,duration:parseFloat(getComputedStyle(event.target).animationDuration)*1000})}
      const timer=setTimeout(()=>done(null),1000);document.addEventListener('animationstart',start)
    }))
    await p.locator('[data-number="4"]').click()
    const ink=await inkEvent
    assert.ok(ink&&ink.duration>=100&&ink.duration<=160,'accepted input has a real brief ink animation')
    await p.getByRole('button',{name:'撤销',exact:true}).click()
    await p.emulateMedia({reducedMotion:'reduce'})
    await p.locator('[data-number="4"]').click()
    assert.equal(await p.locator('[data-cell="2"] .cell-digit').evaluate(n=>n.getAnimations().length),0,'reduced motion keeps accepted input static')
    await p.getByRole('button',{name:'撤销',exact:true}).click()
    await p.emulateMedia({reducedMotion:'no-preference'})
    await p.locator('[data-cell="3"]').click()
    await p.locator('[data-courtyard-entry]').first().click()
    await p.waitForSelector('.dialog-courtyard [data-story-reader]')
    const reveal=await p.locator('[data-courtyard-scene]').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.animationName==='courtyard-restore').map(a=>a.effect.getTiming()))
    assert.equal(reveal.length,1,'the new object really plays its one-shot reveal')
    assert.ok(reveal[0].duration>=450&&reveal[0].duration<=800&&reveal[0].iterations===1,'the restoration is brief and finite')
    await p.locator('button[data-story-chapter="courtyard-01"]').click()
    assert.equal(await p.locator('article[data-story-chapter]').getAttribute('data-story-chapter'),'courtyard-01')
    assert.ok((await p.locator('[data-story-reader]').innerText()).includes('林照'))
    assert.ok(await p.locator('[data-story-next]').isDisabled(),'only the first chapter starts free, even with 99 old wins')
    assert.equal((await saved(STORY)).unlockedThrough,0)
    await p.locator('.dialog-courtyard').getByRole('button',{name:'English',exact:true}).click()
    assert.match(await p.locator('[data-story-reader]').innerText(),/sister|Lin Zhao/i)
    assert.equal(await p.locator('article[data-story-chapter]').getAttribute('data-story-chapter'),'courtyard-01','language switching keeps the chapter')
    await close()
    await p.locator('[data-courtyard-entry]').first().click();await p.waitForSelector('[data-courtyard-scene]')
    assert.match(await p.locator('.courtyard-art title').textContent(),/courtyard/i,'reopening the scene preserves the selected English accessible title')
    assert.equal(await p.locator('[data-courtyard-scene]').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.animationName==='courtyard-restore').length),0,'closing and reopening does not repeat the restoration')
    await close()
    assert.deepEqual((await saved(GAME)).board,originalGame.board,'reading does not change the live puzzle')
    assert.equal((await saved(RECORDS)).wins,99)

    const full={...initialStory(),unlockedThrough:7,creditedSessionIds:Array.from({length:7},(_,i)=>`earlier-session-${i}`)}
    await seed({...fixture,sessionId:'courtyard-browsing-game'},full)
    for(const language of ['zh','en']) {
      for(const [width,height] of [[393,720],[320,480],[280,320],[568,240],[480,240],[390,400]]) {
        await p.setViewportSize({width,height})
        await p.locator('[data-courtyard-entry]').first().click();await p.waitForSelector('[data-story-reader]')
        await p.locator('.dialog-courtyard').getByRole('button',{name:language==='en'?'English':'中文',exact:true}).click()
        const scene=p.locator('.courtyard-art')
        const alternative=await scene.locator('title,desc').allTextContents()
        assert.equal(alternative.length,2,'the courtyard has a title and full scene description')
        assert.ok(alternative.every(text=>text.trim().length>3),'both scene alternatives contain real text')
        if(language==='en') {
          assert.match(alternative.join(' '),/courtyard/i,'English mode translates the courtyard alternative')
          assert.doesNotMatch(alternative.join(' '),/\p{Script=Han}/u,'English scene alternatives do not retain Chinese text')
        } else assert.match(alternative.join(' '),/旧院|小院/,'Chinese mode preserves its scene alternative')
        assert.equal(await p.getByRole('img',{name:alternative.join(' ').replace(/\s+/g,' ').trim(),exact:true}).count(),1,'the localized title and description form the actual accessible image name')
        await p.locator('button[data-story-chapter="courtyard-01"]').click()
        // Reach both ends with actual controls, irrespective of the component's preferred opening chapter.
        while(await p.locator('[data-story-previous]').isEnabled()) await p.locator('[data-story-previous]').click()
        for(let index=0;index<8;index++) {
          assert.equal(await p.locator('article[data-story-chapter]').getAttribute('data-story-chapter'),`courtyard-${String(index+1).padStart(2,'0')}`)
          assert.ok((await p.locator('[data-story-reader]').innerText()).trim().length>80,'each chapter has real prose')
          const fit=await p.locator('.dialog-courtyard').evaluate(card=>{
            const h=visualViewport?.height||innerHeight,w=innerWidth,r=card.getBoundingClientRect()
            const targets=[...card.querySelectorAll('.courtyard-top button,[data-story-next],[data-story-previous],[data-story-mode]')]
            return {card:r.left>=-1&&r.top>=-1&&r.right<=w+1&&r.bottom<=h+1,
              targets:targets.every(n=>{const b=n.getBoundingClientRect();return b.top>=-1&&b.bottom<=h+1&&b.left>=-1&&b.right<=w+1}),
              page:document.documentElement.scrollWidth<=w+1&&document.documentElement.scrollHeight<=h+1}
          })
          assert.ok(fit.card&&fit.targets&&fit.page,`story content/controls fit ${width}x${height}/${language}/chapter${index+1}: ${JSON.stringify(fit)}`)
          if(index<7) await p.locator('[data-story-next]').click()
        }
        assert.ok(await p.locator('[data-story-next]').isDisabled(),'the finite first volume ends explicitly')
        if(height<=400) {
          const reader=p.locator('[data-story-reader]');await reader.focus()
          const size=await reader.evaluate(n=>({scroll:n.scrollHeight,client:n.clientHeight}))
          if(size.scroll>size.client+2) {
            await p.keyboard.press('Home');await p.keyboard.press('PageDown');await p.waitForTimeout(150)
            assert.ok(await reader.evaluate(n=>n.scrollTop>0),'short-screen prose can really scroll with a keyboard')
          }
        }
        const focusable=await p.locator('.dialog-courtyard').evaluate(n=>[...n.querySelectorAll('button:not(:disabled),[tabindex="0"]')].filter(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0).length)
        for(let i=0;i<focusable+2;i++) {
          const was=await p.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent.slice(0,50),disabled:document.activeElement.disabled}))
          await p.keyboard.press('Tab')
          const now=await p.evaluate(()=>({inside:!!document.activeElement.closest('.dialog-courtyard'),tag:document.activeElement.tagName,text:document.activeElement.textContent.slice(0,50)}))
          assert.ok(now.inside,`keyboard focus stays inside reading screen ${width}x${height}/${language}/tab${i}: ${JSON.stringify({was,now})}`)
        }
        await close()
      }
    }

    await p.setViewportSize({width:393,height:720})
    const almost=fixture.solution.map(row=>[...row]);almost[0][2]=0
    const winGame={...fixture,board:almost,initial:almost,won:false,seconds:272,moves:42,history:[],notes:Array.from({length:81},()=>[]),sessionId:'courtyard-new-win'}
    await seed(winGame)
    await p.locator('[data-cell="2"]').click();await p.locator('[data-number="4"]').click()
    await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.unlockedThrough===1,STORY)
    await p.waitForSelector('.dialog-won',{timeout:8000})
    assert.equal((await saved(RECORDS)).wins,100)
    const earned=await saved(STORY);assert.deepEqual(earned.creditedSessionIds,['courtyard-new-win'])
    assert.ok(await p.locator('.dialog-won [data-courtyard-entry]').count(),'the result offers a voluntary story entry')
    await p.locator('.dialog-won [data-courtyard-entry]').click();await p.waitForSelector('[data-story-reader]');await p.locator('button[data-story-chapter="courtyard-02"]').click();assert.match(await p.locator('[data-story-reader]').innerText(),/薄荷/);await close()
    const snapshot=await saved(GAME)
    for(let round=0;round<2;round++) {
      await p.locator('.completed-controls [data-victory-encore]').click();await p.waitForSelector('.dialog-won',{timeout:8000})
      assert.equal((await saved(STORY)).unlockedThrough,1)
      assert.deepEqual((await saved(STORY)).creditedSessionIds,['courtyard-new-win'])
      assert.equal((await saved(RECORDS)).wins,100)
      assert.deepEqual(await saved(GAME),snapshot,'encore never changes persisted game data')
      await p.locator('.dialog-won').getByRole('button',{name:'欣赏棋盘',exact:true}).click()
    }
    await p.reload();await p.waitForSelector('.completed-controls')
    assert.equal((await saved(STORY)).unlockedThrough,1,'refreshing the completed board does not award again')
    assert.equal((await saved(RECORDS)).wins,100)

    await p.locator('[data-courtyard-entry]').first().click();await p.waitForSelector('[data-story-mode]')
    if((await saved(STORY)).mode==='story') await p.locator('[data-story-mode]').click()
    assert.equal((await saved(STORY)).mode,'sudoku')
    if(await p.locator('.dialog-courtyard').count()) await close()
    const quiet=await saved(STORY)
    await seed({...winGame,sessionId:'courtyard-quiet-win'},quiet,100)
    await p.locator('[data-cell="2"]').click();await p.locator('[data-number="4"]').click()
    await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.unlockedThrough===2,STORY)
    await p.waitForSelector('.dialog-won',{timeout:8000})
    assert.equal((await saved(STORY)).mode,'sudoku','sudoku-only mode still earns chapters')
    assert.equal(await p.locator('.dialog-won [data-courtyard-entry]').count(),0,'sudoku-only mode suppresses the story offer')
    await p.keyboard.press('Escape')

    await p.locator('[data-courtyard-entry]').first().click();await p.waitForSelector('[data-courtyard-scene]')
    await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100)
    assert.equal(await p.locator('[data-courtyard-scene]').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'reduced motion stops courtyard animation')
    await close();await p.emulateMedia({reducedMotion:'no-preference'})
    await p.goto(`${url}?legacy=1#/pages/index/index`);await p.waitForSelector('[data-cell="80"]')
    assert.ok(await p.locator('[data-courtyard-entry]').count(),'old hash and query bookmarks still work')
    const blocked=await p.context().browser().newContext({viewport:{width:393,height:720}})
    try {
      await blocked.addInitScript(()=>{
        Storage.prototype.getItem=function(){throw new Error('Storage unavailable')}
        Storage.prototype.setItem=function(){throw new Error('Storage quota unavailable')}
      })
      const page=await blocked.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message))
      await page.goto(url);await page.waitForSelector('[data-cell="80"]')
      assert.equal(await page.locator('.sudoku-cell').count(),81)
      await page.locator('[data-courtyard-entry]').first().click()
      await page.locator('button[data-story-chapter="courtyard-01"]').click()
      assert.ok((await page.locator('[data-story-reader]').innerText()).includes('林照'),'free reading remains usable when storage fails')
      assert.deepEqual(errors,[])
    } finally {await blocked.close()}
  } finally {
    await p.emulateMedia({reducedMotion:'no-preference'})
    await p.evaluate(values=>{localStorage.clear();for(const [k,v] of Object.entries(values))localStorage.setItem(k,v)},before)
    await p.goto(url);await p.waitForSelector('[data-cell="80"]')
  }
}
