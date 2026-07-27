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

      const markers = cities.map((city: CitySummary, idx: number) => {
        const el = document.createElement('div')
        const phase = (idx % 4) * 0.6
        el.innerHTML = `<div class="map-marker-wrap">
          <span class="map-marker-ripple"></span>
          <span class="map-marker-ripple delay-1"></span>
          <span class="map-marker-ripple delay-2"></span>
          <div class="map-marker-dot" style="animation-delay:${phase}s"></div>
          <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:oklch(24% 0.03 45 / 0.9);backdrop-filter:blur(12px);padding:2px 10px;border-radius:10px;font-size:11px;color:oklch(96% 0.02 70);white-space:nowrap;font-weight:600;pointer-events:none;letter-spacing:0.05em;box-shadow:0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 oklch(96% 0.02 70 / 0.12)">${city.city_name}</div>
        </div>`

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const marker = new (AMap as any).Marker({
          position: [city.lng, city.lat],
          content: el,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          offset: new (AMap as any).Pixel(-8, -8),
        })

        const showTooltip = () => {
          if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current)
            hoverTimerRef.current = null
          }
          const dot = el.querySelector('.map-marker-dot') as HTMLElement | null
          if (dot) {
            dot.style.transform = 'scale(1.35)'
            dot.style.animationPlayState = 'paused'
          }
          const pixel = mapRef.current.lngLatToContainer([city.lng, city.lat])
          setHoveredCity({ city, x: pixel.x, y: pixel.y })
        }

        const hideTooltip = () => {
          const dot = el.querySelector('.map-marker-dot') as HTMLElement | null
          if (dot) {
            dot.style.transform = ''
            dot.style.animationPlayState = 'running'
          }
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
            if (dot) {
              dot.style.transform = ''
              dot.style.animationPlayState = 'running'
            }
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
            mapStyle: 'amap://styles/dark',
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
      .catch(() => {
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

  if (status === 'error') {
    return (
      <div className="map-frame page-mx mt-4 glass-card flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[13px] text-amber font-medium tracking-[0.04em] mb-2">地图加载失败</p>
        <p className="text-[11px] text-dusk-100/50 mb-3">{errorMsg}</p>
        <p className="text-[11px] text-dusk-100/40">
          请确认高德 Key 已开通「Web端 JS API」服务
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      {/* 章节式标题 */}
      <div className="page-mx flex items-center mb-3 gap-3">
        <span className="editorial-chapter">II</span>
        <span className="font-serif text-[15px] font-semibold text-dusk-50 tracking-[0.05em]">
          足迹地图
        </span>
        <span className="font-mono text-[11px] text-amber/70 tabular-nums">{cities.length} 城</span>
        <span className="flex-1 h-px bg-gradient-to-r from-amber/35 to-transparent" />
      </div>

      <div
        className="map-frame page-mx rounded-[8px] overflow-hidden border border-dusk-300/30 shadow-lg shadow-black/30 relative"
      >
        <div ref={containerRef} className="w-full h-full" />

        {/* 地图右下角邮戳 */}
        {status === 'loaded' && cities.length > 0 && (
          <div
            className="absolute bottom-3 right-3 stamp-mark px-2.5 py-1 flex flex-col items-center"
            style={{ transform: 'rotate(-4deg)' }}
            aria-hidden="true"
          >
            <span className="font-mono text-[8px] tracking-[0.12em] text-stamp-dim leading-none">VISITED</span>
            <span className="font-mono text-[12px] font-bold tracking-[0.04em] text-stamp-ink leading-tight">{cities.length} CITIES</span>
          </div>
        )}

        {status === 'loading' && (
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center map-skeleton">
            <div className="absolute inset-0 bg-dusk-950/75 backdrop-blur-[2px]" aria-hidden="true" />
            <div className="relative flex flex-col items-center justify-center">
              <svg
                width="180"
                height="120"
                viewBox="0 0 180 120"
                className="opacity-30"
                aria-hidden="true"
              >
                <path
                  d="M30,80 Q40,60 50,70 T70,65 Q80,50 95,55 Q105,40 120,45 T140,40 Q150,30 160,40 L155,70 Q145,85 130,80 T100,90 Q80,95 60,85 T30,80 Z"
                  fill="none"
                  stroke="#c4735a"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
              </svg>
              <div className="relative w-8 h-8 mt-4">
                <div className="absolute inset-0 border-[1.5px] border-dusk-400/20 rounded-full" />
                <div className="absolute inset-0 border-[1.5px] border-transparent border-t-amber rounded-full animate-spin" />
              </div>
              <span className="text-[11px] text-dusk-100/65 tracking-[0.06em] mt-3 font-mono">
                加载地图
              </span>
            </div>
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
    </div>
  )
}
