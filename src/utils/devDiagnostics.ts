import Taro from '@tarojs/taro'

const PREFIX = '[SudokuTaro:diag]'

export type BootDiag = {
  at: string
  href: string
  origin: string
  pathname: string
  hash: string
  search: string
}

/** 在 index.html 内联脚本里也会写 window.__SUDOKU_BOOT__，这里合并打印 */
export function logRuntimeDiagnostics(tag: string): void {
  if (typeof window === 'undefined') {
    return
  }
  const w = window as Window & {__SUDOKU_BOOT__?: BootDiag}
  const boot = w.__SUDOKU_BOOT__
  const payload = {
    tag,
    boot,
    href: window.location.href,
    origin: window.location.origin,
    pathname: window.location.pathname,
    hash: window.location.hash,
    search: window.location.search,
    taroEnv: (() => {
      try {
        return Taro.getEnv()
      } catch {
        return 'getEnv failed'
      }
    })(),
    nodeEnv: process.env.NODE_ENV,
  }
  console.log(`${PREFIX} ${tag}`, payload)
  try {
    console.log(`${PREFIX} 复制下面整行给开发者 →`, JSON.stringify(payload))
  } catch {
    // ignore
  }
}
