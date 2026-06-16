const AMAP_KEY = import.meta.env.VITE_AMAP_KEY
// _AMapSecurityConfig is set in index.html before any scripts load

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AMapNS = any

type OnLoadCallback = (AMap: AMapNS) => void

declare global {
  interface Window {
    AMap: AMapNS
    _AMapSecurityConfig: { securityJsCode: string }
    _amap_callbacks: OnLoadCallback[]
    _amap_ready: boolean
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadAMap(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window._amap_ready && window.AMap) {
      resolve(window.AMap)
      return
    }

    if (!window._amap_callbacks) {
      window._amap_callbacks = []
      window._amap_ready = false

      const script = document.createElement('script')
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`
      script.async = true
      script.onerror = () => reject(new Error('高德地图 JS 加载失败'))
      script.onload = () => {
        let attempts = 0
        const check = () => {
          if (window.AMap) {
            window._amap_ready = true
            while (window._amap_callbacks.length) {
              window._amap_callbacks.shift()!(window.AMap)
            }
          } else if (attempts < 50) {
            attempts++
            setTimeout(check, 100)
          } else {
            reject(new Error('高德地图初始化超时'))
          }
        }
        check()
      }
      document.head.appendChild(script)
    }

    window._amap_callbacks.push((AMap) => resolve(AMap))
  })
}
