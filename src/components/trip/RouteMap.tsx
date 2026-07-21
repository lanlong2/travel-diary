import { useEffect, useRef, useState } from 'react'
import { loadAMap } from '../../lib/amap'
import type { TripCity } from '../../types'

interface RouteMapProps {
  cities: TripCity[]
}

// 简单近似估算路径总长度（用于 strokeDasharray 模拟绘制动画）
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

  useEffect(() => {
    if (cities.length === 0 || !containerRef.current || initializedRef.current) return
    initializedRef.current = true

    let cancelled = false

    loadAMap().then((AMap) => {
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

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
        initializedRef.current = false
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !loaded || cities.length === 0) return

    const drawRoute = async () => {
      const AMap = await loadAMap()
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

        // 绘制速度从 30 步 → 45 步，更慢更有仪式感
        let progress = 0
        const totalSteps = 45
        const animInterval = setInterval(() => {
          progress += 1
          if (progress >= totalSteps) {
            clearInterval(animInterval)
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

      // 标记点 stagger 0.5s/个
      cities.forEach((city, i) => {
        const el = document.createElement('div')
        el.innerHTML = `<div class="route-marker" style="animation-delay:${i * 0.5}s">
          <span class="route-marker-halo" style="animation-delay:${i * 0.5}s"></span>
          <div class="route-marker-inner">${i + 1}</div>
          <div class="route-marker-label">${city.city_name}</div>
        </div>`

        const marker = new AMap.Marker({
          position: [city.lng, city.lat],
          content: el,
          offset: new AMap.Pixel(-14, -14),
        })
        map.add(marker)
      })

      map.setFitView(undefined, false, [80, 80, 80, 80])
    }

    drawRoute()
  }, [cities, loaded])

  if (cities.length === 0) {
    return (
      <div className="mx-7 p-6 glass-card text-center text-[13px] text-dusk-100/50 tracking-[0.02em]">
        暂无路线信息
      </div>
    )
  }

  return (
    <div className="mx-7">
      <h3 className="font-serif text-[15px] font-semibold text-dusk-50 mb-3 tracking-[0.02em]">
        旅行路线
      </h3>
      {/* 城市胶囊条 */}
      <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
        {cities.map((city, i) => (
          <span
            key={city.id}
            className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 bg-white/8 border border-dusk-300/20 rounded-[6px] text-dusk-100/80 font-medium tracking-[0.02em] flex-shrink-0"
          >
            <span className="w-4 h-4 rounded-full bg-gradient-to-br from-terracotta to-caramel-700 text-white text-[10px] flex items-center justify-center font-bold">
              {i + 1}
            </span>
            {city.city_name}
          </span>
        ))}
      </div>
      <div
        ref={containerRef}
        className="w-full h-56 rounded-[20px] overflow-hidden border border-dusk-300/30 shadow-lg shadow-black/20"
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
          border: 2px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
          border: 1.5px solid oklch(58% 0.13 40 / 0.45);
          animation: routeMarkerHalo 2s ease-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        .route-marker-label {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: oklch(24% 0.03 45 / 0.85);
          backdrop-filter: blur(12px);
          padding: 1px 8px;
          border-radius: 8px;
          font-size: 10px;
          color: oklch(96% 0.02 70);
          white-space: nowrap;
          font-weight: 600;
          pointer-events: none;
          letter-spacing: 0.02em;
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
