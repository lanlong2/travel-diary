import { PHOTO_BUCKET } from '../lib/storage'
import { supabase } from '../lib/supabase'

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024
const FILE_EXTENSIONS: Record<string, string> = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function createRecordId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  )
}

export async function uploadRecordImage(
  file: File,
  tripId: string,
  recordId: string,
): Promise<string> {
  const mimeType = file.type.toLowerCase()
  if (!mimeType.startsWith('image/')) throw new Error('请选择图片文件')
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('图片不能超过 15 MB')

  const extension = FILE_EXTENSIONS[mimeType] ?? 'jpg'
  const path = `trips/${tripId}/${recordId}.${extension}`
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  })

  if (error) throw new Error(error.message)
  return path
}
