const AMAP_KEY = import.meta.env.VITE_AMAP_KEY
const AMAP_SECRET = import.meta.env.VITE_AMAP_SECRET

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AMapNS = any

declare global {
  interface Window {
    AMap: AMapNS
    _AMapSecurityConfig?: { securityJsCode: string }
    _amap_ready: boolean
  }
}

let amapPromise: Promise<AMapNS> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadAMap(): Promise<any> {
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
    if (AMAP_SECRET) {
      window._AMapSecurityConfig = { securityJsCode: AMAP_SECRET }
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
