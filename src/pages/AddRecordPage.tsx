import { useState, useEffect } from 'react'
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
import { ArrowLeft, Save, Camera, FileText, Check } from 'lucide-react'

interface SelectedCity {
  name: string
  lat: number
  lng: number
}

const SUBMIT_MESSAGES = [
  '正在把回忆装进瓶子… 🫙',
  '正在标记地图… 📍',
  '保存好了！',
]

const STEPS = [
  { label: '类型', hint: '选择记录方式' },
  { label: '内容', hint: '照片或文字' },
  { label: '城市', hint: '在哪里' },
  { label: '旅行', hint: '归到哪次' },
  { label: '保存', hint: '完成记录' },
] as const

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
  const [submitMsgIdx, setSubmitMsgIdx] = useState(0)
  const [readyBounced, setReadyBounced] = useState(false)

  const isComplete = entryType === 'photo'
    ? !!(file && city && tripId)
    : !!(city && tripId && note.trim())

  // 提交文案循环
  useEffect(() => {
    if (!submitting) {
      setSubmitMsgIdx(0)
      return
    }
    const id = setInterval(() => {
      setSubmitMsgIdx((i) => (i + 1) % SUBMIT_MESSAGES.length)
    }, 800)
    return () => clearInterval(id)
  }, [submitting])

  // 当首次 ready 时触发一次弹跳
  useEffect(() => {
    if (isComplete && !readyBounced) {
      setReadyBounced(true)
    }
    if (!isComplete && readyBounced) {
      setReadyBounced(false)
    }
  }, [isComplete, readyBounced])

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

  // 计算当前步骤进度
  const stepDone = [
    true, // 类型已默认选了
    entryType === 'photo' ? !!file : !!note.trim(),
    !!city,
    !!tripId,
    isComplete && !submitting,
  ]

  const currentStep = stepDone.findIndex((d) => !d)
  const activeStep = currentStep === -1 ? STEPS.length - 1 : currentStep

  return (
    <PageShell hideNav>
      <div className="flex items-center gap-4 px-6 py-5">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl glass-nav flex items-center justify-center hover:bg-white/10 transition-colors active:scale-90"
        >
          <ArrowLeft className="w-5 h-5 text-dusk-50" />
        </button>
        <h1 className="font-serif text-xl font-semibold text-dusk-50 tracking-[0.15em]">
          记录新回忆
        </h1>
      </div>

      {/* 步骤引导 */}
      <div className="mx-6 mb-6 animate-fade-in-down">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => {
            const done = stepDone[i]
            const active = i === activeStep
            return (
              <div key={step.label} className="flex-1 flex flex-col items-center relative">
                <div className="relative">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                      done
                        ? 'bg-amber text-white'
                        : active
                        ? 'bg-amber/20 text-amber border border-amber/50'
                        : 'bg-dusk-600/40 text-dusk-100/40 border border-dusk-300/20'
                    }`}
                    style={active ? { boxShadow: '0 0 0 0 oklch(68% 0.17 40 / 0.5)', animation: 'rippleOut 2s ease-out infinite' } : undefined}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                </div>
                <span
                  className={`text-[10px] mt-1.5 tracking-wide transition-colors duration-300 ${
                    done || active ? 'text-dusk-50/80' : 'text-dusk-100/35'
                  }`}
                >
                  {step.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={`absolute top-[13px] left-[60%] right-[-40%] h-px transition-colors duration-300 ${
                      done ? 'bg-amber/50' : 'bg-dusk-300/20'
                    }`}
                    style={{ width: '80%' }}
                    aria-hidden="true"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-7 pb-10">
        {/* 记录类型 — 卡片式 */}
        <div className="mx-6">
          <label className="block text-sm font-medium text-dusk-100/80 mb-3 tracking-wide">
            记录类型
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {([
              { type: 'photo' as const, icon: Camera, label: '照片记录', hint: '捕捉此刻' },
              { type: 'note' as const, icon: FileText, label: '纯文字', hint: '写下心情' },
            ]).map(({ type, icon: Icon, label, hint }) => {
              const active = entryType === type
              return (
                <button
                  key={type}
                  onClick={() => { setEntryType(type); if (type === 'note') setFile(null) }}
                  className={`relative py-4 px-3 rounded-2xl text-sm font-medium transition-all duration-300 border flex flex-col items-center gap-1.5 tracking-wide overflow-hidden ${
                    active
                      ? 'bg-amber/12 border-amber/50 text-amber scale-[1.02] shadow-lg shadow-amber/15'
                      : 'bg-dusk-600/30 border-dusk-300/20 text-dusk-100/60 hover:border-dusk-300/40 hover:bg-dusk-600/50'
                  }`}
                >
                  {active && (
                    <span
                      className="absolute inset-0 pointer-events-none animate-ripple"
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="w-5 h-5" />
                  <div className="text-center">
                    <p className="font-medium">{label}</p>
                    <p className={`text-[10px] mt-0.5 ${active ? 'text-amber/70' : 'text-dusk-100/35'}`}>
                      {hint}
                    </p>
                  </div>
                </button>
              )
            })}
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
          <label className="block text-sm font-medium text-dusk-100/80 mb-3 tracking-wide">
            记录日期
          </label>
          <input
            type="date"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-dusk-600/40 backdrop-blur-sm border border-dusk-300/30 focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/60 focus:bg-dusk-600/60 transition-all text-dusk-50 text-sm"
          />
        </div>

        <div className="mx-6 pt-3">
          <div className="relative">
            {/* 准备就绪时的光晕 */}
            {isComplete && !submitting && (
              <span
                className="absolute inset-0 rounded-[18px] pointer-events-none animate-ripple"
                style={{ opacity: 0.5 }}
                aria-hidden="true"
              />
            )}
            <Button
              className={`w-full transition-all duration-300 ${isComplete && !submitting ? 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-caramel/55' : ''} ${readyBounced ? 'animate-tab-bounce' : ''}`}
              size="lg"
              disabled={!isComplete || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {SUBMIT_MESSAGES[submitMsgIdx]}
                </span>
              ) : isComplete ? (
                <span className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  可以保存了！
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  保存回忆
                </span>
              )}
            </Button>
          </div>
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
