import { useEffect, useRef, useState } from 'react'
import { loadAMap } from '../../lib/amap'
import type { TripCity } from '../../types'

interface RouteMapProps {
  cities: TripCity[]
}

function approxPathLength(cities: TripCity[]): number {
  let total = 0
  for (let i = 1; i < cities.length; i++) {
    const dx = cities[i].lng - cities[i - 1].lng
    const dy = cities[i].lat - cities[i - 1].lat
    total += Math.sqrt(dx * dx + dy * dy) * 111000
  }
  return Math.max(total, 100)
}

export function RouteMap({ cities }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<{ destroy: () => void; add: (o: unknown) => void; setFitView: (...a: unknown[]) => void; clearMap: () => void } | null>(null)
  const initializedRef = useRef(false)
  const [loaded, setLoaded] = useState(false)
  const hasCities = cities.length > 0

  useEffect(() => {
    if (!hasCities || !containerRef.current || initializedRef.current) return
    initializedRef.current = true

    let cancelled = false

    void loadAMap()
      .then((AMap) => {
        if (cancelled || !containerRef.current) return

        const map = new AMap.Map(containerRef.current, {
          zoom: 8,
          center: [cities[0].lng, cities[0].lat],
          mapStyle: 'amap://styles/dark',
          resizeEnable: true,
          dragEnable: true,
          zoomEnable: true,
          scrollWheel: false,
        })

        mapRef.current = map
        setLoaded(true)
      })
      .catch(() => {
        if (cancelled) return
        initializedRef.current = false
        setLoaded(false)
      })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
        initializedRef.current = false
      }
      setLoaded(false)
    }
  }, [hasCities])

  useEffect(() => {
    if (!mapRef.current || !loaded || cities.length === 0) return

    let cancelled = false
    let activeInterval: ReturnType<typeof setInterval> | null = null

    const drawRoute = async () => {
      const AMap = await loadAMap()
      if (cancelled || !mapRef.current) return
      const map = mapRef.current as { clearMap: () => void; add: (o: unknown) => void; setFitView: (...a: unknown[]) => void }

      try { map.clearMap() } catch { /* ignore */ }

      if (cities.length > 1) {
        const path = cities.map((c) => [c.lng, c.lat] as [number, number])
        const pathLength = approxPathLength(cities)

        const polyline = new AMap.Polyline({
          path,
          strokeColor: '#c4735a',
          strokeWeight: 3,
          strokeStyle: 'dashed',
          lineJoin: 'round',
          strokeOpacity: 0.85,
          showDir: true,
          strokeDasharray: [pathLength, pathLength * 2],
        })
        map.add(polyline)

        let progress = 0
        const totalSteps = 45
        activeInterval = setInterval(() => {
          progress += 1
          if (progress >= totalSteps) {
            if (activeInterval) clearInterval(activeInterval)
            try {
              polyline.setOptions({
                strokeDasharray: [pathLength, 0],
              })
            } catch { /* ignore */ }
            return
          }
          const remaining = (1 - progress / totalSteps) * pathLength
          try {
            polyline.setOptions({
              strokeDasharray: [pathLength, remaining],
            })
          } catch { /* ignore */ }
        }, 50)
      }

      cities.forEach((city, i) => {
        const el = document.createElement('div')
        el.className = 'route-marker'
        el.style.animationDelay = `${i * 0.5}s`

        const halo = document.createElement('span')
        halo.className = 'route-marker-halo'
        halo.style.animationDelay = `${i * 0.5}s`

        const markerInner = document.createElement('div')
        markerInner.className = 'route-marker-inner'
        markerInner.textContent = String(i + 1)

        const label = document.createElement('div')
        label.className = 'route-marker-label'
        label.textContent = city.city_name

        el.append(halo, markerInner, label)

        const marker = new AMap.Marker({
          position: [city.lng, city.lat],
          content: el,
          offset: new AMap.Pixel(-14, -14),
        })
        map.add(marker)
      })

      map.setFitView(undefined, false, [80, 80, 80, 80])
    }

    void drawRoute().catch(() => undefined)
    return () => {
      cancelled = true
      if (activeInterval) clearInterval(activeInterval)
    }
  }, [cities, loaded])

  if (cities.length === 0) {
    return (
      <div className="page-mx p-6 glass-card text-center text-[13px] text-dusk-100/55 tracking-[0.04em]">
        暂无路线信息
      </div>
    )
  }

  return (
    <div className="page-mx">
      {/* 章节式标题 */}
      <div className="flex items-center gap-3 mb-3">
        <span className="editorial-chapter">I</span>
        <h3 className="font-serif text-[15px] font-semibold text-dusk-50 tracking-[0.05em]">
          旅行路线
        </h3>
        <span className="font-mono text-[11px] text-amber/70 tabular-nums">{cities.length} 城</span>
        <span className="flex-1 h-px bg-gradient-to-r from-amber/35 to-transparent" />
      </div>

      {/* 城市胶囊条 — 编辑式时间线 */}
      <div className="snap-row flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1 items-center">
        {cities.map((city, i) => (
          <div key={city.id} className="snap-item flex items-center gap-2 flex-shrink-0">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 bg-white/8 border border-dusk-300/20 rounded-[6px] text-dusk-100/85 font-medium tracking-[0.04em] flex-shrink-0"
            >
              <span className="w-4 h-4 rounded-full bg-gradient-to-br from-amber to-amber-ember text-white text-[10px] flex items-center justify-center font-bold">
                {i + 1}
              </span>
              {city.city_name}
            </span>
            {i < cities.length - 1 && (
              <span className="text-amber/50 text-[10px] font-mono">→</span>
            )}
          </div>
        ))}
      </div>

      <div
        ref={containerRef}
        className="route-map-canvas w-full rounded-[8px] overflow-hidden border border-dusk-300/30 shadow-lg shadow-black/30"
        style={{ boxShadow: '0 8px 32px oklch(15% 0.02 40 / 0.4), 0 0 0 1px oklch(80% 0.14 60 / 0.12)' }}
      />

      <style>{`
        .route-marker {
          position: relative;
          width: 28px;
          height: 28px;
          opacity: 0;
          animation: routeMarkerIn 0.5s ease-out forwards;
        }
        .route-marker-inner {
          position: relative;
          z-index: 2;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: bold;
          color: #fff;
          background: linear-gradient(135deg, #c4735a, #a85a44);
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          font-family: system-ui, sans-serif;
        }
        .route-marker-halo {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 28px;
          height: 28px;
          margin: -14px 0 0 -14px;
          border-radius: 50%;
          border: 1.5px solid oklch(58% 0.13 40 / 0.5);
          animation: routeMarkerHalo 2s ease-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        .route-marker-label {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: oklch(24% 0.03 45 / 0.9);
          backdrop-filter: blur(12px);
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 10px;
          color: oklch(96% 0.02 70);
          white-space: nowrap;
          font-weight: 600;
          pointer-events: none;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        @keyframes routeMarkerIn {
          from { opacity: 0; transform: scale(0.3); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes routeMarkerHalo {
          0% { transform: scale(1); opacity: 0.45; }
          100% { transform: scale(2.6); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
