/** Optional local browser diagnostics; no framework runtime required. */
export function logRuntimeDiagnostics(tag: string) {
  if (typeof window !== 'undefined')
    console.debug('[FangcunSudoku:diag]', tag, window.location.href)
}
