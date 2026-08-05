import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { PhotoUploader } from '../components/add/PhotoUploader'
import { CitySelector } from '../components/add/CitySelector'
import { TripSelect } from '../components/add/TripSelect'
import { AuthorSelect } from '../components/add/AuthorSelect'
import { NoteInput } from '../components/add/NoteInput'
import { Button } from '../components/ui/Button'
import { Toast } from '../components/ui/Toast'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { getLocalDateString } from '../lib/dates'
import { getErrorMessage } from '../lib/errors'
import { completeRecordSetup } from '../lib/recordWorkflow'
import type { Author } from '../types'
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
  const { uploadPhoto, deletePhoto } = usePhotos()

  const [file, setFile] = useState<File | null>(null)
  const [city, setCity] = useState<SelectedCity | null>(null)
  const [tripId, setTripId] = useState<string | null>(preSelectedTripId)
  const [note, setNote] = useState('')
  const [author, setAuthor] = useState<Author>('我')
  const [entryType, setEntryType] = useState<'photo' | 'note'>('photo')
  const [recordDate, setRecordDate] = useState(getLocalDateString)
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
    let savedPhotoId: string | null = null
    try {
      const savedPhoto = await uploadPhoto(
        entryType === 'photo' ? file : null,
        tripId,
        city.name,
        note,
        author,
        entryType,
        recordDate
      )
      savedPhotoId = savedPhoto?.id ?? null

      await completeRecordSetup({
        tripId,
        city: { city_name: city.name, lat: city.lat, lng: city.lng },
        coverPhotoPath: entryType === 'photo' ? savedPhoto?.image_url : null,
      })

      setToast({ message: '已保存', type: 'success' })
      setTimeout(() => navigate(`/trip/${tripId}`), 800)
    } catch (err) {
      if (savedPhotoId) {
        try {
          await deletePhoto(savedPhotoId)
        } catch (cleanupError) {
          console.warn('保存失败后的记录清理失败:', cleanupError)
        }
      }
      // eslint-disable-next-line no-console
      console.error('保存失败:', err)
      const msg = getErrorMessage(err)
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
          created_by: author,
        },
        city ? [{ city_name: city.name, lat: city.lat, lng: city.lng, sort_order: 0 }] : []
      )
      setTripId(newTrip.id)
      setToast({ message: '新旅行已创建', type: 'success' })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('创建旅行失败:', err)
      const msg = getErrorMessage(err)
      setToast({ message: `创建旅行失败：${msg}`, type: 'error' })
      throw err
    }
  }

  return (
    <PageShell hideNav>
      <div className="flex items-center gap-4 page-px py-5">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-[14px] glass-nav flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 duration-200"
          aria-label="返回"
        >
          <ArrowLeft className="w-5 h-5 text-dusk-50" />
        </button>
        <div>
          <h1 className="display-hero text-[20px] text-dusk-50 tracking-[0.04em] italic">Record</h1>
          <p className="text-[10px] text-dusk-100/50 tracking-[0.15em] font-mono">记录 · CHAPTER I</p>
        </div>
      </div>

      {/* 进度条 — 邮戳式 */}
      <div className="page-mx mb-7 animate-fade-in-down">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-dusk-100/65 tracking-[0.04em] font-mono">
            正在{STEP_LABELS[activeStep]}…
          </span>
          <span className="text-[11px] text-amber/85 font-mono tracking-[0.04em] tabular-nums">
            {String(activeStep + 1).padStart(2, '0')}/{String(STEP_LABELS.length).padStart(2, '0')}
          </span>
        </div>
        <div className="relative h-[3px] bg-dusk-300/15 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber via-amber to-amber-ember transition-all duration-500 rounded-full"
            style={{ width: `${progress * 100}%`, boxShadow: '0 0 8px oklch(68% 0.17 40 / 0.5)' }}
          />
        </div>
      </div>

      <div className="space-y-7 pb-10">
        {/* 记录类型 — 分段控制器 */}
        <div className="page-mx">
          <label className="block text-[13px] font-medium text-dusk-100/80 mb-3 tracking-[0.04em] flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-amber/60" />
            类型
          </label>
          <div role="group" aria-label="记录类型" className="relative inline-flex p-1 rounded-full bg-dusk-600/40 border border-dusk-300/25">
            <div
              className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-amber to-amber-ember transition-transform duration-300"
              style={{
                width: 'calc(50% - 4px)',
                transform: entryType === 'photo' ? 'translateX(0)' : 'translateX(100%)',
                boxShadow: '0 0 12px oklch(68% 0.17 40 / 0.4)',
              }}
            />
            <button
              type="button"
              aria-pressed={entryType === 'photo'}
              onClick={() => { setEntryType('photo'); setFile(null) }}
              className={`relative z-10 px-6 py-2 text-[13px] font-medium tracking-[0.04em] transition-colors ${
                entryType === 'photo' ? 'text-white' : 'text-dusk-100/65'
              }`}
            >
              照片
            </button>
            <button
              type="button"
              aria-pressed={entryType === 'note'}
              onClick={() => { setEntryType('note'); setFile(null) }}
              className={`relative z-10 px-6 py-2 text-[13px] font-medium tracking-[0.04em] transition-colors ${
                entryType === 'note' ? 'text-white' : 'text-dusk-100/65'
              }`}
            >
              文字
            </button>
          </div>
        </div>

        {entryType === 'photo' && (
          <PhotoUploader onFileSelect={setFile} />
        )}
        <AuthorSelect value={author} onChange={setAuthor} />
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

        <div className="page-mx">
          <label htmlFor="record-date" className="block text-[13px] font-medium text-dusk-100/80 mb-3 tracking-[0.04em] flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-amber/60" />
            日期
          </label>
          <input
            id="record-date"
            type="date"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            className="w-full px-4 py-3.5 rounded-[14px] bg-dusk-600/40 backdrop-blur-sm border border-dusk-300/30 focus:outline-none focus:ring-[1px] focus:ring-amber/30 focus:border-amber/55 transition-all text-dusk-50 text-[15px] font-mono"
          />
        </div>

        <div className="page-mx pt-3">
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
