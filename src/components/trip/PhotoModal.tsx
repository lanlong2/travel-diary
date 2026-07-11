import { useState, useEffect } from 'react'
import { X, Trash2, Pencil, MapPin } from 'lucide-react'
import type { Photo } from '../../types'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface PhotoModalProps {
  photo: Photo
  onClose: () => void
  onDelete?: (id: string) => Promise<void>
  onUpdate?: (id: string, updates: { note?: string; city_name?: string; record_date?: string | null }) => Promise<void>
}

export function PhotoModal({ photo, onClose, onDelete, onUpdate }: PhotoModalProps) {
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editNote, setEditNote] = useState(photo.note || '')
  const [editCity, setEditCity] = useState(photo.city_name || '')
  const [editDate, setEditDate] = useState(photo.record_date || '')
  const [saving, setSaving] = useState(false)
  const dateStr = new Date(photo.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDelete) {
        if (editing) setEditing(false)
        else onClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose, editing, showDelete])

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
    })
    setSaving(false)
    setEditing(false)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-scale-in" onClick={onClose}>
        <div className="flex-1 flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
          {photo.image_url ? (
            <img
              src={photo.image_url}
              alt={photo.note || photo.city_name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : (
            <div className="glass-popup max-w-md w-full p-8">
              <p className="text-xl text-dusk-50 leading-relaxed whitespace-pre-wrap font-serif">
                {photo.note}
              </p>
            </div>
          )}
        </div>

        <div
          className="glass-popup rounded-b-none px-6 pt-5 pb-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-dusk-300/40" />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {onUpdate && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="w-9 h-9 bg-white/8 rounded-full flex items-center justify-center text-dusk-100 hover:bg-white/15 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {onDelete && !editing && (
                <button
                  onClick={() => setShowDelete(true)}
                  className="w-9 h-9 bg-white/8 rounded-full flex items-center justify-center text-dusk-100 hover:bg-red-500/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 bg-white/8 rounded-full flex items-center justify-center text-dusk-100 hover:bg-white/15 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-dusk-100/60 mb-1.5 block tracking-wide">留言</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-4 py-3 bg-dusk-600/40 border border-dusk-300/30 rounded-xl text-dusk-50 placeholder:text-dusk-100/35 focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/60 resize-none"
                  rows={3}
                  placeholder="写点什么"
                />
              </div>
              <div>
                <label className="text-xs text-dusk-100/60 mb-1.5 block tracking-wide">城市</label>
                <input
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dusk-600/40 border border-dusk-300/30 rounded-xl text-dusk-50 placeholder:text-dusk-100/35 focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/60"
                  placeholder="城市名称"
                />
              </div>
              <div>
                <label className="text-xs text-dusk-100/60 mb-1.5 block tracking-wide">日期</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dusk-600/40 border border-dusk-300/30 rounded-xl text-dusk-50 focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/60"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-dusk-300/30 text-dusk-100/70 font-medium hover:bg-white/8 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-amber to-caramel-700 text-white font-medium hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {saving ? '保存中' : '保存'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 bg-amber/15 rounded-xl text-amber font-medium flex items-center gap-1 tracking-wide">
                    <MapPin className="w-3 h-3" />
                    {photo.city_name}
                  </span>
                </div>
                <span className="text-xs text-dusk-100/50 font-mono">{dateStr}</span>
              </div>

              {photo.note ? (
                <div className="pl-3 border-l-2 border-amber/40">
                  <p className="text-dusk-50 text-base leading-relaxed italic font-serif">
                    {photo.note}
                  </p>
                </div>
              ) : (
                <p className="text-dusk-100/40 text-sm italic">没有留言</p>
              )}
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
