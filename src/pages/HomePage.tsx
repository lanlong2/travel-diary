import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { DayCounter } from '../components/home/DayCounter'
import { ChinaMap } from '../components/home/ChinaMap'
import { TripCard } from '../components/home/TripCard'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
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
      .filter((p) => p.entry_type !== 'note' && p.image_url)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 12)
  }, [photos])

  if (tripsError) {
    return (
      <PageShell>
        <DayCounter />
        <div className="mx-6 mt-4 glass-card p-10 text-center animate-fade-in-up">
          <p className="font-serif text-lg text-amber tracking-wide mb-2">数据加载失败</p>
          <p className="text-sm text-dusk-100/60">{tripsError}</p>
        </div>
      </PageShell>
    )
  }

  if (tripsLoading && photosLoading) {
    return (
      <PageShell>
        <DayCounter />
        <div className="mx-6 mt-4 glass-card flex items-center justify-center" style={{ height: '55vh' }}>
          <div className="text-center animate-scale-in">
            <div className="w-10 h-10 mx-auto mb-4 rounded-full border-[2px] border-dusk-400 border-t-amber animate-spin" />
            <p className="text-xs text-dusk-100/60 tracking-wider">加载旅途回忆</p>
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

      {recentPhotos.length > 0 && (
        <div className="mt-7">
          <div className="flex items-center justify-between mx-6 mb-3">
            <h3 className="font-serif text-[15px] font-semibold text-dusk-50 tracking-[0.15em]">
              最近照片
            </h3>
            <span className="text-[11px] text-dusk-100/60 font-mono tracking-wider">
              {photos.length} 张
            </span>
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

      {trips.length > 0 ? (
        <div className="mt-7 mb-2">
          <div className="flex items-center justify-between mx-6 mb-4">
            <h3 className="font-serif text-[15px] font-semibold text-dusk-50 tracking-[0.15em]">
              最近旅行
            </h3>
            <span className="text-[11px] text-dusk-100/60 font-mono tracking-wider">
              {trips.length} 次
            </span>
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
        <div className="mx-6 mt-6 mb-8 animate-fade-in-up">
          <div className="glass-card p-12 text-center">
            <p className="font-serif text-base text-dusk-50 tracking-wide mb-2">
              还没有旅行记录
            </p>
            <p className="text-xs text-dusk-100/55 mt-3 max-w-[280px] mx-auto leading-relaxed tracking-wide">
              点击下方 <span className="text-amber font-semibold">记录</span> 按钮
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
      <div className="w-[100px]">
        <div className="w-full aspect-square rounded-xl overflow-hidden bg-dusk-600 border border-dusk-300/20 shadow-md shadow-black/20">
          <img
            src={photo.image_url ?? ''}
            alt={photo.note || photo.city_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <p className="text-center text-[11px] text-dusk-100/70 mt-2 font-medium tracking-wide truncate">
          {photo.city_name}
        </p>
        {photo.note && (
          <p className="text-center text-[10px] text-dusk-100/40 truncate leading-tight mt-0.5 tracking-wide">
            {photo.note}
          </p>
        )}
      </div>
    </button>
  )
}
