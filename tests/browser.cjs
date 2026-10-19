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
        if (stage < 2)
          await p
            .getByRole('button', {
              name: en ? 'Another clue' : '再给一点线索',
              exact: true,
            })
            .click()
      }
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
            'bilingual inline hints never cover board; both close actions restore controls',
            'tool icons + aligned portrait edges + inline feedback',
            'resize + refresh persist',
            'paginated bilingual rules',
            'victory + once-only records',
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
