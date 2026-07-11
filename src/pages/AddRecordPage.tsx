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
import { ArrowLeft, Save, Camera, FileText } from 'lucide-react'

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
  const [entryType, setEntryType] = useState<'photo' | 'note'>('photo')
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async () => {
    if (entryType === 'photo') {
      if (!file || !city || !tripId) return
    } else {
      if (!city || !tripId || !note.trim()) return
    }

    setSubmitting(true)
    try {
      const savedPhoto = await uploadPhoto(
        entryType === 'photo' ? file : null,
        tripId,
        city.name,
        note,
        entryType,
        recordDate
      )

      const trip = trips.find((t) => t.id === tripId)
      if (trip && !trip.cover_photo && entryType === 'photo' && savedPhoto?.image_url) {
        await supabase.from('trips').update({ cover_photo: savedPhoto.image_url }).eq('id', tripId)
      }

      if (trip && !trip.cities.some((c) => c.city_name === city.name)) {
        await supabase.from('trip_cities').insert({
          trip_id: tripId,
          city_name: city.name,
          lat: city.lat,
          lng: city.lng,
          sort_order: trip.cities.length,
        })
      }

      setToast({ message: '回忆已保存', type: 'success' })
      setTimeout(() => navigate(`/trip/${tripId}`), 1200)
    } catch (err) {
      console.error('保存失败:', err)
      const msg = err instanceof Error ? err.message : '未知错误'
      setToast({ message: `保存失败：${msg}`, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateTrip = async (title: string, startDate: string, endDate: string) => {
    try {
      const newTrip = await createTrip(
        {
          title,
          cover_photo: null,
          start_date: startDate,
          end_date: endDate,
        },
        city ? [{ city_name: city.name, lat: city.lat, lng: city.lng, sort_order: 0 }] : []
      )
      setTripId(newTrip.id)
      setToast({ message: '新旅行已创建', type: 'success' })
    } catch (err) {
      console.error('创建旅行失败:', err)
      const msg = err instanceof Error ? err.message : '未知错误'
      setToast({ message: `创建旅行失败：${msg}`, type: 'error' })
    }
  }

  const isComplete = entryType === 'photo'
    ? !!(file && city && tripId)
    : !!(city && tripId && note.trim())

  return (
    <PageShell hideNav>
      <div className="flex items-center gap-4 px-6 py-5">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl glass-nav flex items-center justify-center hover:bg-white/10 transition-colors active:scale-90"
        >
          <ArrowLeft className="w-5 h-5 text-dusk-50" />
        </button>
        <h1 className="font-serif text-xl font-semibold text-dusk-50 tracking-[0.15em]">记录新回忆</h1>
      </div>

      <div className="space-y-7 pb-10">
        <div className="mx-6">
          <label className="block text-sm font-medium text-dusk-100/80 mb-3 tracking-wide">记录类型</label>
          <div className="flex gap-2.5">
            {([
              { type: 'photo' as const, icon: Camera, label: '照片记录' },
              { type: 'note' as const, icon: FileText, label: '纯文字' },
            ]).map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => { setEntryType(type); if (type === 'note') setFile(null) }}
                className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all duration-200 border flex items-center justify-center gap-2 tracking-wide ${
                  entryType === type
                    ? 'bg-amber/15 border-amber/50 text-amber'
                    : 'bg-dusk-600/30 border-dusk-300/20 text-dusk-100/60 hover:border-dusk-300/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {entryType === 'photo' && (
          <PhotoUploader onFileSelect={setFile} />
        )}
        <CitySelector onCitySelect={setCity} selectedCity={city} />
        <TripSelect
          trips={trips}
          selectedTripId={tripId}
          onSelectTrip={setTripId}
          onCreateTrip={handleCreateTrip}
        />

        <NoteInput
          value={note}
          onChange={setNote}
          rows={entryType === 'note' ? 8 : 5}
        />

        <div className="mx-6">
          <label className="block text-sm font-medium text-dusk-100/80 mb-3 tracking-wide">记录日期</label>
          <input
            type="date"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-dusk-600/40 backdrop-blur-sm border border-dusk-300/30 focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/60 focus:bg-dusk-600/60 transition-all text-dusk-50 text-sm"
          />
        </div>

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
                保存中
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                保存回忆
              </span>
            )}
          </Button>
          {!isComplete && (
            <p className="text-center text-[11px] text-dusk-100/40 mt-2.5 tracking-wide">
              {(!file && entryType === 'photo') ? '请先选择照片 · ' : ''}
              {!city ? '请选择城市 · ' : ''}
              {!tripId ? '请选择旅行 · ' : ''}
              {(entryType === 'note' && !note.trim()) ? '请写下想说的话' : ''}
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
