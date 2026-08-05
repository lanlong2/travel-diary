import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { DayCounter } from '../components/home/DayCounter'
import { ChinaMap } from '../components/home/ChinaMap'
import { TripCard } from '../components/home/TripCard'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import type { CitySummary, Photo } from '../types'
import { formatRecordDate, getRecordTimestamp } from '../lib/dates'

export function HomePage() {
  const navigate = useNavigate()
  const { trips, loading: tripsLoading, error: tripsError, deleteTrip, refresh: refreshTrips } = useTrips()
  const { photos, loading: photosLoading, error: photosError, refresh: refreshPhotos } = usePhotos()

  const citySummaries = useMemo((): CitySummary[] => {
    const map = new Map<string, CitySummary>()
    trips.forEach((trip) => {
      trip.cities.forEach((city) => {
        const existing = map.get(city.city_name)
        const cityPhotos = photos
          .filter((p) => p.city_name === city.city_name && p.image_url)
          .sort((a, b) => getRecordTimestamp(b.record_date, b.created_at) - getRecordTimestamp(a.record_date, a.created_at))
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
      .filter((p) => p.image_url)
      .sort((a, b) => getRecordTimestamp(b.record_date, b.created_at) - getRecordTimestamp(a.record_date, a.created_at))
      .slice(0, 12)
  }, [photos])

  const recentRecords = useMemo(() => {
    return [...photos]
      .filter((p) => !p.image_url && p.note)
      .sort((a, b) => getRecordTimestamp(b.record_date, b.created_at) - getRecordTimestamp(a.record_date, a.created_at))
      .slice(0, 6)
  }, [photos])

  if (tripsError) {
    return (
      <PageShell>
        <DayCounter />
        <div className="page-mx mt-4 glass-card p-10 text-center animate-fade-in-up">
          <p className="font-serif text-[17px] text-amber tracking-[0.04em] mb-2">加载失败</p>
          <p className="text-[13px] text-dusk-100/60">{tripsError}</p>
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

  if (tripsLoading && photosLoading) {
    return (
      <PageShell>
        <DayCounter />
        <div className="page-mx mt-4 glass-card flex min-h-[320px] items-center justify-center md:min-h-[420px]">
          <div className="text-center animate-scale-in">
            <div className="relative w-10 h-10 mx-auto mb-4">
              <div className="absolute inset-0 border-2 border-dusk-400/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-amber rounded-full animate-spin" />
            </div>
            <p className="text-[11px] text-dusk-100/60 tracking-[0.05em] font-mono">加载中</p>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="home-intro-grid">
        <DayCounter />
        <ChinaMap
          cities={citySummaries}
          photos={photos}
          onCityClick={(city) => {
            const trip = trips.find((t) => t.cities.some((c) => c.city_name === city.city_name))
            if (trip) navigate(`/trip/${trip.id}`)
          }}
        />
      </div>

      {recentPhotos.length > 0 && (
        <section className="mt-8 mb-2 reveal">
          {/* 章节式分割 + 标题 */}
          <div className="page-mx flex items-center mb-4 gap-3">
            <span className="editorial-chapter">III</span>
            <span className="font-serif text-[15px] font-semibold text-dusk-50 tracking-[0.05em]">
              最近照片
            </span>
            <span className="font-mono text-[11px] text-amber/70 tabular-nums">{photos.length}</span>
            <span className="flex-1 h-px bg-gradient-to-r from-amber/35 to-transparent" />
          </div>

          {/* 照片横滚 — 重叠 8px 模拟桌上摊开 */}
          <div
            className="home-photo-row snap-row overflow-x-auto page-px pb-4 scrollbar-hide"
          >
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
        </section>
      )}

      {photosError && (
        <div className="page-mx mt-5 flex items-center justify-between gap-3 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-[12px] text-red-200" role="alert">
          <span>照片加载失败：{photosError}</span>
          <button type="button" onClick={() => { void refreshPhotos() }} className="min-h-11 flex-shrink-0 rounded-lg px-3 text-amber hover:bg-amber/10">
            重试
          </button>
        </div>
      )}

      {recentRecords.length > 0 && (
        <section className="mt-6 mb-2 reveal" style={{ transitionDelay: '0.08s' }}>
          <div className="page-mx flex items-center mb-4 gap-3">
            <span className="editorial-chapter">IV</span>
            <span className="font-serif text-[15px] font-semibold text-dusk-50 tracking-[0.05em]">
              最近记录
            </span>
            <span className="font-mono text-[11px] text-amber/70 tabular-nums">
              {photos.filter((p) => !p.image_url && p.note).length}
            </span>
            <span className="flex-1 h-px bg-gradient-to-r from-amber/35 to-transparent" />
          </div>

          <div className="page-mx grid gap-3 md:grid-cols-2">
            {recentRecords.map((record, i) => (
              <button
                key={record.id}
                onClick={() => {
                  const trip = trips.find((t) => t.id === record.trip_id)
                  if (trip) navigate(`/trip/${trip.id}`)
                }}
                className="min-h-[108px] w-full text-left glass-card p-4 hover-lift active:brightness-95 transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <div className="flex items-start gap-3">
                  <span className="font-serif text-lg text-amber/60 leading-none mt-0.5">"</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-dusk-50/90 leading-relaxed line-clamp-2 italic font-serif">
                      {record.note}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-dusk-100/55 font-mono">
                      <span className="truncate">{record.city_name}</span>
                      <span className="w-1 h-1 rounded-full bg-amber/40" />
                      <span>{formatRecordDate(record.record_date, record.created_at, { month: 'numeric', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {trips.length > 0 ? (
        <section className="mt-6 mb-2 reveal" style={{ transitionDelay: '0.2s' }}>
          <div className="page-mx flex items-center mb-4 gap-3">
            <span className="editorial-chapter">V</span>
            <span className="font-serif text-[15px] font-semibold text-dusk-50 tracking-[0.05em]">
              最近旅行
            </span>
            <span className="font-mono text-[11px] text-amber/70 tabular-nums">{trips.length}</span>
            <span className="flex-1 h-px bg-gradient-to-r from-amber/35 to-transparent" />
          </div>
          <div className="home-trip-row snap-row overflow-x-auto page-px pb-4 scrollbar-hide">
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
        </section>
      ) : (
        <div className="page-mx mt-6 mb-8 animate-fade-in-up">
          <div className="glass-card p-12 text-center">
            <p className="font-serif text-[15px] text-dusk-50/85 tracking-[0.04em]">
              这里还空着 · 等待第一段旅程
            </p>
          </div>
        </div>
      )}
    </PageShell>
  )
}

function PhotoThumb({ photo, index, onClick }: { photo: Photo; index: number; onClick: () => void }) {
  const staggerClass = index < 10 ? `animate-fade-in-up stagger-${(index % 8) + 1}` : ''
  const tilt = (index % 3 === 0 ? 0.6 : index % 3 === 1 ? -0.8 : 0.3)

  return (
    <button
      onClick={onClick}
      type="button"
      className={`snap-item group ${staggerClass}`}
      style={{ opacity: 0, marginTop: `${tilt * 3}px` }}
      aria-label={photo.city_name}
    >
      <div className="w-[124px] sm:w-[148px] md:w-full">
        <div
          className="w-full rounded-[6px] overflow-hidden bg-dusk-600 border border-dusk-300/20"
          style={{
            aspectRatio: '3/4',
            transform: `rotate(${tilt}deg)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.25), 0 0 0 1px oklch(80% 0.14 60 / 0.12)',
          }}
        >
          <img
            src={photo.image_url ?? ''}
            alt={photo.note || photo.city_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <p className="text-center text-xs text-dusk-100/75 mt-2 font-medium truncate font-mono">
          {photo.city_name}
        </p>
      </div>
    </button>
  )
}
