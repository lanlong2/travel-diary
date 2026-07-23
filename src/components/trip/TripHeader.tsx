import { useState } from 'react'
import { ArrowLeft, Calendar, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Trip } from '../../types'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface TripHeaderProps {
  trip: Trip
  onDelete?: () => Promise<void>
  onEdit?: () => void
}

export function TripHeader({ trip, onDelete, onEdit }: TripHeaderProps) {
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const startStr = new Date(trip.start_date).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  const endStr = new Date(trip.end_date).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  const duration = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  const startYear = new Date(trip.start_date).getFullYear()
  const startMonth = String(new Date(trip.start_date).getMonth() + 1).padStart(2, '0')

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    await onDelete()
    setDeleting(false)
    setShowDelete(false)
    navigate('/')
  }

  return (
    <>
      <div className="relative pt-5 pb-10">
        <div className="absolute top-6 left-5 right-5 flex justify-between z-20">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 glass-nav rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 duration-200"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5 text-dusk-50" />
          </button>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="w-11 h-11 glass-nav rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 duration-200"
                aria-label="编辑"
              >
                <Pencil className="w-4 h-4 text-dusk-100" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDelete(true)}
                className="w-11 h-11 glass-nav rounded-full flex items-center justify-center hover:bg-red-500/40 transition-all active:scale-90 duration-200"
                aria-label="删除"
              >
                <Trash2 className="w-4 h-4 text-dusk-100" />
              </button>
            )}
          </div>
        </div>

        {trip.cover_photo ? (
          // 封面 hero — 全宽
          <div
            className="relative w-screen overflow-hidden"
            style={{ marginLeft: 'calc(50% - 50vw)', height: '240px' }}
          >
            <img
              src={trip.cover_photo}
              alt={trip.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* 底部深色渐变 */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, oklch(20% 0.03 40 / 0.55) 0%, oklch(20% 0.03 40 / 0.10) 50%, oklch(22% 0.035 45 / 0.95) 100%)',
              }}
            />
            {/* 暖色叠加 */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'rgba(196, 115, 90, 0.06)' }}
            />

            {/* 邮戳 — 右下角 */}
            <div
              className="absolute bottom-6 right-6 stamp-mark px-3 py-2 flex flex-col items-center"
              style={{ transform: 'rotate(-5deg)' }}
              aria-hidden="true"
            >
              <span className="font-mono text-[8px] tracking-[0.12em] text-stamp-dim leading-none">JOURNEY</span>
              <span className="font-mono text-[14px] font-bold tracking-[0.04em] text-stamp-ink leading-tight">{startYear}.{startMonth}</span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center pt-12">
            {/* 无封面 — 首字母大卡片 */}
            <div
              className="w-[120px] h-[120px] rounded-[16px] bg-gradient-to-br from-amber/25 via-amber/15 to-amber-ember/10 border border-amber/30 flex items-center justify-center mb-5"
              style={{ boxShadow: '0 12px 36px oklch(68% 0.17 40 / 0.25), inset 0 1px 0 oklch(96% 0.02 70 / 0.15)' }}
            >
              <span className="display-hero italic font-bold text-3xl text-amber tracking-[0.04em]">
                {trip.title.slice(0, 1)}
              </span>
            </div>
          </div>
        )}

        {/* 标题 — 在封面下方 */}
        <div className={`relative px-7 text-center ${trip.cover_photo ? 'mt-8' : ''}`}>
          <h1 className="display-hero text-[32px] text-dusk-50 tracking-[0.04em] mb-4">
            {trip.title}
          </h1>

          <div className="inline-flex items-center gap-2.5 text-[11px] text-dusk-100/65 glass-nav px-4 py-2 rounded-full tracking-[0.04em]">
            <Calendar className="w-3.5 h-3.5 text-amber" />
            <span className="font-mono">{startStr}</span>
            <span className="text-amber/60">→</span>
            <span className="font-mono">{endStr}</span>
            <span className="w-1 h-1 rounded-full bg-amber/60" />
            <span className="text-amber font-semibold">{duration} 天</span>
          </div>
        </div>
      </div>

      {showDelete && (
        <ConfirmDialog
          title="删除旅行"
          message={`确定要删除「${trip.title}」吗？所有照片也会被一并删除。`}
          confirmLabel="确认删除"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}
    </>
  )
}
