const assert = require('node:assert/strict')
const fs = require('node:fs'),
  http = require('node:http'),
  path = require('node:path')
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || '@playwright/test')
const ROOT = path.resolve(__dirname, '../dist'),
  KEY = 'sudokutaro:glass:v1'
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
const solution = [
  '534678912',
  '672195348',
  '198342567',
  '859761423',
  '426853791',
  '713924856',
  '961537284',
  '287419635',
  '345286179',
].map((s) => [...s].map(Number))
const game = {
  board: puzzle,
  initial: puzzle,
  solution,
  difficulty: 'medium',
  seconds: 272,
  moves: 0,
  hints: 0,
  usedNotes: false,
  won: false,
  notes: Array.from({length: 81}, (_, i) => (i === 2 ? [1, 2, 4] : [])),
  history: [],
  celebrated: [],
}
const type = (file) =>
  file.endsWith('.js')
    ? 'application/javascript'
    : file.endsWith('.css')
      ? 'text/css'
      : file.endsWith('.woff2')
        ? 'font/woff2'
        : 'text/html'
const server = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0])
  let base = ROOT
  if (url.startsWith('/test-fonts/') && process.env.TEST_FONT_DIR) {
    base = process.env.TEST_FONT_DIR
    url = url.slice('/test-fonts'.length)
  }
  if (url.startsWith('/SudokuTaro/')) url = url.slice('/SudokuTaro'.length)
  const file = path.resolve(base, '.' + (url === '/' ? '/index.html' : url))
  if (!file.startsWith(base + path.sep)) {
    res.writeHead(403)
    res.end()
    return
  }
  fs.readFile(file, (err, data) => {
    res.writeHead(err ? 404 : 200, {'Content-Type': type(file)})
    res.end(err ? 'not found' : data)
  })
})
const errors = []
async function loadTestFonts(p, url) {
  if (process.env.TEST_FONT_DIR) {
    await p.addStyleTag({
      url: url.replace(/\/SudokuTaro\/$/, '/') + 'test-fonts/400.css',
    })
    await p.addStyleTag({
      content: '.sudoku-app {font-family:"Noto Sans SC",Arial,sans-serif}',
    })
    await p.evaluate(() => document.fonts.ready)
  }
}
async function geometry(p, label) {
  const result = await p.evaluate(() => {
    const w = innerWidth,
      h = innerHeight
    const nodes = [
      ...document.querySelectorAll(
        '.sudoku-cell,.number-key,.tools button,.topbar button',
      ),
    ]
    const bad = nodes.flatMap((n) => {
      let r = n.getBoundingClientRect()
      return r.width <= 0 ||
        r.height <= 0 ||
        r.left < -0.5 ||
        r.top < -0.5 ||
        r.right > w + 0.5 ||
        r.bottom > h + 0.5
        ? [
            {
              label: n.getAttribute('aria-label') || n.textContent,
              rect: r.toJSON(),
            },
          ]
        : []
    })
    return {
      bad,
      mode: document.querySelector('main').className,
      board: document.querySelector('.sudoku-board').getBoundingClientRect()
        .width,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      w,
      h,
      inputs: document.querySelectorAll('input,textarea,[contenteditable=true]')
        .length,
    }
  })
  assert.deepEqual(
    result.bad,
    [],
    label + ' clipped controls: ' + JSON.stringify(result.bad),
  )
  assert.equal(result.inputs, 0)
  assert.ok(
    result.scrollWidth <= result.w && result.scrollHeight <= result.h,
    label + ' document overflows',
  )
  await p.mouse.wheel(300, 600)
  assert.deepEqual(
    await p.evaluate(() => [scrollX, scrollY]),
    [0, 0],
    label + ' scrolled',
  )
  return result
}
async function dialogFits(p, label) {
  const out = await p.locator('.dialog').evaluate((n) => {
    const r = n.getBoundingClientRect()
    return {
      left: r.left,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
      w: innerWidth,
      h: Math.min(innerHeight, visualViewport?.height || innerHeight),
      buttons: [...n.querySelectorAll('button')].map((b) => ({
        text: b.textContent,
        rect: b.getBoundingClientRect().toJSON(),
      })),
      scroll: n.scrollHeight,
      client: n.clientHeight,
    }
  })
  assert.ok(
    out.buttons.every(
      ({rect: r}) =>
        r.width > 0 &&
        r.height > 0 &&
        r.top >= 0 &&
        r.left >= 0 &&
        r.bottom <= out.h + 0.5 &&
        r.right <= out.w + 0.5,
    ) &&
      out.top >= 0 &&
      out.left >= 0 &&
      out.bottom <= out.h + 0.5 &&
      out.right <= out.w + 0.5 &&
      out.scroll <= out.client + 1,
    label + ' dialog overflow ' + JSON.stringify(out),
  )
}
// These checks fail if cells merely change color, propagate by box, or results
// use a wall-clock timeout while the last diagonal is still moving.
async function rainbowWaveRegressions(p, capture = false, holdLast = true) {
  const timing = await p.evaluate(() => {
    const cells = [...document.querySelectorAll('.sudoku-cell')]
    window.waveEffects = document.querySelector('.sudoku-board').getAnimations({subtree: true})
    window.waveEffects.forEach((a) => a.pause())
    window.waveAnimations = cells.map((cell) =>
      cell.getAnimations().find((a) => a.effect.target === cell && !a.effect.pseudoElement),
    )
    return window.waveAnimations.map((a) => {
      a.pause()
      const {delay, duration} = a.effect.getTiming()
      return {delay, duration}
    })
  })
  assert.equal(timing.length, 81)
  assert.ok(timing[1].delay > timing[0].delay, 'wave advances to the next diagonal')
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      assert.ok(Math.abs(timing[r * 9 + c].delay - timing[1].delay * (r + c)) < 0.01, 'row + column share one diagonal')
  const duration = timing[0].duration,
    total = timing[80].delay + duration
  assert.ok(total >= 2300 && total <= 2500, 'the whole wave lasts about 2.4 seconds')
  const frame = async (at, name) => {
    const out = await p.evaluate((at) => {
      window.waveEffects.forEach((a) => {a.currentTime = at})
      const cells = [...document.querySelectorAll('.sudoku-cell')]
      return cells.map((cell) => {
        const style = getComputedStyle(cell),
          m = new DOMMatrixReadOnly(style.transform),
          light = getComputedStyle(cell, '::after'),
          r = cell.getBoundingClientRect(),
          digit = cell.querySelector('.cell-digit')
        return {
          z: m.m43, tilt: Math.abs(m.m13) + Math.abs(m.m23),
          shadow: style.boxShadow,
          rainbow: light.backgroundImage, opacity: Number(light.opacity),
          hue: Number(style.getPropertyValue('--wave-hue')),
          readable: getComputedStyle(digit).opacity === '1' && digit.textContent.length === 1,
          fits: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= Math.min(innerHeight, visualViewport.height) + 0.5,
        }
      })
    }, at)
    assert.ok(out.every((cell) => cell.fits && cell.readable), `${name}: all lifted cells and digits fit the usable viewport`)
    assert.equal(await p.locator('.dialog-won').count(), 0, `${name}: results do not cover the wave`)
    if (capture && process.env.SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SCREENSHOT_DIR, {recursive: true})
      await p.screenshot({path: path.join(process.env.SCREENSHOT_DIR, `rainbow-${capture === true ? '' : capture + '-'}${name}.png`)})
    }
    return out
  }
  const peak = duration * 0.28,
    early = await frame(peak, 'early')
  assert.ok(early[0].z > 2 && early[0].tilt > 0.02, 'first cell actually lifts in Z and tilts')
  assert.equal(early[80].z, 0, 'last diagonal stays at rest before the wave reaches it')
  assert.ok(early[0].shadow !== 'none', 'lift casts a depth shadow')
  assert.ok(early[0].rainbow.includes('gradient') && early[0].opacity > 0.2, 'rainbow highlights are visible on the lifted cell')
  const center = await frame(timing[40].delay + peak, 'center')
  assert.ok(center[40].z > 2 && center[40].tilt > 0.02, 'center diagonal lifts after the first diagonal')
  const crest = center.filter((cell) => cell.z > 2)
  assert.ok(crest.some((cell) => cell.hue < 70 || cell.hue > 330) && crest.some((cell) => cell.hue > 180 && cell.hue < 300), 'the crest shows warm and cool rainbow colors together')
  assert.ok(Math.abs(center[0].z) < 0.1, 'first diagonal has settled while center rises')
  const late = await frame(timing[80].delay + duration * 0.6, 'late')
  assert.ok(late[80].z > 0 && late[80].z < early[0].z, 'last diagonal descends smoothly from its peak')
  const settled = await frame(total - 1, 'afterglow')
  assert.ok(Math.abs(settled[80].z) < 0.1 && settled[80].opacity < 0.05, 'last diagonal is flat with only faint afterglow before results')
  await p.evaluate(() => {
    // Finish all but the final cell; only the final animation may reveal results.
    window.waveAnimations.slice(0, -1).forEach((a) => a.finish())
  })
  if (holdLast) await p.waitForTimeout(total + 100)
  assert.equal(await p.locator('.dialog-won').count(), 0, 'even a delayed final animation must settle before results')
  await p.evaluate(() => {
    window.waveLastEnd = null
    document.addEventListener('animationend', (e) => {
      if (e.target.matches('.sudoku-cell[data-cell="80"]')) {
        window.waveLastEnd = {
          dialogVisible: !!document.querySelector('.dialog-won'),
          z: new DOMMatrixReadOnly(getComputedStyle(e.target).transform).m43,
        }
      }
    }, {capture: true})
    const last = window.waveAnimations.at(-1)
    last.play()
  })
  await p.waitForSelector('.dialog-won', {timeout: 1000})
  assert.deepEqual(await p.evaluate(() => window.waveLastEnd), {dialogVisible: false, z: 0}, 'last cell settles before the results are mounted')
  assert.equal(await p.locator('.is-celebrating').count(), 0)
  assert.ok(await p.locator('.sudoku-cell').evaluateAll((cells) => cells.every((c) => getComputedStyle(c).transform === 'none')), 'cleanup restores flat native hit targets')
}
async function victoryFeedbackRegressions(p, url) {
  const seed = async () => {
    await p.evaluate(
      ({game, KEY}) => {
        const board = game.solution.map((row) => [...row])
        board[0][2] = 0
        localStorage.setItem(
          KEY,
          JSON.stringify({
            ...game,
            board,
            initial: board,
            hints: 2,
            usedNotes: true,
          }),
        )
        localStorage.removeItem('sudokutaro:records:v1')
        localStorage.setItem('sudokutaro:language', 'zh')
      },
      {game, KEY},
    )
    await p.reload()
    await p.waitForSelector('[data-cell="80"]')
    await loadTestFonts(p, url)
  }
  await seed()
  await p.locator('[data-cell="2"]').click()
  await p.locator('[data-number="4"]').click()
  await p.waitForSelector('.is-celebrating', {timeout: 1500})
  await p.keyboard.press('Escape')
  await p.waitForTimeout(2600)
  assert.equal(
    await p.locator('.dialog-won').count(),
    0,
    'Escape skips celebration without a late results popup',
  )
  assert.equal(await p.locator('.is-celebrating').count(), 0)
  await seed()
  await p.locator('[data-cell="2"]').click()
  await p.locator('[data-number="4"]').click()
  await p.waitForSelector('.is-celebrating', {timeout: 1500})
  assert.equal(
    await p.locator('.dialog-won').count(),
    0,
    'the completed board celebrates before results cover it',
  )
  assert.ok(await p.locator('.victory-sparkles').isVisible())
  assert.ok(
    (await p.locator('[data-victory-status]').innerText()).includes('解开'),
  )
  if (process.env.SCREENSHOT_DIR) {
    fs.mkdirSync(process.env.SCREENSHOT_DIR, {recursive: true})
    await p.screenshot({
      path: path.join(process.env.SCREENSHOT_DIR, 'victory-celebrating.png'),
    })
  }
  await rainbowWaveRegressions(p, true)
  for (const [width, height, visible] of [
    [280, 320, 320],
    [280, 400, 400],
    [280, 480, 480],
    [320, 480, 480],
    [390, 720, 720],
    [390, 720, 400],
    [480, 240, 240],
    [568, 240, 240],
    [568, 320, 320],
    [844, 390, 390],
  ]) {
    await p.setViewportSize({width, height})
    await p.evaluate((h) => {
      Object.defineProperty(visualViewport, 'height', {
        configurable: true,
        value: h,
      })
      visualViewport.dispatchEvent(new Event('resize'))
    }, visible)
    await p.waitForTimeout(80)
    for (const en of [false, true]) {
      await dialogFits(
        p,
        `victory ${width}x${height}/${visible} ${en ? 'en' : 'zh'}`,
      )
      const out = await p.evaluate(() => {
        const badge = document
          .querySelector('.victory-emblem')
          .getBoundingClientRect()
        const preview = document
          .querySelector('.victory-board-preview')
          .getBoundingClientRect()
        const content = document
          .querySelector('.victory-content')
          .getBoundingClientRect()
        return {
          badgeVisible: badge.width > 0 && badge.height > 0,
          previewWidth: preview.width,
          sideBySide: preview.width > 0 && preview.right <= content.left,
          h: visualViewport.height,
        }
      })
      assert.ok(out.badgeVisible, 'small screens retain the victory badge')
      if (width >= 480 && visible <= 390)
        assert.ok(
          out.sideBySide,
          'low landscape has a completed board beside the results',
        )
      if (
        process.env.SCREENSHOT_DIR &&
        !en &&
        ['320x480', '390x720', '480x240'].includes(`${width}x${height}`) &&
        height === visible
      )
        await p.screenshot({
          path: path.join(
            process.env.SCREENSHOT_DIR,
            `victory-${width}x${height}.png`,
          ),
          animations: 'disabled',
        })
      await p
        .getByRole('button', {
          name: en ? 'Admire board' : '欣赏棋盘',
          exact: true,
        })
        .click()
      const completedFits = await p
        .locator('.completed-controls')
        .evaluate((n) => {
          const r = n.getBoundingClientRect()
          return (
            n.scrollHeight <= n.clientHeight + 1 &&
            [...n.querySelectorAll('button')].every((b) => {
              const t = b.getBoundingClientRect()
              return (
                t.top >= r.top &&
                t.bottom <= r.bottom + 0.5 &&
                t.bottom <= visualViewport.height + 0.5
              )
            })
          )
        })
      assert.ok(
        completedFits,
        `completed-board controls fit ${width}x${height}/${visible} ${en ? 'en' : 'zh'}`,
      )
      const resultsButton = p.getByRole('button', {
        name: en ? 'View results' : '查看成绩',
        exact: true,
      })
      assert.equal(
        await resultsButton.evaluate((n) => n === document.activeElement),
        true,
        'admiring the board restores focus to results action',
      )
      await resultsButton.click()
      await p.waitForSelector('.dialog-won')
      await p.getByRole('button', {name: '中文 / EN', exact: true}).click()
    }
    await p.evaluate(() => {
      delete visualViewport.height
      visualViewport.dispatchEvent(new Event('resize'))
    })
  }
  await p.setViewportSize({width: 390, height: 720})
  await p.getByRole('button', {name: '欣赏棋盘', exact: true}).click()
  assert.equal(await p.locator('.dialog-won').count(), 0)
  assert.equal(await p.locator('[data-cell]').count(), 81)
  await p.getByRole('button', {name: '查看成绩', exact: true}).click()
  await p.waitForSelector('.dialog-won')
  await p.getByRole('button', {name: '关闭', exact: true}).click()
  await p.reload()
  await p.waitForSelector('[data-cell="80"]')
  assert.equal(
    await p.locator('.is-celebrating').count(),
    0,
    'refreshing a won game must not replay celebration',
  )
  assert.equal(await p.locator('.dialog-won').count(), 0)
  await p.getByRole('button', {name: '查看成绩', exact: true}).click()
  await p.waitForSelector('.dialog-won')
  assert.equal(
    await p.evaluate(
      () => JSON.parse(localStorage.getItem('sudokutaro:records:v1')).wins,
    ),
    1,
  )
  await p
    .locator('.dialog-won')
    .getByRole('button', {name: '再挑战一局', exact: true})
    .click()
  assert.equal(await p.locator('.dialog-won').count(), 0)
  assert.equal(await p.locator('.number-key').count(), 9)
  // Sample the actual 3D wave in compact portrait, 240px landscape, and a
  // compressed visualViewport; keep all existing dialog/input regressions below.
  for (const [width, height, visible] of [
    [280, 320, 320], [480, 240, 240], [568, 240, 240], [390, 720, 400],
  ]) {
    await p.setViewportSize({width, height})
    await seed()
    await p.evaluate((h) => {
      Object.defineProperty(visualViewport, 'height', {configurable: true, value: h})
      visualViewport.dispatchEvent(new Event('resize'))
    }, visible)
    await p.waitForTimeout(80)
    await p.locator('[data-cell="2"]').click()
    await p.locator('[data-number="4"]').click()
    await p.waitForSelector('.is-celebrating')
    await rainbowWaveRegressions(p, width === 480 ? '480x240' : false, false)
    await p.getByRole('button', {name: '欣赏棋盘', exact: true}).click()
    await p.locator('[data-cell="80"]').click()
    assert.equal(await p.locator('[data-cell="80"]').getAttribute('aria-pressed'), 'true', 'settled cells retain native hit targets')
    await geometry(p, `settled wave ${width}x${height}/${visible}`)
    await p.evaluate(() => {
      delete visualViewport.height
      visualViewport.dispatchEvent(new Event('resize'))
    })
  }
  await p.setViewportSize({width: 390, height: 720})
  const win = async () => {
    await seed()
    await p.locator('[data-cell="2"]').click()
    await p.locator('[data-number="4"]').click()
    await p.waitForSelector('.is-celebrating')
  }
  await win()
  await p.getByRole('button', {name: '设置', exact: true}).click()
  await p.waitForSelector('.is-celebrating', {state: 'detached', timeout: 1000})
  assert.ok(await p.getByRole('switch', {name: '轻触振动', exact: true}).isVisible(), 'settings keeps its content during wave cancellation')
  await p.getByRole('button', {name: '关闭', exact: true}).click()
  await p.waitForTimeout(2600)
  assert.equal(await p.locator('.dialog-won').count(), 0, 'closing a menu early cannot reveal stale results')
  await win()
  await p.getByRole('button', {name: '再挑战一局', exact: true}).click()
  await p.waitForTimeout(2600)
  assert.equal(await p.locator('.dialog-won').count(), 0, 'a new game cannot receive stale results')
  assert.equal(await p.locator('.is-celebrating').count(), 0)
  assert.equal(await p.locator('.number-key').count(), 9)
  assert.ok(await p.locator('.sudoku-cell').evaluateAll((cells) => cells.every((c) => getComputedStyle(c).transform === 'none')), 'new game removes animated transforms')
  await win()
  await p.reload()
  await p.waitForSelector('[data-cell="80"]')
  await p.waitForTimeout(2600)
  assert.equal(await p.locator('.is-celebrating').count(), 0, 'refresh during a wave does not replay it')
  assert.equal(await p.locator('.dialog-won').count(), 0, 'refresh during a wave does not show stale results')
  assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('sudokutaro:records:v1')).wins), 1, 'refresh during a wave records exactly one win')
  await win()
  await p.emulateMedia({reducedMotion: 'reduce'})
  await p.waitForSelector('.dialog-won', {timeout: 1000})
  assert.equal(await p.locator('.is-celebrating').count(), 0, 'changing reduced motion during the wave ends it immediately')
  await p.emulateMedia({reducedMotion: 'no-preference'})
  await p.waitForTimeout(2600)
  assert.equal(await p.locator('.dialog-won').count(), 1, 'preference changes cannot reopen or duplicate results')
  await p.emulateMedia({reducedMotion: 'reduce'})
  await seed()
  await p.locator('[data-cell="2"]').click()
  await p.locator('[data-number="4"]').click()
  await p.waitForSelector('.dialog-won', {timeout: 1000})
  assert.equal(
    await p.locator('.is-celebrating').count(),
    0,
    'reduced motion skips the celebration delay',
  )
  assert.ok(await p.locator('.victory-emblem').isVisible())
  await p.emulateMedia({reducedMotion: 'no-preference'})
  await p.evaluate(
    ({game, KEY}) => {
      localStorage.setItem(KEY, JSON.stringify(game))
      localStorage.removeItem('sudokutaro:records:v1')
    },
    {game, KEY},
  )
  await p.reload()
  await p.waitForSelector('[data-cell="80"]')
  await loadTestFonts(p, url)
}
async function cornerHighlightRegression(p) {
  for (const [width, height] of [
    [390, 720],
    [320, 480],
    [480, 240],
  ]) {
    await p.setViewportSize({width, height})
    await p.waitForTimeout(80)
    for (const [cell, corner] of [
      [0, 'TopLeft'],
      [8, 'TopRight'],
      [72, 'BottomLeft'],
      [80, 'BottomRight'],
    ]) {
      await p.locator(`[data-cell="${cell}"]`).click()
      await p
        .locator(`[data-cell="${cell}"].is-selected`)
        .waitFor({state: 'visible'})
      // Let the existing 120ms highlight transition finish before visual capture.
      await p.waitForTimeout(150)
      if (process.env.SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.SCREENSHOT_DIR, {recursive: true})
        await p.screenshot({
          path: path.join(
            process.env.SCREENSHOT_DIR,
            `corner-${width}-${cell}.png`,
          ),
        })
      }
      const out = await p
        .locator(`[data-cell="${cell}"]`)
        .evaluate((n, corner) => {
          const board = getComputedStyle(n.parentElement),
            style = getComputedStyle(n)
          return {
            clipRadius: parseFloat(board[`border${corner}Radius`]) - 1,
            ringRadius: parseFloat(style[`border${corner}Radius`]),
            width: n.getBoundingClientRect().width,
            shadow: style.boxShadow,
          }
        }, corner)
      assert.ok(
        out.ringRadius >= out.clipRadius &&
          out.ringRadius + 3 <= out.width + 0.5 &&
          out.shadow !== 'none',
        `corner ${cell} ${width}x${height} ring must follow rounded clip without normalization: ${JSON.stringify(out)}`,
      )
    }
  }
  await p.setViewportSize({width: 390, height: 720})
}
async function singleReviewHintRegression(p, url) {
  await p.evaluate(
    ({game, KEY}) => {
      const board = game.board.map((row) => [...row])
      board[0][2] = 1 // A legal but incorrect entry triggers the review hint branch.
      localStorage.setItem(
        KEY,
        JSON.stringify({
          ...game,
          board,
          notes: game.notes.map((ns, i) => (i === 2 ? [] : ns)),
        }),
      )
    },
    {game, KEY},
  )
  await p.reload()
  await p.waitForSelector('[data-cell="80"]')
  await loadTestFonts(p, url)
  for (const en of [false, true]) {
    await p
      .getByRole('button', {name: en ? 'Hint' : '提示', exact: true})
      .click()
    assert.equal(
      (await p.locator('.hint-step').innerText()).replace(/\s/g, ''),
      '1/1',
    )
    assert.equal(
      await p
        .getByRole('button', {
          name: en ? 'Another clue' : '再给一点线索',
          exact: true,
        })
        .count(),
      0,
    )
    assert.ok(
      (await p.locator('.hint-card p').innerText()).includes(
        en ? 'Review' : '回看',
      ),
    )
    if (process.env.SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SCREENSHOT_DIR, {recursive: true})
      await p.screenshot({
        path: path.join(
          process.env.SCREENSHOT_DIR,
          `review-hint-${en ? 'en' : 'zh'}.png`,
        ),
        animations: 'disabled',
      })
    }
    await p
      .getByRole('button', {name: en ? 'Let me try' : '我来试试', exact: true})
      .click()
    assert.equal(
      await p.locator('[data-cell="2"] .cell-digit').innerText(),
      '1',
      'review never replaces the player entry',
    )
    await p
      .getByRole('button', {name: en ? 'Settings' : '设置', exact: true})
      .click()
    await p.getByRole('button', {name: '中文 / EN', exact: true}).click()
    await p
      .getByRole('button', {name: en ? '关闭' : 'Close', exact: true})
      .click()
  }
  await p.evaluate(
    ({game, KEY}) => localStorage.setItem(KEY, JSON.stringify(game)),
    {game, KEY},
  )
  await p.reload()
  await p.waitForSelector('[data-cell="80"]')
  await loadTestFonts(p, url)
}
async function inlineHintRegressions(p) {
  assert.equal(
    await p.locator('.tools button svg').count(),
    4,
    'each tool has an icon',
  )
  for (const [width, height, visible] of [
    [320, 400, 400],
    [280, 400, 400],
    [360, 400, 400],
    [320, 320, 320],
    [320, 568, 400],
    [280, 480, 480],
    [320, 480, 480],
    [390, 720, 720],
    [568, 240, 240],
    [480, 240, 240],
    [720, 540, 540],
    [390, 720, 400],
  ]) {
    await p.setViewportSize({width, height})
    await p.evaluate((h) => {
      Object.defineProperty(visualViewport, 'height', {
        configurable: true,
        value: h,
      })
      visualViewport.dispatchEvent(new Event('resize'))
    }, visible)
    await p.waitForTimeout(80)
    const metaFits = await p
      .locator('.game-meta')
      .evaluate((n) => n.scrollWidth <= n.clientWidth + 1)
    assert.ok(metaFits, `metadata fits ${width}x${height}/${visible}`)
    for (const en of [false, true]) {
      await p
        .getByRole('button', {name: en ? 'Hint' : '提示', exact: true})
        .click()
      assert.equal(
        await p
          .getByRole('button', {
            name: en ? 'Close hint' : '关闭提示',
            exact: true,
          })
          .evaluate((n) => document.activeElement === n),
        true,
        'hint opens with accessible focus',
      )
      const clueTexts = []
      for (let stage = 0; stage < 3; stage++) {
        await p.locator('.hint-card').evaluate(async (n) => {
          await Promise.all(
            n.getAnimations().map((a) => a.finished.catch(() => {})),
          )
        })
        const out = await p.evaluate(() => {
          const b = document
            .querySelector('.board-frame')
            .getBoundingClientRect()
          const card = document.querySelector('.hint-card'),
            r = card.getBoundingClientRect()
          return {
            overlap:
              r.left < b.right &&
              r.right > b.left &&
              r.top < b.bottom &&
              r.bottom > b.top,
            fits:
              r.top >= 0 &&
              r.bottom <= visualViewport.height + 0.5 &&
              r.left >= 0 &&
              r.right <= innerWidth,
            contentFits: card.scrollHeight <= card.clientHeight + 1,
            buttons: [...card.querySelectorAll('button')].every((n) => {
              const t = n.getBoundingClientRect()
              return (
                t.width > 0 &&
                t.height > 0 &&
                t.bottom <= visualViewport.height + 0.5
              )
            }),
            jargon: /R\dC\d/.test(card.textContent),
            r: r.toJSON(),
            board: b.toJSON(),
          }
        })
        assert.ok(
          !out.overlap &&
            out.fits &&
            out.contentFits &&
            out.buttons &&
            !out.jargon,
          `inline hint ${width}x${height}/${visible} ${en ? 'en' : 'zh'} stage${stage}: ${JSON.stringify(out)}`,
        )
        clueTexts.push(await p.locator('.hint-card p').innerText())
        if (stage < 2)
          await p
            .getByRole('button', {
              name: en ? 'Another clue' : '再给一点线索',
              exact: true,
            })
            .click()
      }
      assert.equal(
        new Set(clueTexts).size,
        3,
        'each teaching stage adds different information',
      )
      await p
        .getByRole('button', {
          name: en ? 'Close hint' : '关闭提示',
          exact: true,
        })
        .click()
      assert.equal(await p.locator('.number-key').count(), 9)
      assert.equal(
        await p
          .getByRole('button', {name: en ? 'Hint' : '提示', exact: true})
          .evaluate((n) => document.activeElement === n),
        true,
        'closing hint restores tool focus',
      )
      await p
        .getByRole('button', {name: en ? 'Hint' : '提示', exact: true})
        .click()
      await p
        .getByRole('button', {
          name: en ? 'Let me try' : '我来试试',
          exact: true,
        })
        .click()
      await geometry(p, 'after closing inline hint')
      assert.equal(
        await p
          .locator('.game-meta')
          .evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
        true,
        'localized metadata fits',
      )
      await p.locator('[data-cell="2"]').click()
      await p.locator('[data-number="5"]').click()
      const feedbackFits = await p.locator('.feedback').evaluate((n) => {
        const r = n.getBoundingClientRect(),
          b = document.querySelector('.board-frame').getBoundingClientRect()
        const h = visualViewport.height
        return (
          !(
            r.left < b.right &&
            r.right > b.left &&
            r.top < b.bottom &&
            r.bottom > b.top
          ) &&
          r.bottom <= h + 0.5 &&
          r.left >= 0 &&
          r.right <= innerWidth &&
          [...document.querySelectorAll('.number-key,.tools button')].every(
            (n) => n.getBoundingClientRect().bottom <= h + 0.5,
          )
        )
      })
      assert.ok(
        feedbackFits,
        `feedback fits ${width}x${height}/${visible} ${en ? 'en' : 'zh'}`,
      )
      await p.locator('[data-cell="2"]').click()

      await p
        .getByRole('button', {name: en ? 'Settings' : '设置', exact: true})
        .click()
      await p.getByRole('button', {name: '中文 / EN', exact: true}).click()
      await p
        .getByRole('button', {name: en ? '关闭' : 'Close', exact: true})
        .click()
    }
    await p.evaluate(() => {
      delete visualViewport.height
      visualViewport.dispatchEvent(new Event('resize'))
    })
  }
  await p.setViewportSize({width: 390, height: 720})
  await p.waitForTimeout(80)
  await p.locator('[data-cell="2"]').click()
  await p.locator('[data-number="5"]').click()
  const feedback = await p.locator('.feedback').evaluate((n) => {
    const r = n.getBoundingClientRect(),
      b = document.querySelector('.board-frame').getBoundingClientRect()
    return {
      below: r.top >= b.bottom,
      icon: !!n.querySelector('svg'),
      text: n.textContent,
    }
  })
  assert.ok(
    feedback.below && feedback.icon && feedback.text,
    JSON.stringify(feedback),
  )
  const alignment = await p.evaluate(() => {
    const b = document.querySelector('.board-frame').getBoundingClientRect()
    return [
      ...document.querySelectorAll(
        '.topbar,.game-meta,.selection-caption,.control-pane',
      ),
    ].every((n) => {
      const r = n.getBoundingClientRect()
      return Math.abs(r.left - b.left) <= 1 && Math.abs(r.right - b.right) <= 1
    })
  })
  assert.ok(alignment, 'portrait content aligns with both board edges')
  await p.locator('[data-cell="2"]').click()
}
async function viewportRegressions(p) {
  const failures = []
  const check = async (label, test) => {
    try {
      await test()
    } catch (e) {
      failures.push(label + ': ' + e.message)
    }
  }
  for (const [width, height] of [
    [568, 240],
    [480, 240],
  ]) {
    await p.setViewportSize({width, height})
    await p.waitForTimeout(80)
    await check(`low landscape ${width}x${height}`, async () => {
      await geometry(p, 'low landscape')
      await p.locator('[data-cell="2"]').click()
      await p.getByRole('button', {name: '笔记', exact: true}).click()
      for (const n of ['7', '8', '9'])
        await p.locator(`[data-number="${n}"]`).click()
      assert.equal(
        (await p.locator('[data-cell="2"] .cell-notes').innerText()).replace(
          /\s/g,
          '',
        ),
        '124789',
      )
      for (let i = 0; i < 3; i++)
        await p.getByRole('button', {name: '撤销', exact: true}).click()
      await p.getByRole('button', {name: '笔记', exact: true}).click()
    })
  }
  await p.setViewportSize({width: 390, height: 720})
  await p.waitForTimeout(80)
  for (const [cell, key, want] of [
    [8, 'ArrowRight', '8'],
    [9, 'ArrowLeft', '9'],
    [0, 'ArrowUp', '0'],
    [80, 'ArrowDown', '80'],
    [40, 'ArrowRight', '41'],
    [40, 'ArrowUp', '31'],
  ]) {
    await p.locator(`[data-cell="${cell}"]`).click()
    await p.keyboard.press(key)
    await check(`keyboard ${cell} ${key}`, async () => {
      assert.equal(
        await p
          .locator('[aria-pressed="true"][data-cell]')
          .getAttribute('data-cell'),
        want,
      )
    })
  }
  for (const [width, height, visible] of [
    [568, 240, 240],
    [480, 240, 240],
    [568, 320, 320],
    [320, 480, 480],
    [390, 720, 400],
  ]) {
    await p.setViewportSize({width, height})
    await p.evaluate((height) => {
      Object.defineProperty(visualViewport, 'height', {
        configurable: true,
        value: height,
      })
      visualViewport.dispatchEvent(new Event('resize'))
    }, visible)
    await p.waitForTimeout(80)
    for (const en of [false, true]) {
      for (const modal of ['rules', 'settings', 'new']) {
        if (modal === 'new') {
          await p.locator('.difficulty-button').click()
        } else {
          const name =
            modal === 'rules'
              ? en
                ? 'Rules'
                : '规则'
              : en
                ? 'Settings'
                : '设置'
          await p.getByRole('button', {name, exact: true}).click()
        }
        await p.locator('.dialog').evaluate(async (n) => {
          await Promise.all(
            n.getAnimations().map((a) => a.finished.catch(() => {})),
          )
        })
        await check(
          `${modal} ${width}x${height} visible${visible} ${en ? 'en' : 'zh'}`,
          () => dialogFits(p, modal),
        )
        await p
          .getByRole('button', {name: en ? 'Close' : '关闭', exact: true})
          .click()
      }
      await p
        .getByRole('button', {name: en ? 'Settings' : '设置', exact: true})
        .click()
      await p.getByRole('button', {name: '中文 / EN', exact: true}).click()
      await p
        .getByRole('button', {name: en ? '关闭' : 'Close', exact: true})
        .click()
    }
    await p.evaluate(() => {
      delete visualViewport.height
      visualViewport.dispatchEvent(new Event('resize'))
    })
  }
  await p.setViewportSize({width: 390, height: 720})
  assert.deepEqual(failures, [], 'viewport regressions')
}
;(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const url = `http://127.0.0.1:${server.address().port}${process.env.PAGES_BUILD ? '/SudokuTaro/' : '/'}`
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_EXECUTABLE
      ? {
          executablePath: process.env.BROWSER_EXECUTABLE,
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--no-zygote',
            '--single-process',
            '--in-process-gpu',
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
          ],
        }
      : {}),
  })
  try {
    const p = await browser.newPage({
      viewport: {width: 390, height: 720},
      hasTouch: true,
    })
    p.on('pageerror', (e) => errors.push(e.message))
    p.on('requestfailed', (r) =>
      errors.push(`${r.url()}: ${r.failure()?.errorText}`),
    )
    await p.addInitScript(
      ({game, KEY}) => {
        if (!sessionStorage.getItem('seeded')) {
          localStorage.setItem(KEY, JSON.stringify(game))
          sessionStorage.setItem('seeded', '1')
        }
      },
      {game, KEY},
    )
    await p.goto(url)
    await p.waitForSelector('[data-cell="80"]')
    await loadTestFonts(p, url)
    await victoryFeedbackRegressions(p, url)
    await singleReviewHintRegression(p, url)
    await cornerHighlightRegression(p)
    await inlineHintRegressions(p)
    await viewportRegressions(p)
    const reports = []
    for (const [width, height] of [
      [280, 480],
      [320, 480],
      [320, 568],
      [360, 640],
      [375, 667],
      [390, 720],
      [390, 844],
      [414, 896],
      [430, 932],
      [480, 320],
      [568, 320],
      [667, 375],
      [720, 540],
      [768, 1024],
      [844, 390],
      [1024, 768],
    ]) {
      await p.setViewportSize({width, height})
      await p.waitForTimeout(80)
      reports.push({
        viewport: `${width}x${height}`,
        ...(await geometry(p, `${width}x${height}`)),
      })
      if (
        process.env.SCREENSHOT_DIR &&
        ['320x480', '390x720', '720x540'].includes(`${width}x${height}`)
      ) {
        fs.mkdirSync(process.env.SCREENSHOT_DIR, {recursive: true})
        await p.screenshot({
          path: path.join(process.env.SCREENSHOT_DIR, `${width}x${height}.png`),
        })
      }
    }
    await p.setViewportSize({width: 390, height: 720})
    await p.locator('[data-cell="2"]').click()
    assert.notEqual(
      await p.evaluate(() => document.activeElement.tagName),
      'INPUT',
    )
    await p.getByRole('button', {name: '笔记', exact: true}).click()
    await p.locator('[data-number="1"]').click()
    assert.equal(
      await p
        .locator('[data-cell="2"] .cell-notes')
        .innerText()
        .then((s) => s.replace(/\s/g, '')),
      '24',
    )
    await p.getByRole('button', {name: '撤销', exact: true}).click()
    assert.equal(
      await p
        .locator('[data-cell="2"] .cell-notes')
        .innerText()
        .then((s) => s.replace(/\s/g, '')),
      '124',
    )
    await p.getByRole('button', {name: '笔记', exact: true}).click()
    await p.locator('[data-number="5"]').click()
    assert.equal(await p.locator('[data-cell="2"] .cell-digit').count(), 0)
    assert.ok((await p.locator('.is-conflict').count()) >= 2)
    await p.locator('[data-number="4"]').click()
    assert.equal(
      await p.locator('[data-cell="2"] .cell-digit').innerText(),
      '4',
    )
    await p.getByRole('button', {name: '撤销', exact: true}).click()
    assert.equal(
      await p
        .locator('[data-cell="2"] .cell-notes')
        .innerText()
        .then((s) => s.replace(/\s/g, '')),
      '124',
    )
    const before = await p.locator('.cell-digit').allTextContents()
    await p.getByRole('button', {name: '提示', exact: true}).click()
    assert.equal(await p.locator('.hint-card').count(), 1)
    await p.getByRole('button', {name: '再给一点线索', exact: true}).click()
    await p.getByRole('button', {name: '再给一点线索', exact: true}).click()
    assert.deepEqual(
      await p.locator('.cell-digit').allTextContents(),
      before,
      'Hints must never fill a digit',
    )
    if (process.env.SCREENSHOT_DIR)
      await p.screenshot({
        path: path.join(process.env.SCREENSHOT_DIR, 'hint.png'),
      })
    await p.getByRole('button', {name: '我来试试', exact: true}).click()
    // Progress survives resize, refresh and alternate language.
    const snapshot = await p.evaluate(
      (KEY) => JSON.parse(localStorage.getItem(KEY)).board,
      KEY,
    )
    await p.setViewportSize({width: 720, height: 540})
    await p.reload()
    await p.waitForSelector('[data-cell="80"]')
    assert.deepEqual(
      await p.evaluate(
        (KEY) => JSON.parse(localStorage.getItem(KEY)).board,
        KEY,
      ),
      snapshot,
    )
    for (const [width, height] of [
      [320, 480],
      [568, 320],
      [390, 720],
    ]) {
      await p.setViewportSize({width, height})
      await p.waitForTimeout(80)
      await p.getByRole('button', {name: '规则', exact: true}).click()
      for (let i = 0; i < 4; i++) {
        await dialogFits(p, `rules ${width}x${height} step${i}`)
        await p
          .getByRole('button', {name: i < 3 ? '继续' : '我来试试', exact: true})
          .click()
      }
      await p.getByRole('button', {name: '设置', exact: true}).click()
      await dialogFits(p, 'settings')
      await p.getByRole('button', {name: '中文 / EN', exact: true}).click()
      await dialogFits(p, 'settings en')
      await p.getByRole('button', {name: 'Close', exact: true}).click()
      await p.getByRole('button', {name: 'Rules', exact: true}).click()
      for (let i = 0; i < 4; i++) {
        await dialogFits(p, `English rules ${width}x${height} step${i}`)
        await p
          .getByRole('button', {
            name: i < 3 ? 'Next' : 'Let me try',
            exact: true,
          })
          .click()
      }
      await p.getByRole('button', {name: 'Settings', exact: true}).click()
      await p.getByRole('button', {name: '中文 / EN', exact: true}).click()
      await p.getByRole('button', {name: '关闭', exact: true}).click()
    }
    // Emulate the geometry API, not a specific device model or hinge angle.
    for (const direction of ['vertical', 'horizontal']) {
      const size =
        direction === 'vertical'
          ? {width: 720, height: 540}
          : {width: 720, height: 740}
      await p.setViewportSize(size)
      await p.evaluate((direction) => {
        const segments =
          direction === 'vertical'
            ? [
                {
                  left: 0,
                  top: 0,
                  right: 340,
                  bottom: 540,
                  width: 340,
                  height: 540,
                },
                {
                  left: 380,
                  top: 0,
                  right: 720,
                  bottom: 540,
                  width: 340,
                  height: 540,
                },
              ]
            : [
                {
                  left: 0,
                  top: 0,
                  right: 720,
                  bottom: 350,
                  width: 720,
                  height: 350,
                },
                {
                  left: 0,
                  top: 390,
                  right: 720,
                  bottom: 740,
                  width: 720,
                  height: 350,
                },
              ]
        Object.defineProperty(window, 'viewport', {
          configurable: true,
          value: {segments},
        })
        window.dispatchEvent(new Event('resize'))
      }, direction)
      await p.waitForTimeout(80)
      await geometry(p, 'segmented ' + direction)
      const r = await p.evaluate(() => ({
        board: document
          .querySelector('.sudoku-board')
          .getBoundingClientRect()
          .toJSON(),
        numbers: document
          .querySelector('.number-panel')
          .getBoundingClientRect()
          .toJSON(),
      }))
      if (direction === 'vertical') {
        assert.ok(r.board.right <= 340)
        assert.ok(r.numbers.left >= 380)
      } else {
        assert.ok(r.board.bottom <= 350)
        assert.ok(r.numbers.top >= 390)
      }
      await p.evaluate(() => {
        delete window.viewport
        window.dispatchEvent(new Event('resize'))
      })
    }
    await p.setViewportSize({width: 390, height: 720})
    // A browser toolbar can shrink visualViewport while layout viewport stays larger.
    await p.setViewportSize({width: 720, height: 540})
    await p.evaluate(() => {
      Object.defineProperty(visualViewport, 'height', {
        configurable: true,
        value: 340,
      })
      visualViewport.dispatchEvent(new Event('resize'))
    })
    await p.waitForTimeout(80)
    const bottom = await p
      .locator('.number-panel')
      .evaluate((n) => n.getBoundingClientRect().bottom)
    assert.ok(
      bottom <= 340,
      'controls must fit visualViewport, not just innerHeight',
    )
    await p.getByRole('button', {name: '规则', exact: true}).click()
    assert.ok(
      await p
        .locator('.dialog')
        .evaluate((n) => n.getBoundingClientRect().bottom <= 340),
    )
    await p.getByRole('button', {name: '关闭', exact: true}).click()
    await p.evaluate(() => {
      delete visualViewport.height
      visualViewport.dispatchEvent(new Event('resize'))
    })
    await p.setViewportSize({width: 390, height: 720})
    // A nearly complete puzzle exercises the real victory path and records exactly one win.
    await p.evaluate(
      ({game, KEY}) => {
        const board = game.solution.map((row) => [...row])
        board[0][2] = 0
        localStorage.setItem(
          KEY,
          JSON.stringify({
            ...game,
            board,
            initial: board,
            hints: 2,
            usedNotes: true,
          }),
        )
      },
      {game, KEY},
    )
    await p.reload()
    await p.waitForSelector('[data-cell="80"]')
    await loadTestFonts(p, url)
    await p.locator('[data-cell="2"]').click()
    await p.locator('[data-number="4"]').click()
    await p.waitForSelector('.dialog-won')
    for (const [width, height, visible] of [
      [568, 240, 240],
      [480, 240, 240],
      [568, 320, 320],
      [320, 480, 480],
      [390, 720, 400],
    ]) {
      await p.setViewportSize({width, height})
      await p.evaluate((height) => {
        Object.defineProperty(visualViewport, 'height', {
          configurable: true,
          value: height,
        })
        visualViewport.dispatchEvent(new Event('resize'))
      }, visible)
      await p.waitForTimeout(80)
      await dialogFits(p, 'win')
      await p.getByRole('button', {name: '中文 / EN', exact: true}).click()
      await dialogFits(p, 'win en')
      await p.getByRole('button', {name: '中文 / EN', exact: true}).click()
    }
    await p.evaluate(() => {
      delete visualViewport.height
      visualViewport.dispatchEvent(new Event('resize'))
    })
    assert.equal(
      await p.evaluate(
        () => JSON.parse(localStorage.getItem('sudokutaro:records:v1')).wins,
      ),
      1,
    )
    assert.equal(
      await p
        .locator('.result-metrics')
        .innerText()
        .then((s) => s.includes('2')),
      true,
    )
    await p.reload()
    await p.waitForSelector('[data-cell="80"]')
    assert.equal(
      await p.evaluate(
        () => JSON.parse(localStorage.getItem('sudokutaro:records:v1')).wins,
      ),
      1,
    )
    assert.deepEqual(errors, [])
    console.log(
      JSON.stringify(
        {
          viewports: reports.map((r) => ({
            viewport: r.viewport,
            mode: r.mode,
            board: r.board,
          })),
          checks: [
            'all 81 cells and 9 numbers visible',
            'no page scroll',
            'no native inputs',
            'notes + undo',
            'conflict rejection',
            'guided hints do not fill',
            'review hint appears once; teaching steps contain different clues',
            'four corner selection rings follow board curvature at three sizes',
            'bilingual inline hints never cover board; both close actions restore controls',
            'tool icons + aligned portrait edges + inline feedback',
            'resize + refresh persist',
            'paginated bilingual rules',
            'victory + once-only records',
            'board celebration then results; admire + reopen + refresh + new game',
            'small-screen victory badge + side-by-side landscape + reduced motion + Escape cleanup',
          ],
          runtimeErrors: errors,
        },
        null,
        2,
      ),
    )
  } finally {
    await browser.close()
  }
})()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => server.close())
