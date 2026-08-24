import { useEffect, useRef, useState } from 'react'
import { loadAMap } from '../../lib/amap'
import type { TripCity } from '../../types'

interface RouteMapProps {
  cities: TripCity[]
}

type AMapCoordinate = [number, number]

interface AMapOverlay {
  setMap?: (map: AMapMap | null) => void
  setOptions?: (options: { strokeDasharray?: [number, number] }) => void
}

interface AMapMap {
  destroy: () => void
  add: (overlay: AMapOverlay) => void
  clearMap: () => void
  setFitView: (
    overlayList?: undefined,
    immediately?: boolean,
    avoid?: [number, number, number, number],
  ) => void
  resize?: () => void
}

interface AMapApi {
  Map: new (
    container: HTMLElement,
    options: {
      zoom: number
      center: AMapCoordinate
      mapStyle: string
      resizeEnable: boolean
      dragEnable: boolean
      zoomEnable: boolean
      scrollWheel: boolean
    },
  ) => AMapMap
  Marker: new (options: {
    position: AMapCoordinate
    content: HTMLElement
    offset: AMapPixel
  }) => AMapOverlay
  Pixel: new (x: number, y: number) => AMapPixel
  Polyline: new (options: {
    path: AMapCoordinate[]
    strokeColor: string
    strokeWeight: number
    strokeStyle: string
    lineJoin: string
    strokeOpacity: number
    showDir: boolean
    strokeDasharray: [number, number]
  }) => AMapOverlay
}

interface AMapPixel {
  x?: number
  y?: number
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
  const mapRef = useRef<AMapMap | null>(null)
  const overlaysRef = useRef<AMapOverlay[]>([])
  const initializedRef = useRef(false)
  const citiesRef = useRef(cities)
  citiesRef.current = cities
  const [loaded, setLoaded] = useState(false)
  const hasCities = cities.length > 0
  const cityKey = cities
    .map((city) => `${city.id}:${city.city_name}:${city.lat}:${city.lng}`)
    .join('|')

  useEffect(() => {
    if (!hasCities || !containerRef.current || initializedRef.current) return
    initializedRef.current = true

    let cancelled = false

    void loadAMap()
      .then((AMap) => {
        if (cancelled || !containerRef.current) return

        const firstCity = citiesRef.current[0]
        if (!firstCity) return
        const map = new (AMap as unknown as AMapApi).Map(containerRef.current, {
          zoom: 8,
          center: [firstCity.lng, firstCity.lat],
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
      initializedRef.current = false
      if (mapRef.current) {
        overlaysRef.current.forEach((overlay) => overlay.setMap?.(null))
        overlaysRef.current = []
        mapRef.current.destroy()
        mapRef.current = null
      }
      setLoaded(false)
    }
  }, [hasCities])

  useEffect(() => {
    const currentCities = citiesRef.current
    if (!mapRef.current || !loaded || currentCities.length === 0) return

    let cancelled = false
    let activeInterval: ReturnType<typeof setInterval> | null = null

    const drawRoute = async () => {
      const AMap = (await loadAMap()) as unknown as AMapApi
      if (cancelled || !mapRef.current) return
      const map = mapRef.current

      try {
        map.clearMap()
      } catch {
        /* ignore */
      }
      overlaysRef.current.forEach((overlay) => overlay.setMap?.(null))
      overlaysRef.current = []

      if (currentCities.length > 1) {
        const path = currentCities.map((c) => [c.lng, c.lat] as [number, number])
        const pathLength = approxPathLength(currentCities)

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
        overlaysRef.current.push(polyline)

        let progress = 0
        const totalSteps = 45
        activeInterval = setInterval(() => {
          progress += 1
          if (progress >= totalSteps) {
            if (activeInterval) clearInterval(activeInterval)
            try {
              polyline.setOptions?.({
                strokeDasharray: [pathLength, 0],
              })
            } catch {
              /* ignore */
            }
            return
          }
          const remaining = (1 - progress / totalSteps) * pathLength
          try {
            polyline.setOptions?.({
              strokeDasharray: [pathLength, remaining],
            })
          } catch {
            /* ignore */
          }
        }, 50)
      }

      currentCities.forEach((city, i) => {
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
        overlaysRef.current.push(marker)
      })

      map.setFitView(undefined, false, [80, 80, 80, 80])
    }

    void drawRoute().catch(() => undefined)
    return () => {
      cancelled = true
      if (activeInterval) clearInterval(activeInterval)
      overlaysRef.current.forEach((overlay) => overlay.setMap?.(null))
      overlaysRef.current = []
    }
  }, [cityKey, loaded])

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
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 bg-white/8 border border-dusk-300/20 rounded-[6px] text-dusk-100/85 font-medium tracking-[0.04em] flex-shrink-0">
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
        style={{
          boxShadow: '0 8px 32px oklch(15% 0.02 40 / 0.4), 0 0 0 1px oklch(80% 0.14 60 / 0.12)',
        }}
      />
    </div>
  )
}
