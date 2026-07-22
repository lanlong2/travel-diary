import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { useCountUp } from '../hooks/useCountUp'
import { Spinner } from '../components/ui/Spinner'
import { Compass, MapPin, Calendar, ChevronRight, Camera } from 'lucide-react'
import { useMemo } from 'react'

// 三种圆角模式交替 — 编辑设计常用手法
const RADIUS_PATTERNS = [
  'rounded-tl-[24px] rounded-br-[24px] rounded-tr-[8px] rounded-bl-[8px]',
  'rounded-tr-[24px] rounded-bl-[24px] rounded-tl-[8px] rounded-br-[8px]',
  'rounded-[16px]',
]

export function TripsPage() {
  const navigate = useNavigate()
  const { trips, loading } = useTrips()
  const { photos } = usePhotos()

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
        <Spinner className="min-h-screen" />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="px-7 pt-8 pb-2">
        <h1 className="flex items-center gap-2.5 font-serif text-2xl font-bold text-dusk-50 tracking-[0.03em] animate-fade-in-down">
          <Compass className="w-6 h-6 text-amber" />
          旅行
        </h1>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-dusk-100/55 tracking-[0.02em] font-mono">
          <span className="inline-flex items-center gap-1">
            <span className="text-amber text-[14px] font-bold tabular-nums">{animatedTrips}</span>
            <span>次</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-amber/40" />
          <span className="inline-flex items-center gap-1">
            <span className="text-amber text-[14px] font-bold tabular-nums">{animatedPhotos}</span>
            <span>张照片</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-amber/40" />
          <span className="inline-flex items-center gap-1">
            <span className="text-amber text-[14px] font-bold tabular-nums">{animatedCities}</span>
            <span>座城市</span>
          </span>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="mx-7 mt-8 glass-card p-12 text-center">
          <p className="font-serif text-[15px] text-dusk-50/85 tracking-[0.02em]">暂无旅行</p>
        </div>
      ) : (
        <div className="px-7 py-4 space-y-3">
          {trips.map((trip, i) => {
            const photoCount = photoCountByTrip.get(trip.id) || 0
            const startStr = new Date(trip.start_date).toLocaleDateString('zh-CN', {
              year: 'numeric', month: 'long', day: 'numeric',
            })
            const endStr = new Date(trip.end_date).toLocaleDateString('zh-CN', {
              month: 'long', day: 'numeric',
            })
            const duration = Math.ceil(
              (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
            ) + 1

            const radiusClass = RADIUS_PATTERNS[i % 3]
            const coverLeft = i % 2 === 0  // 封面图位置交替

            return (
              <button
                key={trip.id}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className={`w-full glass-card hover-lift active:brightness-95 transition-all duration-200 overflow-hidden animate-fade-in-up text-left group relative ${radiusClass}`}
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

                <div className="flex">
                  {/* 封面图 — 位置交替 */}
                  {trip.cover_photo && coverLeft && (
                    <div className="w-[80px] flex-shrink-0 relative overflow-hidden">
                      <img
                        src={trip.cover_photo}
                        alt={trip.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dusk-800/40" />
                      {/* 暖色叠加 */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'rgba(196, 115, 90, 0.08)' }}
                      />
                    </div>
                  )}

                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-dusk-50 text-[19px] truncate tracking-[0.02em]">
                          {trip.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-dusk-100/55">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-amber/70" />
                            {startStr} → {endStr}
                          </span>
                          <span className="text-amber/70">{duration} 天</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-[11px] text-dusk-100/55">
                            <MapPin className="w-3.5 h-3.5 text-amber/70" />
                            {trip.cities.length} 座城市
                          </span>
                          {photoCount > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-amber/80">
                              <Camera className="w-3.5 h-3.5" />
                              {photoCount} 张
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-dusk-100/40 flex-shrink-0 ml-2 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-amber/70" />
                    </div>
                  </div>

                  {/* 封面图右置 */}
                  {trip.cover_photo && !coverLeft && (
                    <div className="w-[80px] flex-shrink-0 relative overflow-hidden">
                      <img
                        src={trip.cover_photo}
                        alt={trip.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-dusk-800/40" />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'rgba(196, 115, 90, 0.08)' }}
                      />
                    </div>
                  )}
                </div>

                {/* 页码效果 — 极淡，右下角 */}
                <span
                  className="absolute bottom-2 right-3 font-mono text-[10px] text-dusk-100/20 tracking-[0.02em]"
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
