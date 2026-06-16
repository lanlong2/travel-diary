import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { TripHeader } from '../components/trip/TripHeader'
import { RouteMap } from '../components/trip/RouteMap'
import { PhotoGrid } from '../components/trip/PhotoGrid'
import { PhotoModal } from '../components/trip/PhotoModal'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useTrip, useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { Camera } from 'lucide-react'
import type { Photo } from '../types'

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { trip, loading } = useTrip(id!)
  const { photos, deletePhoto } = usePhotos(id)
  const { deleteTrip } = useTrips()
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const authorStats = useMemo(() => {
    const me = photos.filter(p => p.author === '我').length
    const her = photos.filter(p => p.author === '她').length
    return { me, her }
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
      />

      <div className="mt-5">
        <RouteMap cities={trip.cities} />
      </div>

      {photos.length > 0 && (
        <div className="mx-6 mt-6">
          <div className="flex items-center gap-3 text-xs text-warm-500 bg-warm-50/80 rounded-2xl px-5 py-3 border border-warm-200/50">
            <Camera className="w-4 h-4" />
            <span>共 {photos.length} 张照片</span>
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
        />
      )}
    </PageShell>
  )
}
