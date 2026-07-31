import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, MapPin, Pencil, Trash2, X } from 'lucide-react'
import type { Photo } from '../../types'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useDialogAccessibility } from '../ui/Modal'

interface PhotoModalProps {
  photo: Photo
  onClose: () => void
  onDelete?: (id: string) => Promise<void>
  onUpdate?: (id: string, updates: { note?: string; city_name?: string; record_date?: string | null }) => Promise<void>
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '操作失败，请稍后重试'
}

function formatPhotoDate(photo: Photo) {
  const value = photo.record_date || photo.created_at
  const date = new Date(photo.record_date ? `${value}T00:00:00` : value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function PhotoModal({ photo, onClose, onDelete, onUpdate }: PhotoModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editNote, setEditNote] = useState(photo.note || '')
  const [editCity, setEditCity] = useState(photo.city_name || '')
  const [editDate, setEditDate] = useState(photo.record_date || '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const dateStr = formatPhotoDate(photo)

  useEffect(() => {
    setEditNote(photo.note || '')
    setEditCity(photo.city_name || '')
    setEditDate(photo.record_date || '')
    setSaveError(null)
    setImageError(false)
  }, [photo.id, photo.note, photo.city_name, photo.record_date, photo.image_url])

  const handleEscape = () => {
    if (editing) setEditing(false)
    else onClose()
  }

  useDialogAccessibility({
    isOpen: true,
    onClose: handleEscape,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
    closeOnEscape: !showDelete,
  })

  const handleDelete = async () => {
    if (!onDelete) return

    setDeleting(true)
    setDeleteError(null)
    try {
      await onDelete(photo.id)
      setShowDelete(false)
      onClose()
    } catch (err) {
      setDeleteError(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!onUpdate) return

    const cityName = editCity.trim()
    if (!cityName) {
      setSaveError('城市不能为空')
      return
    }

    setSaving(true)
    setSaveError(null)
    try {
      await onUpdate(photo.id, {
        note: editNote.trim(),
        city_name: cityName,
        record_date: editDate || null,
      })
      setEditing(false)
    } catch (err) {
      setSaveError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`查看${photo.city_name}的旅行记录`}
        tabIndex={-1}
        className="photo-modal fixed inset-0 z-50 flex min-h-dvh flex-col overflow-hidden overscroll-none bg-black/95 text-dusk-50 animate-scale-in"
        style={{ animationDuration: '0.25s' }}
        onClick={onClose}
      >
        <div
          className="photo-modal__media min-h-0 flex-1 flex items-center justify-center p-4 sm:p-8"
          aria-label="照片预览"
        >
          {photo.image_url && !imageError ? (
            <img
              src={photo.image_url}
              alt={photo.note || photo.city_name}
              className="max-h-full max-w-full rounded-[4px] object-contain animate-reveal-scale"
              style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px oklch(96% 0.02 70 / 0.06)' }}
              onClick={(event) => event.stopPropagation()}
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="glass-popup max-w-md w-full p-8"
              role="img"
              aria-label={photo.image_url ? `${photo.city_name}的照片暂时无法显示` : '文字记录'}
              onClick={(event) => event.stopPropagation()}
            >
              <p className="whitespace-pre-wrap font-serif text-xl italic leading-relaxed text-dusk-50">
                {photo.image_url ? '照片暂时无法显示' : photo.note}
              </p>
            </div>
          )}
        </div>

        <div
          className="photo-modal__panel relative min-h-0 max-h-[58dvh] overflow-y-auto overscroll-contain rounded-b-none glass-popup px-5 pt-4 pb-[max(24px,env(safe-area-inset-bottom))] sm:px-6"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent" />

          <div className="mb-5 flex items-center justify-between">
            <div className="flex flex-1 justify-center">
              <div className="h-1.5 w-12 rounded-full bg-dusk-300/40" aria-hidden="true" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              {onUpdate && !editing && (
                <button
                  type="button"
                  onClick={() => {
                    setSaveError(null)
                    setEditing(true)
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-dusk-100 transition-all duration-200 hover:bg-white/15 active:scale-90"
                  aria-label="编辑"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              {onDelete && !editing && (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null)
                    setShowDelete(true)
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-dusk-100 transition-all duration-200 hover:bg-red-500/40 active:scale-90"
                  aria-label="删除"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-dusk-100 transition-all duration-200 hover:bg-white/15 active:scale-90"
                aria-label="关闭"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="photo-edit-note" className="mb-1.5 flex items-center gap-2 text-[11px] tracking-[0.04em] text-dusk-100/65">
                  <span className="h-1 w-1 rounded-full bg-amber/60" />
                  留言
                </label>
                <textarea
                  id="photo-edit-note"
                  value={editNote}
                  onChange={(event) => setEditNote(event.target.value)}
                  className="w-full resize-none rounded-[12px] border border-dusk-300/30 bg-dusk-600/40 px-4 py-3 text-[15px] text-dusk-50 placeholder:text-dusk-100/25 focus:border-amber/60 focus:outline-none focus:ring-[1px] focus:ring-amber/30"
                  rows={3}
                  placeholder="写点什么"
                />
              </div>
              <div>
                <label htmlFor="photo-edit-city" className="mb-1.5 flex items-center gap-2 text-[11px] tracking-[0.04em] text-dusk-100/65">
                  <span className="h-1 w-1 rounded-full bg-amber/60" />
                  城市
                </label>
                <input
                  id="photo-edit-city"
                  value={editCity}
                  onChange={(event) => setEditCity(event.target.value)}
                  className="w-full rounded-[12px] border border-dusk-300/30 bg-dusk-600/40 px-4 py-2.5 text-[15px] text-dusk-50 placeholder:text-dusk-100/25 focus:border-amber/60 focus:outline-none focus:ring-[1px] focus:ring-amber/30"
                  placeholder="城市名称"
                />
              </div>
              <div>
                <label htmlFor="photo-edit-date" className="mb-1.5 flex items-center gap-2 text-[11px] tracking-[0.04em] text-dusk-100/65">
                  <span className="h-1 w-1 rounded-full bg-amber/60" />
                  日期
                </label>
                <input
                  id="photo-edit-date"
                  type="date"
                  value={editDate}
                  onChange={(event) => setEditDate(event.target.value)}
                  className="w-full rounded-[12px] border border-dusk-300/30 bg-dusk-600/40 px-4 py-2.5 font-mono text-[15px] text-dusk-50 focus:border-amber/60 focus:outline-none focus:ring-[1px] focus:ring-amber/30"
                />
              </div>
              {saveError && (
                <p className="text-[12px] leading-5 text-red-300" role="alert">
                  {saveError}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSaveError(null)
                    setEditing(false)
                  }}
                  className="flex-1 rounded-[12px] border border-dusk-300/30 py-2.5 font-medium text-dusk-100/70 transition-colors hover:bg-white/8 active:scale-[0.98]"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  aria-busy={saving}
                  className="flex-1 rounded-[12px] bg-gradient-to-br from-amber via-amber to-amber-ember py-2.5 font-medium text-white transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50 edge-glow-amber"
                >
                  {saving ? '保存中' : '保存'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 rounded-[10px] border border-amber/25 bg-amber/15 px-3 py-1 text-[11px] font-medium tracking-[0.04em] text-amber">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {photo.city_name}
                </span>
                <span className="flex items-center gap-1.5 text-right font-mono text-[11px] tracking-[0.04em] text-dusk-100/55">
                  <Calendar className="h-3 w-3 text-amber/60" aria-hidden="true" />
                  {dateStr}
                </span>
              </div>

              {photo.note ? (
                <div className="relative border-l-2 border-amber/50 pl-3">
                  <span className="absolute -left-1 -top-1 font-serif text-xl text-amber/65" aria-hidden="true">&quot;</span>
                  <p className="font-serif text-[15px] italic leading-relaxed text-dusk-50">
                    {photo.note}
                  </p>
                </div>
              ) : (
                <p className="text-[13px] italic text-dusk-100/45">没有留言</p>
              )}
            </>
          )}
        </div>
      </div>

      {showDelete && (
        <ConfirmDialog
          title="删除照片"
          message={deleteError
            ? `删除失败：${deleteError}`
            : photo.note
              ? `确定要删除「${photo.note}」这张照片吗？`
              : '确定要删除这张照片吗？'
          }
          confirmLabel={deleteError ? '重试删除' : '确认删除'}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDelete(false)
            setDeleteError(null)
          }}
          loading={deleting}
        />
      )}
    </>,
    document.body,
  )
}
