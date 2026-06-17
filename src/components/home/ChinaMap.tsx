import { useEffect, useRef, useState, useCallback } from 'react'
import { loadAMap } from '../../lib/amap'
import { CityPopup } from './CityPopup'
import type { CitySummary, Photo } from '../../types'

interface ChinaMapProps {
  cities: CitySummary[]
  photos: Photo[]
  onCityClick: (city: CitySummary) => void
}

interface HoveredCity {
  city: CitySummary
  x: number
  y: number
}

export function ChinaMap({ cities, photos, onCityClick }: ChinaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  const [hoveredCity, setHoveredCity] = useState<HoveredCity | null>(null)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateMarkers = useCallback(async () => {
    if (!mapRef.current) return
    try {
      const AMap = await loadAMap()
      mapRef.current.clearMap()
      if (cities.length === 0) return

      const markers = cities.map((city: CitySummary) => {
        const el = document.createElement('div')
        el.innerHTML = `<div style="position:relative;cursor:pointer"><div class="map-marker-dot" style="width:18px;height:18px;background:linear-gradient(135deg,#e8755a,#c44d34);border:2.5px solid #fff;border-radius:50%;box-shadow:0 2px 12px rgba(196,77,52,0.4);transition:transform 0.2s"></div><div style="position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:rgba(254,250,245,0.96);padding:2px 10px;border-radius:10px;font-size:11px;color:#5c3d2e;white-space:nowrap;font-weight:600;pointer-events:none">${city.city_name}</div></div>`

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const marker = new (AMap as any).Marker({
          position: [city.lng, city.lat],
          content: el,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          offset: new (AMap as any).Pixel(-9, -9),
        })

        const showTooltip = () => {
          if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current)
            hoverTimerRef.current = null
          }
          const dot = el.querySelector('.map-marker-dot') as HTMLElement | null
          if (dot) dot.style.transform = 'scale(1.35)'
          const pixel = mapRef.current.lngLatToContainer([city.lng, city.lat])
          setHoveredCity({ city, x: pixel.x, y: pixel.y })
        }

        const hideTooltip = () => {
          const dot = el.querySelector('.map-marker-dot') as HTMLElement | null
          if (dot) dot.style.transform = 'scale(1)'
          hoverTimerRef.current = setTimeout(() => setHoveredCity(null), 150)
        }

        marker.on('mouseover', showTooltip)
        marker.on('mouseout', hideTooltip)
        marker.on('touchstart', (e: Event) => {
          e.preventDefault()
          showTooltip()
        })
        marker.on('touchend', () => {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
          hoverTimerRef.current = setTimeout(() => {
            const dot = el.querySelector('.map-marker-dot') as HTMLElement | null
            if (dot) dot.style.transform = 'scale(1)'
            setHoveredCity(null)
          }, 2000)
        })

        marker.on('click', () => {
          onCityClick(city)
        })

        return marker
      })

      markers.forEach((m: unknown) => mapRef.current.add(m))
      mapRef.current.setFitView(markers, false, [100, 100, 100, 100])
    } catch {
      // 标记更新失败，静默处理
    }
  }, [cities, onCityClick])

  useEffect(() => {
    if (!containerRef.current) return

    let cancelled = false

    loadAMap()
      .then((AMap) => {
        if (cancelled || !containerRef.current) return
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const map = new (AMap as any).Map(containerRef.current, {
            zoom: 4.5,
            center: [104.0, 35.0],
            mapStyle: 'amap://styles/whitesmoke',
            resizeEnable: true,
            dragEnable: true,
            zoomEnable: true,
            touchZoom: true,
          })
          mapRef.current = map
          setStatus('loaded')
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : '地图初始化失败')
          setStatus('error')
        }
      })
      .catch((err) => {
        if (cancelled) return
        setErrorMsg('地图 JS 加载失败，请检查高德 API Key 是否正确')
        setStatus('error')
      })

    return () => {
      cancelled = true
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (mapRef.current) {
        try { mapRef.current.destroy() } catch { /* ignore */ }
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (status === 'loaded') updateMarkers()
  }, [cities, status, updateMarkers])

  const mapHeight = '58vh'

  if (status === 'error') {
    return (
      <div className="mx-6 mt-4 rounded-2xl border-2 border-red-200 flex flex-col items-center justify-center bg-red-50 px-6 text-center" style={{ height: mapHeight }}>
        <p className="text-5xl mb-4">🗺️</p>
        <p className="text-base font-medium text-red-600 mb-2">地图加载失败</p>
        <p className="text-sm text-red-400 mb-3">{errorMsg}</p>
        <p className="text-xs text-red-300">
          请确认高德 Key 已开通「Web端 JS API」服务，且安全密钥正确
        </p>
      </div>
    )
  }

  return (
    <div className="mx-6 mt-4 rounded-2xl overflow-hidden border-2 border-warm-200/70 shadow-md shadow-warm-900/5 relative" style={{ height: mapHeight }}>
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute top-0 left-8 w-16 h-5 bg-warm-400/25 -rotate-3 rounded-sm blur-[0.5px] z-20 pointer-events-none" />
      <div className="absolute top-0 right-12 w-12 h-4 bg-warm-300/20 rotate-6 rounded-sm blur-[0.5px] z-20 pointer-events-none" />

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-warm-50/95 backdrop-blur-sm z-10 pointer-events-none">
          <div className="w-12 h-12 border-[3px] border-warm-200 border-t-caramel rounded-full animate-spin mb-4" />
          <span className="text-base text-warm-500 font-medium">正在绘制足迹地图...</span>
        </div>
      )}

      {hoveredCity && status === 'loaded' && (
        <CityPopup
          city={hoveredCity.city}
          photos={photos}
          x={hoveredCity.x}
          y={hoveredCity.y}
        />
      )}
    </div>
  )
}
