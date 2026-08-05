import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { TripHeader } from '../components/trip/TripHeader'
import { RouteMap } from '../components/trip/RouteMap'
import { PhotoGrid } from '../components/trip/PhotoGrid'
import { PhotoModal } from '../components/trip/PhotoModal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { Toast } from '../components/ui/Toast'
import { CitySelector } from '../components/add/CitySelector'
import { useTrip, useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { Camera, X } from 'lucide-react'

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { trip, loading, error: tripError, refresh } = useTrip(id!)
  const {
    photos,
    loading: photosLoading,
    error: photosError,
    refresh: refreshPhotos,
    updatePhoto,
    deletePhoto,
  } = usePhotos(id)
  const { deleteTrip, updateTrip, addCity, removeCity } = useTrips()
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(trip?.title || '')
  const [editStartDate, setEditStartDate] = useState(trip?.start_date || '')
  const [editEndDate, setEditEndDate] = useState(trip?.end_date || '')
  const [operationError, setOperationError] = useState<string | null>(null)
  const selectedPhoto = selectedPhotoId
    ? photos.find((photo) => photo.id === selectedPhotoId) ?? null
    : null

  if (loading) {
    return <PageShell><Spinner className="min-h-dvh" /></PageShell>
  }

  if (!trip) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 animate-fade-in-up">
          <div className="glass-card p-10 text-center">
            <p className="font-serif text-[17px] text-amber tracking-[0.04em] mb-2">
              {tripError ? '旅行加载失败' : '找不到这次旅行'}
            </p>
            {tripError && (
              <p className="mb-4 max-w-xs text-center text-xs leading-5 text-dusk-100/55">{tripError}</p>
            )}
            <div className="flex items-center justify-center gap-2">
              {tripError && (
                <Button variant="ghost" onClick={() => { void refresh() }}>重试</Button>
              )}
              <Button variant="ghost" onClick={() => navigate('/')}>返回首页</Button>
            </div>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <TripHeader
        trip={trip}
        onDelete={async () => { await deleteTrip(trip.id) }}
        onEdit={() => {
          setEditTitle(trip.title)
          setEditStartDate(trip.start_date)
          setEditEndDate(trip.end_date)
          setEditing(true)
        }}
      />

      {editing && (
        <div className="page-mx mb-5 p-6 glass-card-elevated animate-scale-in">
          {/* 顶部折光线 */}
          <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent" />
          <h3 className="text-sm font-serif font-semibold text-dusk-50 mb-4 tracking-[0.05em] flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-amber" />
            编辑旅行
          </h3>
          <div className="space-y-3">
            <Input
              label="旅行标题"
              placeholder="旅行标题"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex-1">
                <Input
                  label="开始日期"
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="结束日期"
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-dusk-300/20 pt-4 mt-4">
              <h4 className="text-[13px] font-medium text-dusk-100/75 mb-3 tracking-[0.04em] flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-amber/70" />
                城市
              </h4>

              {trip.cities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {trip.cities.map((city, i) => (
                    <span
                      key={city.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/8 border border-dusk-300/20 rounded-full text-sm text-dusk-50"
                    >
                      <span className="w-4 h-4 rounded-full bg-gradient-to-br from-amber to-amber-ember text-white text-[10px] flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      {city.city_name}
                      <button
                        type="button"
                        aria-label={`移除城市：${city.city_name}`}
                        onClick={async () => {
                          setOperationError(null)
                          try {
                            await removeCity(city.id)
                            await refresh()
                          } catch (error) {
                            setOperationError(error instanceof Error ? error.message : '移除城市失败，请稍后重试')
                          }
                        }}
                        className="w-11 h-11 rounded-full bg-white/8 hover:bg-red-500/40 flex items-center justify-center transition-colors active:scale-90 duration-200"
                      >
                        <X className="w-3 h-3 text-dusk-100/70" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <CitySelector
                onCitySelect={async (city) => {
                  if (!city) return
                  setOperationError(null)
                  try {
                    await addCity(trip.id, {
                      city_name: city.name,
                      lat: city.lat,
                      lng: city.lng,
                      sort_order: trip.cities.length,
                    })
                    await refresh()
                  } catch (error) {
                    setOperationError(error instanceof Error ? error.message : '添加城市失败，请稍后重试')
                  }
                }}
                selectedCity={null}
              />
            </div>
          </div>
          <div className="flex gap-2.5 mt-5">
            <button
              onClick={async () => {
                setOperationError(null)
                try {
                  await updateTrip(trip.id, {
                    title: editTitle,
                    start_date: editStartDate,
                    end_date: editEndDate,
                  })
                  await refresh()
                  setEditing(false)
                } catch (error) {
                  setOperationError(error instanceof Error ? error.message : '保存旅行失败，请稍后重试')
                }
              }}
              disabled={!editTitle.trim()}
              className="px-6 py-3 bg-gradient-to-br from-amber via-amber to-amber-ember text-white rounded-[14px] text-[13px] font-semibold disabled:opacity-40 transition-all tracking-[0.04em] active:brightness-95 active:scale-95 duration-200 edge-glow-amber"
            >
              保存
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-3 text-dusk-100/65 text-sm hover:text-dusk-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="mt-5">
        <RouteMap cities={trip.cities} />
      </div>

      {photos.length > 0 && (
        <div className="page-mx mt-6">
          <div className="flex items-center gap-2.5 text-xs text-dusk-100/65 glass-card rounded-2xl px-5 py-3 tracking-[0.05em]">
            <Camera className="w-4 h-4 text-amber" />
            <span>共 <span className="text-amber font-bold tabular-nums">{photos.length}</span> 条记录</span>
          </div>
        </div>
      )}

      <div className="mt-6">
        <PhotoGrid
          photos={photos}
          loading={photosLoading}
          error={photosError}
          onRetry={refreshPhotos}
          onPhotoClick={(photo) => setSelectedPhotoId(photo.id)}
          onDeletePhoto={deletePhoto}
        />
      </div>

      <div className="page-mx mt-7 mb-2">
        <Button className="w-full" size="lg" onClick={() => navigate(`/add?trip=${trip.id}`)}>
          <Camera className="w-5 h-5" />
          添加照片
        </Button>
      </div>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhotoId(null)}
          onDelete={deletePhoto}
          onUpdate={updatePhoto}
        />
      )}

      {operationError && (
        <Toast
          message={operationError}
          type="error"
          isVisible={!!operationError}
          onClose={() => setOperationError(null)}
        />
      )}
    </PageShell>
  )
}
