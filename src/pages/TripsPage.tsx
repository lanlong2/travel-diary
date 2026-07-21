import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { useCountUp } from '../hooks/useCountUp'
import { Spinner } from '../components/ui/Spinner'
import { Compass, MapPin, Calendar, ChevronRight, Camera } from 'lucide-react'
import { useMemo } from 'react'

export function TripsPage() {
  const navigate = useNavigate()
  const { trips, loading } = useTrips()
  const { photos } = usePhotos()

  const photoCountByTrip = useMemo(() => {
    const map = new Map<string, number>()
    photos.forEach((p) => map.set(p.trip_id, (map.get(p.trip_id) || 0) + 1))
    return map
  }, [photos])

  // 跨越 N 座城市 — unique 计算
  const uniqueCityCount = useMemo(() => {
    const set = new Set<string>()
    trips.forEach((t) => t.cities.forEach((c) => set.add(c.city_name)))
    return set.size
  }, [trips])

  // count-up 数字
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
      <div className="px-6 pt-8 pb-2">
        <h1 className="flex items-center gap-2.5 font-serif text-2xl font-bold text-dusk-50 tracking-[0.15em] animate-fade-in-down">
          <Compass className="w-6 h-6 text-amber" />
          我们的旅行
        </h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-dusk-100/55 tracking-wider font-mono">
          <span className="inline-flex items-center gap-1">
            <span className="text-amber text-[14px] font-bold tabular-nums">{animatedTrips}</span>
            <span>次旅行</span>
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
        <div className="mx-6 mt-8 glass-card p-12 text-center">
          <p className="font-serif text-base text-dusk-50 tracking-wide mb-2">还没有旅行记录</p>
          <p className="text-xs text-dusk-100/55 mt-3">点击下方记录按钮开始</p>
        </div>
      ) : (
        <div className="px-6 py-4 space-y-3">
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

            return (
              <button
                key={trip.id}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="w-full glass-card hover-lift active:scale-[0.98] transition-all duration-200 overflow-hidden animate-fade-in-up text-left group relative"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
              >
                {/* 顶条：左实心圆点 + 中渐变 + 右淡出 */}
                <div className="h-[2px] relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-amber" style={{ boxShadow: '0 0 6px oklch(68% 0.17 40 / 0.7)' }} />
                  <div className="absolute left-5 right-0 top-0 h-full bg-gradient-to-r from-amber via-caramel to-transparent" />
                </div>

                <div className="flex">
                  {/* 全景横幅封面 */}
                  {trip.cover_photo && (
                    <div className="w-[80px] flex-shrink-0 relative overflow-hidden">
                      <img
                        src={trip.cover_photo}
                        alt={trip.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dusk-700/50" />
                    </div>
                  )}

                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-dusk-50 text-lg truncate tracking-wide">
                          {trip.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-dusk-100/55">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-amber/70" />
                            {startStr} — {endStr}
                          </span>
                          <span className="text-amber/70">{duration} 天</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-dusk-100/55">
                            <MapPin className="w-3.5 h-3.5 text-amber/70 animate-breathe" style={{ animationDuration: '4s' }} />
                            {trip.cities.length} 座城市
                          </span>
                          {photoCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-amber/80">
                              <Camera className="w-3.5 h-3.5" />
                              {photoCount} 张
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-dusk-100/40 flex-shrink-0 ml-2 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-amber/70" />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
