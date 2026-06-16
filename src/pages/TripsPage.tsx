import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { Spinner } from '../components/ui/Spinner'
import { Compass, MapPin, Calendar, ChevronRight } from 'lucide-react'
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
      {/* 头部 */}
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-warm-900 flex items-center gap-2">
          <Compass className="w-7 h-7 text-caramel" />
          我们的旅行
        </h1>
        <p className="text-sm text-warm-400 mt-1">
          {trips.length} 次旅行 · {photos.length} 张照片
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="mx-6 mt-8 py-16 text-center border-2 border-dashed border-warm-300/60 rounded-2xl">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="text-warm-500 font-medium">还没有旅行记录</p>
          <p className="text-sm text-warm-400 mt-2">点击下方 + 按钮开始记录吧</p>
        </div>
      ) : (
        <div className="px-6 py-4 space-y-4">
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

            const palettes = [
              'from-amber-50 to-orange-50',
              'from-rose-50 to-pink-50',
              'from-sky-50 to-blue-50',
              'from-emerald-50 to-teal-50',
              'from-violet-50 to-purple-50',
            ]
            const palette = palettes[Math.abs(trip.title.charCodeAt(0)) % palettes.length]

            return (
              <button
                key={trip.id}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="w-full bg-white/80 rounded-2xl border border-warm-200/60 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 overflow-hidden animate-fade-in-up text-left"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
              >
                <div className={`h-2 bg-gradient-to-r ${palette}`} />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-warm-900 text-lg truncate">{trip.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-wood/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {startStr} — {endStr}
                        </span>
                        <span>{duration} 天</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-warm-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {trip.cities.length} 座城市
                        </span>
                        {photoCount > 0 && (
                          <span className="text-xs text-warm-400">📸 {photoCount} 张</span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          trip.created_by === '我'
                            ? 'bg-blue-50 text-blue-400'
                            : 'bg-pink-50 text-pink-400'
                        }`}>
                          {trip.created_by === '我' ? '💙' : '💗'} {trip.created_by}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-warm-300 flex-shrink-0 ml-2" />
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
