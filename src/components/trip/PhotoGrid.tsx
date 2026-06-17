import { useState } from 'react'
import type { Photo } from '../../types'
import { Camera, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
  onDeletePhoto?: (id: string) => Promise<void>
}

export function PhotoGrid({ photos, onPhotoClick, onDeletePhoto }: PhotoGridProps) {
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget || !onDeletePhoto) return
    setDeleting(true)
    await onDeletePhoto(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  if (photos.length === 0) {
    return (
      <div className="mx-6 py-20 text-center animate-fade-in-up">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-warm-100 flex items-center justify-center">
          <Camera className="w-10 h-10 text-warm-300" />
        </div>
        <p className="text-base text-warm-400 font-medium">还没有记录</p>
        <p className="text-sm text-warm-300 mt-2">记录属于我们的每一刻</p>
      </div>
    )
  }

  return (
    <>
      <div className="mx-6">
        <div className="flex items-center gap-2 mb-5">
          <h3 className="text-base font-bold text-warm-700">📸 回忆碎片</h3>
          <span className="text-xs text-warm-400 bg-warm-100 px-2.5 py-1 rounded-full font-medium">
            {photos.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo, i) => {
              // 纯文字卡片分支
              if (photo.entry_type === 'note' || !photo.image_url) {
                return (
                  <div
                    key={photo.id}
                    className="animate-fade-in-up relative rounded-2xl overflow-hidden"
                    style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
                  >
                    <div
                      className="bg-[#fff9f0] border border-warm-200/60 rounded-2xl p-4 shadow-sm cursor-pointer active:scale-[0.98] transition-transform duration-150 h-full"
                      onClick={() => onPhotoClick(photo)}
                      style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(180,150,120,0.06) 27px, rgba(180,150,120,0.06) 28px)',
                        backgroundPosition: '0 8px',
                      }}
                    >
                      <p className="text-sm text-warm-700 leading-relaxed whitespace-pre-wrap line-clamp-8">
                        {photo.note}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-200/40">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          photo.author === '我' ? 'bg-blue-50 text-blue-400' : 'bg-pink-50 text-pink-400'
                        }`}>
                          {photo.author === '我' ? '💙' : '💗'}
                        </span>
                      </div>
                    </div>
                    {/* 删除按钮 — 移动端常显 */}
                    {onDeletePhoto && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(photo) }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 sm:opacity-0 sm:hover:opacity-100 max-sm:opacity-100 hover:bg-red-500/80"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                )
              }

              return (
            <div
              key={photo.id}
              className="polaroid cursor-pointer group animate-fade-in-up relative"
              style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
            >
              {/* 照片主体 */}
              <div
                className="aspect-[3/4] rounded-sm overflow-hidden bg-warm-100 mb-2.5 relative"
                onClick={() => onPhotoClick(photo)}
              >
                <img
                  src={photo.image_url}
                  alt={photo.note || photo.city_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* 删除按钮 — 移动端常显 */}
                {onDeletePhoto && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(photo) }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 max-sm:opacity-100 hover:bg-red-500/80"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>

              {/* 底部信息 */}
              {photo.note ? (
                <p className="text-xs text-wood/70 text-center leading-relaxed line-clamp-2 font-medium italic px-1">
                  {photo.note}
                </p>
              ) : (
                <p className="text-xs text-warm-300/60 text-center italic">
                  {photo.city_name}
                </p>
              )}

              {/* 作者标记 */}
              <div className="flex justify-center mt-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  photo.author === '我' ? 'bg-blue-50 text-blue-400' : 'bg-pink-50 text-pink-400'
                }`}>
                  {photo.author === '我' ? '💙' : '💗'}
                </span>
              </div>
            </div>
          )})}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="删除照片"
          message={deleteTarget.note
            ? `确定要删除「${deleteTarget.note}」这张照片吗？`
            : '确定要删除这张照片吗？'
          }
          confirmLabel="确认删除"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  )
}
