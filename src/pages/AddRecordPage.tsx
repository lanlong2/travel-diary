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
import { ArrowLeft, Camera, FileText } from 'lucide-react'

interface SelectedCity {
  name: string
  lat: number
  lng: number
}

const STEP_LABELS = ['类型', '内容', '城市', '旅行', '保存'] as const

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

  const isComplete = entryType === 'photo'
    ? !!(file && city && tripId)
    : !!(city && tripId && note.trim())

  const stepDone = [
    true,
    entryType === 'photo' ? !!file : !!note.trim(),
    !!city,
    !!tripId,
    isComplete && !submitting,
  ]

  const currentStep = stepDone.findIndex((d) => !d)
  const activeStep = currentStep === -1 ? STEP_LABELS.length - 1 : currentStep
  const progress = (activeStep + 1) / STEP_LABELS.length

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

      setToast({ message: '已保存', type: 'success' })
      setTimeout(() => navigate(`/trip/${tripId}`), 800)
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

  return (
    <PageShell hideNav>
      <div className="flex items-center gap-4 px-7 py-5">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-[14px] glass-nav flex items-center justify-center hover:bg-white/10 transition-colors active:brightness-95"
          aria-label="返回"
        >
          <ArrowLeft className="w-5 h-5 text-dusk-50" />
        </button>
        <h1 className="font-serif text-[19px] font-semibold text-dusk-50 tracking-[0.03em]">
          记录
        </h1>
      </div>

      {/* 进度条 — 替代步骤圆点 */}
      <div className="mx-7 mb-7 animate-fade-in-down">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-dusk-100/55 tracking-[0.02em]">
            正在{STEP_LABELS[activeStep]}…
          </span>
          <span className="text-[11px] text-dusk-100/40 font-mono tracking-[0.02em]">
            {activeStep + 1}/{STEP_LABELS.length}
          </span>
        </div>
        <div className="relative h-[2px] bg-dusk-300/15 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-terracotta transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-7 pb-10">
        {/* 记录类型 — 分段控制器 */}
        <div className="mx-7">
          <label className="block text-[13px] font-medium text-dusk-100/80 mb-3 tracking-[0.02em]">
            类型
          </label>
          <div className="relative inline-flex p-1 rounded-full bg-dusk-600/40 border border-dusk-300/25">
            <div
              className="absolute top-1 bottom-1 rounded-full bg-terracotta transition-transform duration-300"
              style={{
                width: 'calc(50% - 4px)',
                transform: entryType === 'photo' ? 'translateX(0)' : 'translateX(100%)',
              }}
            />
            <button
              onClick={() => { setEntryType('photo'); setFile(null) }}
              className={`relative z-10 px-6 py-2 text-[13px] font-medium tracking-[0.02em] transition-colors ${
                entryType === 'photo' ? 'text-white' : 'text-dusk-100/60'
              }`}
            >
              照片
            </button>
            <button
              onClick={() => setEntryType('note')}
              className={`relative z-10 px-6 py-2 text-[13px] font-medium tracking-[0.02em] transition-colors ${
                entryType === 'note' ? 'text-white' : 'text-dusk-100/60'
              }`}
            >
              文字
            </button>
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

        <div className="mx-7">
          <label className="block text-[13px] font-medium text-dusk-100/80 mb-3 tracking-[0.02em]">
            日期
          </label>
          <input
            type="date"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            className="w-full px-4 py-3.5 rounded-[14px] bg-dusk-600/40 backdrop-blur-sm border border-dusk-300/30 focus:outline-none focus:ring-[1px] focus:ring-terracotta/25 focus:border-terracotta/50 transition-colors text-dusk-50 text-[15px]"
          />
        </div>

        <div className="mx-7 pt-3">
          <Button
            className={`w-full transition-opacity duration-500 ${isComplete ? 'opacity-100' : 'opacity-40'}`}
            size="lg"
            disabled={!isComplete || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                保存中
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {entryType === 'photo' ? <Camera className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                保存
              </span>
            )}
          </Button>
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
