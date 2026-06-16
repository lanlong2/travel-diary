import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { Photo } from '../../types'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface PhotoModalProps {
  photo: Photo
  onClose: () => void
  onDelete?: (id: string) => Promise<void>
}

export function PhotoModal({ photo, onClose, onDelete }: PhotoModalProps) {
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const dateStr = new Date(photo.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    await onDelete(photo.id)
    setDeleting(false)
    setShowDelete(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/98 flex flex-col animate-scale-in" onClick={onClose}>
        {/* 顶部按钮 */}
        <div className="absolute top-5 left-5 right-5 flex justify-between z-20">
          <button
            onClick={onClose}
            className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          {onDelete && (
            <button
              onClick={() => setShowDelete(true)}
              className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/90 hover:bg-red-500/60 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 照片 */}
        <div className="flex-1 flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
          <img
            src={photo.image_url}
            alt={photo.note || photo.city_name}
            className="max-w-full max-h-full object-contain rounded-sm"
          />
        </div>

        {/* 底部信息卡片 */}
        <div
          className="bg-cream/95 backdrop-blur-xl rounded-t-3xl px-6 pt-6 pb-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-1.5 rounded-full bg-warm-300/50 mx-auto mb-5" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 bg-warm-100 rounded-xl text-warm-600 font-medium">
                📍 {photo.city_name}
              </span>
            </div>
            <span className="text-xs text-warm-400">{dateStr}</span>
          </div>

          {photo.note ? (
            <p className="text-warm-700 text-lg leading-relaxed italic px-1">
              「{photo.note}」
            </p>
          ) : (
            <p className="text-warm-300/60 text-base italic">没有留言</p>
          )}

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-warm-200/50">
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
              photo.author === '我'
                ? 'bg-blue-50 text-blue-500'
                : 'bg-pink-50 text-pink-500'
            }`}>
              {photo.author === '我' ? '💙 我' : '💗 她'}
            </span>
            <span className="text-xs text-warm-300">的记录</span>
          </div>
        </div>
      </div>

      {showDelete && (
        <ConfirmDialog
          title="删除照片"
          message={photo.note
            ? `确定要删除「${photo.note}」这张照片吗？`
            : '确定要删除这张照片吗？'
          }
          confirmLabel="确认删除"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}
    </>
  )
}
