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
        <div className="absolute top-6 left-5 right-5 flex justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 glass-nav rounded-full flex items-center justify-center hover:bg-white/10 transition-colors active:scale-90"
          >
            <ArrowLeft className="w-5 h-5 text-dusk-50" />
          </button>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="w-11 h-11 glass-nav rounded-full flex items-center justify-center hover:bg-white/10 transition-colors active:scale-90"
              >
                <Pencil className="w-4 h-4 text-dusk-100" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDelete(true)}
                className="w-11 h-11 glass-nav rounded-full flex items-center justify-center hover:bg-red-500/30 transition-colors active:scale-90"
              >
                <Trash2 className="w-4 h-4 text-dusk-100" />
              </button>
            )}
          </div>
        </div>

        <div className="relative flex flex-col items-center px-8 pt-12 text-center">
          {trip.cover_photo ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-dusk-300/30 shadow-lg mb-5">
              <img src={trip.cover_photo} alt={trip.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber/20 to-caramel/20 border border-amber/30 flex items-center justify-center mb-5">
              <span className="font-serif font-bold text-2xl text-amber tracking-wider">
                {trip.title.slice(0, 1)}
              </span>
            </div>
          )}

          <h1 className="font-serif text-3xl font-bold text-dusk-50 mb-4 tracking-[0.1em]">
            {trip.title}
          </h1>

          <div className="flex items-center gap-2.5 text-xs text-dusk-100/60 glass-nav px-4 py-2 rounded-full tracking-wide">
            <Calendar className="w-3.5 h-3.5 text-amber" />
            <span className="font-mono">{startStr}</span>
            <span className="text-amber/50">—</span>
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
