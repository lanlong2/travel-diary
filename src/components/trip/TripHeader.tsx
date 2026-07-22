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
            className="w-11 h-11 glass-nav rounded-full flex items-center justify-center hover:bg-white/10 transition-colors active:brightness-95"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5 text-dusk-50" />
          </button>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="w-11 h-11 glass-nav rounded-full flex items-center justify-center hover:bg-white/10 transition-colors active:brightness-95"
                aria-label="编辑"
              >
                <Pencil className="w-4 h-4 text-dusk-100" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDelete(true)}
                className="w-11 h-11 glass-nav rounded-full flex items-center justify-center hover:bg-red-500/30 transition-colors active:brightness-95"
                aria-label="删除"
              >
                <Trash2 className="w-4 h-4 text-dusk-100" />
              </button>
            )}
          </div>
        </div>

        {trip.cover_photo ? (
          // 封面 hero — 全宽，无圆角，从屏幕边缘到边缘
          <div
            className="relative w-screen"
            style={{ marginLeft: 'calc(50% - 50vw)', height: '220px' }}
          >
            <img
              src={trip.cover_photo}
              alt={trip.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* 上 → 浅 → 深 蒙版渐变 */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, oklch(20% 0.03 40 / 0.6) 0%, oklch(20% 0.03 40 / 0.15) 50%, oklch(24% 0.03 45 / 0.95) 100%)',
              }}
            />
            {/* 暖色叠加 */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'rgba(196, 115, 90, 0.08)' }}
            />
          </div>
        ) : (
          <div className="w-full flex justify-center pt-12">
            {/* 无封面 — 首字母大卡片 120x120 */}
            <div className="w-[120px] h-[120px] rounded-[14px] bg-gradient-to-br from-amber/20 to-caramel/15 border border-amber/30 flex items-center justify-center mb-5">
              <span className="font-display italic font-bold text-3xl text-amber tracking-[0.02em]">
                {trip.title.slice(0, 1)}
              </span>
            </div>
          </div>
        )}

        {/* 标题 — 在封面下方 40px 处，与封面形成重叠 */}
        <div className={`relative px-7 text-center ${trip.cover_photo ? 'mt-10' : ''}`}>
          <h1 className="font-serif text-[31px] font-bold text-dusk-50 mb-4 tracking-[0.03em]">
            {trip.title}
          </h1>

          <div className="flex items-center justify-center gap-2.5 text-[11px] text-dusk-100/60 glass-nav px-4 py-2 rounded-full tracking-[0.02em]">
            <Calendar className="w-3.5 h-3.5 text-amber" />
            <span className="font-mono">{startStr}</span>
            <span className="text-amber/50">→</span>
            <span className="font-mono">{endStr}</span>
            <span className="w-1 h-1 rounded-full bg-amber/50" />
            <span>{duration} 天</span>
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
