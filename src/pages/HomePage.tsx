import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { DayCounter } from '../components/home/DayCounter'
import { ChinaMap } from '../components/home/ChinaMap'
import { TripCard } from '../components/home/TripCard'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { Spinner } from '../components/ui/Spinner'
import { Compass, ImageIcon } from 'lucide-react'
import type { CitySummary, Photo } from '../types'

export function HomePage() {
  const navigate = useNavigate()
  const { trips, loading: tripsLoading, error: tripsError, deleteTrip } = useTrips()
  const { photos, loading: photosLoading } = usePhotos()

  const citySummaries = useMemo((): CitySummary[] => {
    const map = new Map<string, CitySummary>()
    trips.forEach((trip) => {
      trip.cities.forEach((city) => {
        const existing = map.get(city.city_name)
        const cityPhotos = photos.filter((p) => p.city_name === city.city_name)
        if (existing) {
          existing.visit_count++
          existing.photo_count += cityPhotos.length
          existing.trips.push(trip.title)
          if (cityPhotos.length > 0) existing.latest_photo = cityPhotos[0].image_url
        } else {
          map.set(city.city_name, {
            city_name: city.city_name,
            visit_count: 1,
            photo_count: cityPhotos.length,
            latest_photo: cityPhotos.length > 0 ? cityPhotos[0].image_url : null,
            lat: city.lat,
            lng: city.lng,
            trips: [trip.title],
          })
        }
      })
    })
    return Array.from(map.values())
  }, [trips, photos])

  const recentPhotos = useMemo(() => {
    return [...photos]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 12)
  }, [photos])

  if (tripsError) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 animate-fade-in-up">
          <div className="w-20 h-20 rounded-[2rem] bg-red-50 border-2 border-red-200 flex items-center justify-center text-3xl mb-5">
            😵
          </div>
          <p className="font-semibold text-warm-700 mb-1">数据加载失败</p>
          <p className="text-sm text-wood/60">{tripsError}</p>
        </div>
      </PageShell>
    )
  }

  if (tripsLoading && photosLoading) {
    return (
      <PageShell>
        <DayCounter />
        <div className="mx-6 mt-4 rounded-2xl border-2 border-warm-200/60 flex items-center justify-center bg-warm-50/50" style={{ height: '55vh' }}>
          <div className="text-center animate-scale-in">
            <div className="w-12 h-12 mx-auto mb-5 rounded-full border-[3px] border-warm-200 border-t-caramel animate-spin" />
            <p className="text-base text-wood/60 font-medium">加载旅途回忆...</p>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <DayCounter />

      <ChinaMap
        cities={citySummaries}
        photos={photos}
        onCityClick={(city) => {
          const trip = trips.find((t) => t.cities.some((c) => c.city_name === city.city_name))
          if (trip) navigate(`/trip/${trip.id}`)
        }}
      />

      {/* 最近照片 */}
      {recentPhotos.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mx-6 mb-3">
            <h3 className="text-base font-bold text-warm-700 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-warm-400" />
              最近照片
            </h3>
            <span className="text-xs text-warm-400 bg-warm-100 px-2.5 py-1 rounded-full font-medium">{photos.length} 张</span>
          </div>
          <div className="flex gap-3 overflow-x-auto px-6 pb-3 scrollbar-hide">
            {recentPhotos.map((photo, i) => (
              <PhotoThumb
                key={photo.id}
                photo={photo}
                index={i}
                onClick={() => {
                  const trip = trips.find((t) => t.id === photo.trip_id)
                  if (trip) navigate(`/trip/${trip.id}`)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 旅行列表 */}
      {trips.length > 0 ? (
        <div className="mt-6 mb-2">
          <div className="flex items-center justify-between mx-6 mb-4">
            <h3 className="text-base font-bold text-warm-700 flex items-center gap-2">
              <Compass className="w-5 h-5 text-warm-400" />
              最近旅行
            </h3>
            <span className="text-xs text-warm-400 bg-warm-100 px-2.5 py-1 rounded-full font-medium">{trips.length} 次</span>
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 pb-3 scrollbar-hide">
            {trips.slice(0, 8).map((trip, i) => (
              <TripCard
                key={trip.id}
                trip={trip}
                cityCount={trip.cities.length}
                index={i}
                onClick={() => navigate(`/trip/${trip.id}`)}
                onDelete={deleteTrip}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-6 mt-5 mb-8 animate-fade-in-up">
          <div className="border-2 border-dashed border-warm-300/60 rounded-2xl p-10 text-center bg-warm-50/30">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-warm-100 flex items-center justify-center text-3xl">
              🗺️
            </div>
            <p className="text-base text-warm-500 font-medium">还没有旅行记录</p>
            <p className="text-sm text-warm-400/70 mt-2 max-w-[280px] mx-auto leading-relaxed">
              点击下方 <span className="text-caramel font-bold">+ 记录</span> 按钮
              <br />
              添加第一次旅行和照片
            </p>
          </div>
        </div>
      )}
    </PageShell>
  )
}

function PhotoThumb({ photo, index, onClick }: { photo: Photo; index: number; onClick: () => void }) {
  const staggerClass = index < 10 ? `animate-fade-in-up stagger-${(index % 8) + 1}` : ''

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 group ${staggerClass}`}
      style={{ opacity: 0 }}
    >
      <div className="polaroid !p-2 !pb-5 w-[100px]">
        <div className="w-full aspect-square rounded-sm overflow-hidden bg-warm-100">
          <img
            src={photo.image_url}
            alt={photo.note || photo.city_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <p className="text-center text-[11px] text-wood/60 mt-2 italic truncate px-0.5">
          {photo.city_name}
        </p>
        {photo.note && (
          <p className="text-center text-[10px] text-wood/40 truncate px-0.5 leading-tight mt-0.5">
            {photo.note}
          </p>
        )}
      </div>
    </button>
  )
}
