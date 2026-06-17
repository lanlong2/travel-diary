import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { TripHeader } from '../components/trip/TripHeader'
import { RouteMap } from '../components/trip/RouteMap'
import { PhotoGrid } from '../components/trip/PhotoGrid'
import { PhotoModal } from '../components/trip/PhotoModal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { CitySelector } from '../components/add/CitySelector'
import { useTrip, useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { Camera, X } from 'lucide-react'
import type { Photo } from '../types'

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { trip, loading, refresh } = useTrip(id!)
  const { photos, updatePhoto, deletePhoto } = usePhotos(id)
  const { deleteTrip, updateTrip, addCity, removeCity } = useTrips()
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(trip?.title || '')
  const [editStartDate, setEditStartDate] = useState(trip?.start_date || '')
  const [editEndDate, setEditEndDate] = useState(trip?.end_date || '')

  const authorStats = useMemo(() => {
    const mePhotos = photos.filter(p => p.author === '我' && p.entry_type === 'photo').length
    const herPhotos = photos.filter(p => p.author === '她' && p.entry_type === 'photo').length
    const meNotes = photos.filter(p => p.author === '我' && p.entry_type === 'note').length
    const herNotes = photos.filter(p => p.author === '她' && p.entry_type === 'note').length
    return { me: mePhotos + meNotes, her: herPhotos + herNotes }
  }, [photos])

  if (loading) {
    return <PageShell><Spinner className="min-h-screen" /></PageShell>
  }

  if (!trip) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-screen p-8 animate-fade-in-up">
          <div className="w-20 h-20 rounded-[2rem] bg-warm-100 flex items-center justify-center text-3xl mb-4">
            😢
          </div>
          <p className="text-lg text-warm-500 font-medium">找不到这次旅行</p>
          <Button variant="ghost" onClick={() => navigate('/')}>返回首页</Button>
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
        <div className="mx-6 mb-5 p-6 bg-warm-50/80 rounded-2xl border border-warm-200/60 animate-scale-in">
          <h3 className="text-sm font-semibold text-warm-700 mb-4">✏️ 编辑旅行</h3>
          <div className="space-y-3">
            <Input
              placeholder="旅行标题"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* 城市管理 */}
            <div className="border-t border-warm-200/50 pt-4 mt-4">
              <h4 className="text-xs font-semibold text-warm-600 mb-3">🗺️ 城市管理</h4>

              {trip.cities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {trip.cities.map((city) => (
                    <span
                      key={city.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-warm-200 rounded-full text-sm text-warm-700"
                    >
                      {city.city_name}
                      <button
                        onClick={() => removeCity(city.id).then(() => refresh())}
                        className="w-5 h-5 rounded-full bg-warm-100 hover:bg-red-100 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3 text-warm-400 hover:text-red-400" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <CitySelector
                onCitySelect={async (city) => {
                  if (!city) return
                  await addCity(trip.id, {
                    city_name: city.name,
                    lat: city.lat,
                    lng: city.lng,
                    sort_order: trip.cities.length,
                  })
                  refresh()
                }}
                selectedCity={null}
              />
            </div>
          </div>
          <div className="flex gap-2.5 mt-4">
            <button
              onClick={async () => {
                await updateTrip(trip.id, {
                  title: editTitle,
                  start_date: editStartDate,
                  end_date: editEndDate,
                })
                refresh()
                setEditing(false)
              }}
              disabled={!editTitle.trim()}
              className="px-6 py-3 bg-warm-500 text-white rounded-2xl text-sm font-bold disabled:opacity-40 transition-opacity"
            >
              保存
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-3 text-warm-400 text-sm hover:text-warm-600 transition-colors"
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
        <div className="mx-6 mt-6">
          <div className="flex items-center gap-3 text-xs text-warm-500 bg-warm-50/80 rounded-2xl px-5 py-3 border border-warm-200/50">
            <Camera className="w-4 h-4" />
            <span>共 {photos.length} 条记录</span>
            {authorStats.me > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                💙 {authorStats.me}
              </span>
            )}
            {authorStats.her > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                💗 {authorStats.her}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <PhotoGrid
          photos={photos}
          onPhotoClick={setSelectedPhoto}
          onDeletePhoto={deletePhoto}
        />
      </div>

      <div className="mx-6 mt-7 mb-2">
        <Button className="w-full" size="lg" onClick={() => navigate(`/add?trip=${trip.id}`)}>
          <Camera className="w-5 h-5" />
          添加照片
        </Button>
      </div>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={deletePhoto}
          onUpdate={updatePhoto}
        />
      )}
    </PageShell>
  )
}
