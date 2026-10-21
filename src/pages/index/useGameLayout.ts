import {useLayoutEffect, useRef, useState} from 'react'
import type {CSSProperties} from 'react'

type Segment = {
  left: number
  top: number
  width: number
  height: number
  right: number
  bottom: number
}
type Layout = {
  mode: string
  heightLimited?: boolean
  thumbGrid?: boolean
  board: number
  hinge: number
  columns?: string
  rows?: string
  direction?: string
}
/** Measure usable CSS space rather than device pixels; resizing never recreates a game. */
export function useGameLayout() {
  const ref = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout>({
    mode: 'regular',
    board: 300,
    hinge: 24,
  })
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current
      if (!el) return
      const {height: h} = el.getBoundingClientRect()
      const parent = el.parentElement!,
        padding = getComputedStyle(parent)
      const pl = parseFloat(padding.paddingLeft),
        pr = parseFloat(padding.paddingRight)
      // Classify against one safe-area-aware baseline. Mode-specific 12/20px
      // padding may change actual h, but cannot feed back into its own mode.
      const modeHeight =
        parent.clientHeight -
        Math.max(20, parseFloat(padding.paddingTop)) -
        Math.max(20, parseFloat(padding.paddingBottom))
      const w = Math.min(1000, parent.clientWidth - pl - pr)
      const win = window as Window & {
        getWindowSegments?: () => Segment[]
        viewport?: {segments?: Segment[]}
      }
      const segments = [
        ...(win.viewport?.segments ||
          win.getWindowSegments?.() ||
          (window.visualViewport as VisualViewport & {segments?: Segment[]})
            ?.segments ||
          []),
      ].sort((a, b) => a.top - b.top || a.left - b.left)
      const vertical =
        segments.length === 2 && Math.abs(segments[0].top - segments[1].top) < 2
      const horizontal = segments.length === 2 && !vertical
      const mode = horizontal
        ? 'fold-horizontal'
        : vertical ||
            w >= 600 ||
            (modeHeight < 440 && w >= 240) ||
            (w / modeHeight >= 1.3 && w >= 440)
          ? 'wide'
          : modeHeight < 555
            ? 'short'
            : modeHeight < 665
              ? 'compact'
              : 'regular'
      // Three rows earn their extra height only on tall portrait screens.
      const thumbGrid = mode === 'regular' && modeHeight >= 740
      const hinge = vertical
        ? Math.max(0, segments[1].left - segments[0].right)
        : h < 440
          ? 16
          : 24
      // Very short screens keep a readable side panel instead of narrowing the whole stack.
      const controlMinimum = h < 440 ? 150 : 210
      // Stable chrome + caption budgets mirror the corresponding Sass modes.
      let board =
        mode === 'wide'
          ? Math.min(
              414,
              h - (h < 440 ? 120 : 112),
              (w - hinge) * 0.62,
              w - hinge - controlMinimum,
            )
          : mode === 'short'
            ? Math.min(224, w, h - 248)
            : Math.min(
                mode === 'regular' ? 414 : 350,
                w,
                h - (thumbGrid ? 358 : mode === 'compact' ? 312 : 306),
              )
      let columns: string | undefined,
        rows: string | undefined,
        direction: string | undefined
      if (vertical) {
        board = Math.min(board, segments[0].width - 32)
        columns = `${segments[0].width - pl}px ${segments[1].width - pr}px`
      }
      if (horizontal) {
        const top = segments[0],
          bottom = segments[1],
          pt = parseFloat(padding.paddingTop),
          pb = parseFloat(padding.paddingBottom)
        board = Math.min(350, w, top.height - pt - 104)
        rows = `${Math.max(0, top.bottom - pt - 56)}px ${Math.max(0, bottom.height - pb)}px`
        direction = `${Math.max(0, bottom.top - top.bottom)}px`
      }
      setLayout({
        mode,
        heightLimited: modeHeight < 496,
        thumbGrid,
        board: Math.max(90, Math.floor(board)),
        hinge,
        columns,
        rows,
        direction,
      })
    }
    const vv = window.visualViewport
    const updateHeight = () => {
      document.documentElement.style.setProperty(
        '--viewport-height',
        `${vv?.height || window.innerHeight}px`,
      )
      measure()
    }
    updateHeight()
    const observer = new ResizeObserver(measure)
    if (ref.current) {
      observer.observe(ref.current)
      if (ref.current.parentElement) observer.observe(ref.current.parentElement)
    }
    const horizontal = matchMedia('(horizontal-viewport-segments: 2)'),
      vertical = matchMedia('(vertical-viewport-segments: 2)')
    horizontal.addEventListener?.('change', updateHeight)
    vertical.addEventListener?.('change', updateHeight)
    window.addEventListener('resize', updateHeight)
    vv?.addEventListener('resize', updateHeight)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateHeight)
      vv?.removeEventListener('resize', updateHeight)
      horizontal.removeEventListener?.('change', updateHeight)
      vertical.removeEventListener?.('change', updateHeight)
    }
  }, [])
  return {
    ref,
    mode: layout.mode,
    heightLimited: layout.heightLimited,
    thumbGrid: layout.thumbGrid,
    style: {
      '--board-size': `${layout.board}px`,
      '--hinge-gap': `${layout.hinge}px`,
      '--play-columns': layout.columns,
      '--fold-rows': layout.rows,
      '--fold-row-gap': layout.direction,
    } as CSSProperties,
  }
}
