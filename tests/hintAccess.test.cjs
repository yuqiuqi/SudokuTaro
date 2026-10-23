const assert = require('node:assert/strict')
const {test, after} = require('node:test')
const {execFileSync} = require('node:child_process')
const fs = require('node:fs'), os = require('node:os'), path = require('node:path')
const compiled = fs.mkdtempSync(path.join(os.tmpdir(), 'sudokutaro-hint-tests-'))
after(() => fs.rmSync(compiled, {recursive: true, force: true}))
try {
  execFileSync(process.execPath, [
    path.join(path.dirname(require.resolve('typescript/package.json')), 'bin/tsc'),
    '--ignoreConfig', '--module', 'node16', '--moduleResolution', 'node16',
    '--target', 'ES2020', '--skipLibCheck', '--outDir', compiled,
    path.resolve(__dirname, '../src/utils/hintAccess.ts'),
  ], {stdio: 'pipe'})
} catch (error) {
  fs.rmSync(compiled, {recursive: true, force: true})
  throw new Error(`Hint access compilation failed:\n${error.stdout || ''}\n${error.stderr || ''}`, {cause: error})
}
const h = require(path.join(compiled, 'hintAccess.js'))
test('an unready provider cannot start watching or grant a reward', async () => {
  let watched = 0
  assert.equal(await h.watchHintAd({isReady: () => false, watch: async () => {watched++; return 'rewarded'}}), false)
  assert.equal(watched, 0)
})
test('only an explicit rewarded completion grants access', async () => {
  for (const [result, expected] of [['rewarded', true], ['cancelled', false], ['unavailable', false], [undefined, false], [true, false], ['completed', false]]) {
    let watched = 0
    assert.equal(await h.watchHintAd({isReady: () => true, watch: async () => {watched++; return result}}), expected, String(result))
    assert.equal(watched, 1)
  }
})
test('readiness failures and playback rejection are contained without rewarding', async () => {
  let watched = 0
  assert.equal(await h.watchHintAd({isReady: () => {throw new Error('SDK missing')}, watch: async () => {watched++; return 'rewarded'}}), false)
  assert.equal(watched, 0)
  assert.equal(await h.watchHintAd({isReady: () => true, watch: async () => {throw new Error('playback failed')}}), false)
  assert.equal(await h.watchHintAd({isReady: () => true, watch: () => {throw new Error('SDK failed synchronously')}}), false)
})
test('a pending ad never grants access before its rewarded completion', async () => {
  let finish, resolved = false
  const access = h.watchHintAd({isReady: () => true, watch: () => new Promise((resolve) => {finish = resolve})})
  access.then(() => {resolved = true})
  await Promise.resolve()
  assert.equal(resolved, false)
  finish('rewarded')
  assert.equal(await access, true)
})

function deferredAd() {
  let resolve, reject, watched = 0
  const completion = new Promise((finish, fail) => {resolve = finish; reject = fail})
  return {
    provider: {isReady: () => true, watch: () => {watched++; return completion}},
    resolve, reject,
    get watched() { return watched },
  }
}
test('the request controller allows only one watch while an ad is pending', async () => {
  const request = h.createHintAdRequest(), ad = deferredAd()
  assert.equal(request.pending, false)
  const first = request.run(ad.provider)
  assert.equal(request.pending, true, 'lock synchronously before playback can settle')
  assert.equal(ad.watched, 1)
  assert.equal(await request.run(ad.provider), null, 'duplicate clicks are ignored')
  assert.equal(ad.watched, 1, 'a duplicate cannot start another provider watch')
  assert.equal(request.pending, true, 'ignored duplicate cannot release the active lock')
  ad.resolve('rewarded')
  assert.equal(await first, true)
  assert.equal(request.pending, false)
})
test('cancelling invalidates a delayed reward and releases the request immediately', async () => {
  const request = h.createHintAdRequest(), ad = deferredAd()
  const result = request.run(ad.provider)
  assert.equal(request.pending, true)
  request.cancel()
  assert.equal(request.pending, false, 'cancellation does not await the SDK')
  request.cancel()
  ad.resolve('rewarded')
  assert.equal(await result, null, 'a cancelled callback cannot grant a hint or close another modal')
  assert.equal(request.pending, false)
})
test('a cancelled old callback cannot release or replace a newer pending request', async () => {
  const request = h.createHintAdRequest(), oldAd = deferredAd(), newAd = deferredAd()
  const oldResult = request.run(oldAd.provider)
  request.cancel()
  const newResult = request.run(newAd.provider)
  assert.equal(request.pending, true)
  assert.equal(oldAd.watched, 1)
  assert.equal(newAd.watched, 1)
  oldAd.resolve('rewarded')
  assert.equal(await oldResult, null)
  assert.equal(request.pending, true, 'late old completion cannot unlock the new request')
  assert.equal(await request.run(newAd.provider), null)
  assert.equal(newAd.watched, 1)
  newAd.resolve('rewarded')
  assert.equal(await newResult, true, 'the new completion retains its own reward')
  assert.equal(request.pending, false)
})
test('an old callback arriving after the new reward stays invalidated', async () => {
  const request = h.createHintAdRequest(), oldAd = deferredAd(), newAd = deferredAd()
  const oldResult = request.run(oldAd.provider)
  request.cancel()
  const newResult = request.run(newAd.provider)
  newAd.resolve('rewarded')
  assert.equal(await newResult, true)
  oldAd.resolve('rewarded')
  assert.equal(await oldResult, null)
  assert.equal(request.pending, false)
})
test('non-rewards and playback errors release the controller for a later retry', async () => {
  const request = h.createHintAdRequest()
  for (const result of ['cancelled', 'unavailable', undefined]) {
    const ad = deferredAd(), access = request.run(ad.provider)
    assert.equal(request.pending, true)
    ad.resolve(result)
    assert.equal(await access, false, String(result))
    assert.equal(request.pending, false)
  }
  const failedAd = deferredAd(), failed = request.run(failedAd.provider)
  failedAd.reject(new Error('network failure'))
  assert.equal(await failed, false)
  assert.equal(request.pending, false)
  const retryAd = deferredAd(), retry = request.run(retryAd.provider)
  retryAd.resolve('rewarded')
  assert.equal(await retry, true)
  assert.equal(request.pending, false)
})
