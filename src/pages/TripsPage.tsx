import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
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
        <h1 className="flex items-center gap-2.5 font-serif text-2xl font-bold text-dusk-50 tracking-[0.15em]">
          <Compass className="w-6 h-6 text-amber" />
          我们的旅行
        </h1>
        <p className="text-xs text-dusk-100/50 mt-2 tracking-wider font-mono">
          {trips.length} 次旅行 · {photos.length} 张照片
        </p>
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
                className="w-full glass-card hover-lift active:scale-[0.98] transition-all duration-200 overflow-hidden animate-fade-in-up text-left"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
              >
                <div className="h-[2px] bg-gradient-to-r from-amber via-caramel to-transparent" />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-dusk-50 text-lg truncate tracking-wide">{trip.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-dusk-100/55">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-amber/70" />
                          {startStr} — {endStr}
                        </span>
                        <span className="text-amber/70">{duration} 天</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-dusk-100/55">
                          <MapPin className="w-3.5 h-3.5 text-amber/70" />
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
                    <ChevronRight className="w-5 h-5 text-dusk-100/40 flex-shrink-0 ml-2" />
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
