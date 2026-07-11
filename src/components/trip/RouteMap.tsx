import { useEffect, useRef, useState } from 'react'
import { loadAMap } from '../../lib/amap'
import type { TripCity } from '../../types'

interface RouteMapProps {
  cities: TripCity[]
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
        const polyline = new AMap.Polyline({
          path,
          strokeColor: '#e8755a',
          strokeWeight: 3,
          strokeStyle: 'dashed',
          lineJoin: 'round',
          strokeOpacity: 0.85,
          showDir: true,
        })
        map.add(polyline)
      }

      cities.forEach((city, i) => {
        const marker = new AMap.Marker({
          position: [city.lng, city.lat],
          label: {
            content: `<div style="background:linear-gradient(135deg,#e8755a,#c44d34);color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;box-shadow:0 0 12px rgba(232,117,90,0.5),0 2px 8px rgba(0,0,0,0.3);font-family:system-ui;border:2px solid rgba(255,255,255,0.2)">${i + 1}</div>`,
            offset: new AMap.Pixel(-14, -14),
          },
        })
        map.add(marker)
      })

      map.setFitView(undefined, false, [80, 80, 80, 80])
    }

    drawRoute()
  }, [cities, loaded])

  if (cities.length === 0) {
    return (
      <div className="mx-6 p-6 glass-card text-center text-sm text-dusk-100/50 tracking-wide">
        暂无路线信息
      </div>
    )
  }

  return (
    <div className="mx-6">
      <h3 className="font-serif text-[15px] font-semibold text-dusk-50 mb-3 tracking-[0.15em]">旅行路线</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {cities.map((city, i) => (
          <span key={city.id} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white/8 border border-dusk-300/20 rounded-lg text-dusk-100/80 font-medium tracking-wide">
            <span className="w-4 h-4 rounded-full bg-gradient-to-br from-amber to-caramel-700 text-white text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
            {city.city_name}
          </span>
        ))}
      </div>
      <div ref={containerRef} className="w-full h-56 rounded-[20px] overflow-hidden border border-dusk-300/30 shadow-lg shadow-black/20" />
    </div>
  )
}
