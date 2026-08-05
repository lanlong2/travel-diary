import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { useCountUp } from '../hooks/useCountUp'
import { Spinner } from '../components/ui/Spinner'
import { Compass, MapPin, Calendar, ChevronRight, Camera } from 'lucide-react'
import { useMemo } from 'react'
import { parseDateOnly } from '../lib/dates'

// 三种圆角模式交替 — 编辑设计常用手法
const RADIUS_PATTERNS = [
  'rounded-[16px] sm:rounded-tl-[24px] sm:rounded-br-[24px] sm:rounded-tr-[8px] sm:rounded-bl-[8px]',
  'rounded-[16px] sm:rounded-tr-[24px] sm:rounded-bl-[24px] sm:rounded-tl-[8px] sm:rounded-br-[8px]',
  'rounded-[16px]',
]

export function TripsPage() {
  const navigate = useNavigate()
  const { trips, loading, error: tripsError, refresh: refreshTrips } = useTrips()
  const { photos, error: photosError, refresh: refreshPhotos } = usePhotos()

  const photoCountByTrip = useMemo(() => {
    const map = new Map<string, number>()
    photos.forEach((p) => map.set(p.trip_id, (map.get(p.trip_id) || 0) + 1))
    return map
  }, [photos])

  const uniqueCityCount = useMemo(() => {
    const set = new Set<string>()
    trips.forEach((t) => t.cities.forEach((c) => set.add(c.city_name)))
    return set.size
  }, [trips])

  const animatedTrips = useCountUp(trips.length, 1000)
  const animatedPhotos = useCountUp(photos.length, 1200)
  const animatedCities = useCountUp(uniqueCityCount, 900)

  if (loading) {
    return (
      <PageShell>
        <Spinner className="min-h-dvh" />
      </PageShell>
    )
  }

  if (tripsError) {
    return (
      <PageShell>
        <div className="page-mx flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="font-serif text-[17px] text-amber">旅行加载失败</p>
          <p className="mt-2 max-w-sm text-[13px] leading-5 text-dusk-100/60">{tripsError}</p>
          <button
            type="button"
            onClick={() => { void refreshTrips() }}
            className="mt-5 min-h-11 rounded-full border border-amber/30 bg-amber/10 px-5 py-2 text-[12px] font-medium text-amber transition-colors hover:bg-amber/20 active:scale-95"
          >
            重试
          </button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="page-px pt-8 pb-2">
        {/* 顶部章节标识 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="editorial-chapter">CHAPTER · III</span>
          <span className="flex-1 h-px bg-gradient-to-r from-amber/40 to-transparent" />
        </div>

        <h1 className="display-hero text-[28px] text-dusk-50 tracking-[0.04em] animate-fade-in-down flex items-center gap-3">
          <Compass className="w-6 h-6 text-amber" />
          <span className="italic">Journeys</span>
          <span className="font-serif text-[14px] text-dusk-100/60 not-italic font-normal tracking-[0.15em]">旅行</span>
        </h1>

        {/* 统计数据 — 编辑式三段 */}
        <div className="flex items-center gap-3 mt-3 text-xs text-dusk-100/60 tracking-[0.04em] font-mono">
          <span className="inline-flex items-center gap-1">
            <span className="text-amber text-[14px] font-bold tabular-nums">{animatedTrips}</span>
            <span>次</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-amber/50" />
          <span className="inline-flex items-center gap-1">
            <span className="text-amber text-[14px] font-bold tabular-nums">{animatedPhotos}</span>
            <span>张照片</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-amber/50" />
          <span className="inline-flex items-center gap-1">
            <span className="text-amber text-[14px] font-bold tabular-nums">{animatedCities}</span>
            <span>座城市</span>
          </span>
        </div>
      </div>

      {photosError && (
        <div className="page-mx mt-3 flex items-center justify-between gap-3 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-[12px] text-red-200" role="alert">
          <span>照片统计加载失败：{photosError}</span>
          <button type="button" onClick={() => { void refreshPhotos() }} className="min-h-11 flex-shrink-0 rounded-lg px-3 text-amber hover:bg-amber/10">
            重试
          </button>
        </div>
      )}

      {trips.length === 0 ? (
        <div className="page-mx mt-8 glass-card p-12 text-center">
          <p className="font-serif text-[15px] text-dusk-50/85 tracking-[0.04em]">暂无旅行 · 等待第一次出发</p>
        </div>
      ) : (
        <div className="journey-grid page-px py-5">
          {trips.map((trip, i) => {
            const photoCount = photoCountByTrip.get(trip.id) || 0
            const startStr = parseDateOnly(trip.start_date).toLocaleDateString('zh-CN', {
              year: 'numeric', month: 'long', day: 'numeric',
            })
            const endStr = parseDateOnly(trip.end_date).toLocaleDateString('zh-CN', {
              month: 'long', day: 'numeric',
            })
            const duration = Math.ceil(
              (parseDateOnly(trip.end_date).getTime() - parseDateOnly(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
            ) + 1

            const radiusClass = RADIUS_PATTERNS[i % 3]
            const coverLeft = i % 2 === 0

            return (
              <button
                key={trip.id}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className={`w-full glass-card-elevated hover-lift active:brightness-95 transition-all duration-300 overflow-hidden animate-fade-in-up text-left group relative ${radiusClass}`}
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
              >
                {/* 顶部装饰线 — 中间一小段 */}
                <div className="h-px relative">
                  <div
                    className="absolute top-0 h-px"
                    style={{
                      left: '40%',
                      width: '20%',
                      background: 'linear-gradient(90deg, transparent, oklch(58% 0.13 40 / 0.5), transparent)',
                    }}
                  />
                </div>

                <div className="journey-card-layout">
                  {trip.cover_photo && coverLeft && (
                    <div className="journey-cover relative overflow-hidden">
                      <img
                        src={trip.cover_photo}
                        alt={trip.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dusk-950/50" />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'rgba(196, 115, 90, 0.08)' }}
                      />
                    </div>
                  )}

                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-dusk-50 text-[19px] truncate tracking-[0.03em]">
                          {trip.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs text-dusk-100/60">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-amber/70" />
                            {startStr} → {endStr}
                          </span>
                          <span className="text-amber/85 font-semibold">{duration} 天</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-dusk-100/60">
                            <MapPin className="w-3.5 h-3.5 text-amber/70" />
                            {trip.cities.length} 座城市
                          </span>
                          {photoCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-amber/85">
                              <Camera className="w-3.5 h-3.5" />
                              {photoCount} 张
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-dusk-100/40 flex-shrink-0 ml-2 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-amber/80" />
                    </div>
                  </div>

                  {trip.cover_photo && !coverLeft && (
                    <div className="journey-cover relative overflow-hidden">
                      <img
                        src={trip.cover_photo}
                        alt={trip.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-dusk-950/50" />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'rgba(196, 115, 90, 0.08)' }}
                      />
                    </div>
                  )}
                </div>

                {/* 页码效果 */}
                <span
                  className="absolute bottom-2 right-3 font-mono text-[10px] text-dusk-100/25 tracking-[0.05em]"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
