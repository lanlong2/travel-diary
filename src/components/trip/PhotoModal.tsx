import { useState } from 'react'
import { X, Trash2, Pencil } from 'lucide-react'
import type { Photo } from '../../types'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface PhotoModalProps {
  photo: Photo
  onClose: () => void
  onDelete?: (id: string) => Promise<void>
  onUpdate?: (id: string, updates: { note?: string; city_name?: string; record_date?: string | null; author?: '我' | '她' }) => Promise<void>
}

export function PhotoModal({ photo, onClose, onDelete, onUpdate }: PhotoModalProps) {
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editNote, setEditNote] = useState(photo.note || '')
  const [editCity, setEditCity] = useState(photo.city_name || '')
  const [editDate, setEditDate] = useState(photo.record_date || '')
  const [editAuthor, setEditAuthor] = useState<'我' | '她'>(photo.author || '我')
  const [saving, setSaving] = useState(false)
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

  const handleSave = async () => {
    if (!onUpdate) return
    setSaving(true)
    await onUpdate(photo.id, {
      note: editNote || undefined,
      city_name: editCity || undefined,
      record_date: editDate || null,
      author: editAuthor,
    })
    setSaving(false)
    setEditing(false)
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
          <div className="flex items-center gap-2">
            {onUpdate && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors"
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
            {onDelete && !editing && (
              <button
                onClick={() => setShowDelete(true)}
                className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/90 hover:bg-red-500/60 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 照片 / 文字卡片 */}
        <div className="flex-1 flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
          {photo.image_url ? (
            <img
              src={photo.image_url}
              alt={photo.note || photo.city_name}
              className="max-w-full max-h-full object-contain rounded-sm"
            />
          ) : (
            <div
              className="max-w-md w-full bg-[#fff9f0] border border-warm-300/40 rounded-2xl p-8 shadow-lg"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(180,150,120,0.08) 31px, rgba(180,150,120,0.08) 32px)',
                backgroundPosition: '0 10px',
              }}
            >
              <p className="text-xl text-warm-800 leading-relaxed whitespace-pre-wrap" style={{ lineHeight: '32px' }}>
                {photo.note}
              </p>
            </div>
          )}
        </div>

        {/* 底部信息卡片 */}
        <div
          className="bg-cream/95 backdrop-blur-xl rounded-t-3xl px-6 pt-6 pb-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-1.5 rounded-full bg-warm-300/50 mx-auto mb-5" />

          {editing ? (
            /* 编辑模式 */
            <div className="space-y-4">
              <div>
                <label className="text-xs text-warm-500 mb-1 block">留言</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-warm-200 rounded-xl text-warm-800 placeholder-warm-300 focus:outline-none focus:ring-2 focus:ring-warm-400 resize-none"
                  rows={3}
                  placeholder="写点什么..."
                />
              </div>
              <div>
                <label className="text-xs text-warm-500 mb-1 block">城市</label>
                <input
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-warm-200 rounded-xl text-warm-800 placeholder-warm-300 focus:outline-none focus:ring-2 focus:ring-warm-400"
                  placeholder="城市名称"
                />
              </div>
              <div>
                <label className="text-xs text-warm-500 mb-1 block">日期</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-warm-200 rounded-xl text-warm-800 focus:outline-none focus:ring-2 focus:ring-warm-400"
                />
              </div>
              <div>
                <label className="text-xs text-warm-500 mb-1 block">作者</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditAuthor('我')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      editAuthor === '我'
                        ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-400'
                        : 'bg-white border border-warm-200 text-warm-500'
                    }`}
                  >
                    💙 我
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditAuthor('她')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      editAuthor === '她'
                        ? 'bg-pink-100 text-pink-600 ring-2 ring-pink-400'
                        : 'bg-white border border-warm-200 text-warm-500'
                    }`}
                  >
                    💗 她
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-warm-200 text-warm-600 font-medium hover:bg-warm-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-warm-500 text-white font-medium hover:bg-warm-600 transition-colors disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          ) : (
            /* 查看模式 */
            <>
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
            </>
          )}
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
