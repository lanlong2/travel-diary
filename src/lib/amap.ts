const AMAP_KEY = import.meta.env.VITE_AMAP_KEY
const AMAP_SECURITY_CODE = import.meta.env.VITE_AMAP_SECURITY_CODE

export type AMapCoordinate = [number, number]

export interface AMapPixel {
  x?: number
  y?: number
}

export interface AMapOverlay {
  on?: (eventName: string, handler: (event?: Event) => void) => void
  setMap?: (map: AMapMap | null) => void
  setOptions?: (options: Record<string, unknown>) => void
}

export interface AMapMap {
  add: (overlay: AMapOverlay | AMapOverlay[]) => void
  clearMap: () => void
  destroy: () => void
  lngLatToContainer?: (coordinate: AMapCoordinate) => AMapPixel
  setFitView: (
    overlays?: AMapOverlay[],
    immediately?: boolean,
    avoid?: [number, number, number, number],
  ) => void
}

export interface AMapNamespace {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => AMapMap
  Marker: new (options: {
    position: AMapCoordinate
    content: HTMLElement
    offset: AMapPixel
  }) => AMapOverlay
  Pixel: new (x: number, y: number) => AMapPixel
  Polyline?: new (options: Record<string, unknown>) => AMapOverlay
  plugin?: (name: string, callback: () => void) => void
  AutoComplete?: new (options: { citylimit: boolean }) => {
    search: (
      keyword: string,
      callback: (
        status: string,
        result: { tips?: { name: string; location?: { lat: number; lng: number } }[] },
      ) => void,
    ) => void
  }
  Geocoder?: new () => {
    getAddress: (
      coordinate: AMapCoordinate,
      callback: (
        status: string,
        result: { regeocode?: { addressComponent?: { city?: string } } },
      ) => void,
    ) => void
  }
}

declare global {
  interface Window {
    AMap?: AMapNamespace
    _AMapSecurityConfig?: { securityJsCode: string }
    _amap_ready: boolean
  }
}

let amapPromise: Promise<AMapNamespace> | null = null

export function loadAMap(): Promise<AMapNamespace> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('地图只能在浏览器环境中加载'))
  }

  if (!AMAP_KEY) {
    return Promise.reject(new Error('地图服务未配置，请联系管理员'))
  }

  if (window._amap_ready && window.AMap) {
    return Promise.resolve(window.AMap)
  }

  if (amapPromise) return amapPromise

  amapPromise = new Promise((resolve, reject) => {
    if (AMAP_SECURITY_CODE) {
      window._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY_CODE }
    }
    window._amap_ready = false

    const script = document.createElement('script')
    script.src = 'https://webapi.amap.com/maps?v=2.0&key=' + AMAP_KEY
    script.async = true
    script.onerror = () => {
      amapPromise = null
      reject(new Error('高德地图 JS 加载失败'))
    }
    script.onload = () => {
      let attempts = 0
      const check = () => {
        if (window.AMap) {
          window._amap_ready = true
          resolve(window.AMap)
        } else if (attempts < 50) {
          attempts++
          window.setTimeout(check, 100)
        } else {
          amapPromise = null
          reject(new Error('高德地图初始化超时'))
        }
      }
      check()
    }
    document.head.appendChild(script)
  })

  return amapPromise
}
