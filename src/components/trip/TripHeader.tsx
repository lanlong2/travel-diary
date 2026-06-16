import { useState } from 'react'
import { ArrowLeft, Calendar, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Trip } from '../../types'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface TripHeaderProps {
  trip: Trip
  onDelete?: () => Promise<void>
}

export function TripHeader({ trip, onDelete }: TripHeaderProps) {
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
      <div className="relative pt-5 pb-12 overflow-hidden">
        {/* 背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-warm-100/60 via-warm-50/40 to-cream" />
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-warm-200/20 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-5 left-10 w-3 h-3 rounded-full bg-warm-400/30" />
        <div className="absolute bottom-10 left-20 w-2 h-2 rounded-full bg-warm-300/40" />

        {/* 返回和删除按钮 */}
        <div className="absolute top-6 left-5 right-5 flex justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-warm-200/50 hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-warm-600" />
          </button>
          {onDelete && (
            <button
              onClick={() => setShowDelete(true)}
              className="w-11 h-11 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-warm-200/50 hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-warm-400 hover:text-red-400" />
            </button>
          )}
        </div>

        {/* 内容 */}
        <div className="relative flex flex-col items-center px-8 pt-8">
          <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-24 h-7 bg-warm-400/25 rotate-2 rounded-sm blur-[0.5px]" />

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-warm-100 to-warm-200 border-2 border-warm-300/50 flex items-center justify-center text-3xl shadow-sm mb-5 rotate-3">
            🗺️
          </div>

          <h1 className="text-3xl font-bold text-warm-900 mb-3 tracking-wide">{trip.title}</h1>

          <div className="flex items-center gap-2 text-sm text-wood/60 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-warm-200/40">
            <Calendar className="w-4 h-4" />
            <span>{startStr} — {endStr}</span>
            <span className="text-warm-300">|</span>
            <span>{duration} 天</span>
          </div>

          <p className="text-xs text-warm-400/70 mt-2.5">{trip.created_by} 的旅行</p>
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
