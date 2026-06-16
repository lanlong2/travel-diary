import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { PhotoUploader } from '../components/add/PhotoUploader'
import { CitySelector } from '../components/add/CitySelector'
import { TripSelect } from '../components/add/TripSelect'
import { NoteInput } from '../components/add/NoteInput'
import { Button } from '../components/ui/Button'
import { Toast } from '../components/ui/Toast'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Save } from 'lucide-react'

interface SelectedCity {
  name: string
  lat: number
  lng: number
}

export function AddRecordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preSelectedTripId = searchParams.get('trip')

  const { trips, createTrip } = useTrips()
  const { uploadPhoto } = usePhotos()

  const [file, setFile] = useState<File | null>(null)
  const [city, setCity] = useState<SelectedCity | null>(null)
  const [tripId, setTripId] = useState<string | null>(preSelectedTripId)
  const [note, setNote] = useState('')
  const [author, setAuthor] = useState<'我' | '她'>('我')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async () => {
    if (!file || !city || !tripId) return

    setSubmitting(true)
    try {
      await uploadPhoto(file, tripId, city.name, note, author)

      const trip = trips.find((t) => t.id === tripId)
      if (trip && !trip.cities.some((c) => c.city_name === city.name)) {
        await supabase.from('trip_cities').insert({
          trip_id: tripId,
          city_name: city.name,
          lat: city.lat,
          lng: city.lng,
          sort_order: trip.cities.length,
        })
      }

      setToast({ message: '回忆已保存！', type: 'success' })
      setTimeout(() => navigate(`/trip/${tripId}`), 1200)
    } catch {
      setToast({ message: '保存失败，请重试', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateTrip = async (title: string) => {
    try {
      const newTrip = await createTrip(
        {
          title,
          cover_photo: null,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          created_by: author,
        },
        city ? [{ city_name: city.name, lat: city.lat, lng: city.lng, sort_order: 0 }] : []
      )
      setTripId(newTrip.id)
      setToast({ message: '新旅行已创建！', type: 'success' })
    } catch {
      setToast({ message: '创建旅行失败', type: 'error' })
    }
  }

  const isComplete = file && city && tripId

  return (
    <PageShell hideNav>
      {/* 顶部栏 */}
      <div className="flex items-center gap-4 px-6 py-5">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl bg-white/80 border border-warm-200/50 flex items-center justify-center hover:bg-warm-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-warm-600" />
        </button>
        <h1 className="text-xl font-bold text-warm-900">记录新回忆</h1>
      </div>

      {/* 表单内容 */}
      <div className="space-y-7 pb-10">
        <PhotoUploader onFileSelect={setFile} />
        <CitySelector onCitySelect={setCity} selectedCity={city} />
        <TripSelect
          trips={trips}
          selectedTripId={tripId}
          onSelectTrip={setTripId}
          onCreateTrip={handleCreateTrip}
        />

        {/* 作者选择 */}
        <div className="mx-6">
          <label className="block text-sm font-semibold text-warm-700 mb-3">👤 谁在记录</label>
          <div className="flex gap-2.5">
            {(['我', '她'] as const).map((a) => {
              const isMe = a === '我'
              return (
                <button
                  key={a}
                  onClick={() => setAuthor(a)}
                  className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 border-2 ${
                    author === a
                      ? isMe
                        ? 'bg-blue-50 border-blue-300 text-blue-600 shadow-sm'
                        : 'bg-pink-50 border-pink-300 text-pink-600 shadow-sm'
                      : 'bg-white border-warm-200/60 text-warm-400 hover:border-warm-300'
                  }`}
                >
                  {isMe ? '💙 我' : '💗 她'}
                </button>
              )
            })}
          </div>
        </div>

        <NoteInput value={note} onChange={setNote} />

        {/* 保存按钮 */}
        <div className="mx-6 pt-3">
          <Button
            className="w-full"
            size="lg"
            disabled={!isComplete || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                保存中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                保存回忆
              </span>
            )}
          </Button>
          {!isComplete && (
            <p className="text-center text-[11px] text-warm-300 mt-2.5">
              {!file ? '请先选择照片 · ' : ''}
              {!city ? '请选择城市 · ' : ''}
              {!tripId ? '请选择旅行' : ''}
            </p>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </PageShell>
  )
}
