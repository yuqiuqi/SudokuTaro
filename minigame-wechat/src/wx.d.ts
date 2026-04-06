/**
 * 微信小游戏运行环境（按需声明，非完整 SDK）
 */
interface WxSafeArea {
  readonly top: number
  readonly bottom: number
  readonly left: number
  readonly right: number
  readonly width: number
  readonly height: number
}

interface WxSystemInfo {
  readonly windowWidth?: number
  readonly windowHeight?: number
  readonly screenWidth?: number
  readonly screenHeight?: number
  readonly pixelRatio?: number
  readonly safeArea?: WxSafeArea
}

interface WxTouch {
  readonly clientX: number
  readonly clientY: number
}

interface WxTouchEvent {
  readonly touches: WxTouch[]
  readonly changedTouches?: WxTouch[]
}

interface WxCanvas {
  width: number
  height: number
  getContext(contextId: '2d'): CanvasRenderingContext2D | null
  requestAnimationFrame?(cb: () => void): number
}

interface WxNamespace {
  getSystemInfoSync(): WxSystemInfo
  createCanvas(): WxCanvas
  onKeyDown?(cb: (res: { key?: string; code?: string }) => void): void
  onTouchStart(cb: (e: WxTouchEvent) => void): void
  onTouchEnd(cb: (e: WxTouchEvent) => void): void
  onTouchCancel?(cb: (e: WxTouchEvent) => void): void
  onWindowResize?(cb: () => void): void
}

declare const wx: WxNamespace

declare function requestAnimationFrame(cb: () => void): number
declare function setTimeout(cb: () => void, ms: number): number
declare function setInterval(cb: () => void, ms: number): number
declare function clearInterval(id: number | null): void
declare function clearTimeout(id: number | null): void

interface CanvasRenderingContext2D {
  ellipse?(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
  ): void
}
