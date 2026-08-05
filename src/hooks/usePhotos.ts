import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Author, Photo, PhotoUpdate } from '../types'
import { isStoragePath, removeStoragePaths, PHOTO_BUCKET, signStoragePaths } from '../lib/storage'
import { useAsyncData } from './useAsyncData'

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024
const FILE_EXTENSIONS: Record<string, string> = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

async function resolvePhotoUrls(rows: Photo[]): Promise<Photo[]> {
  const storagePaths = rows
    .map((photo) => photo.image_url)
    .filter(isStoragePath)
  const signedUrls = await signStoragePaths(storagePaths)

  return rows.map((photo) => {
    const storagePath = isStoragePath(photo.image_url) ? photo.image_url : null
    return {
      ...photo,
      storage_path: storagePath,
      image_url: storagePath
        ? signedUrls.get(storagePath) ?? null
        : photo.image_url,
    }
  })
}

export function usePhotos(tripId?: string) {
  const fetchPhotos = useCallback(async (): Promise<Photo[]> => {
    let query = supabase.from('photos').select('*').order('created_at', { ascending: false })
    if (tripId) {
      query = query.eq('trip_id', tripId)
    }

    const { data, error: queryError } = await query
    if (queryError) throw queryError

    return resolvePhotoUrls((data || []) as Photo[])
  }, [tripId])

  const { data: photos, loading, error, refresh } = useAsyncData(fetchPhotos, [])

  const uploadPhoto = async (
    file: File | null, tripId: string, cityName: string,
    note: string,
    author: Author = '我',
    entryType: 'photo' | 'note' = 'photo',
    recordDate?: string
  ) => {
    let storagePath: string | null = null
    const uploadFile = entryType === 'photo' ? file : null
    const normalizedCityName = cityName.trim()

    if (!tripId) {
      throw new Error('请选择一段旅行')
    }
    if (!normalizedCityName) {
      throw new Error('城市不能为空')
    }
    if (entryType === 'photo' && !uploadFile) {
      throw new Error('请选择一张照片')
    }

    if (uploadFile) {
      if (!uploadFile.type.startsWith('image/')) {
        throw new Error('请选择图片文件')
      }
      if (uploadFile.size > MAX_UPLOAD_BYTES) {
        throw new Error('图片不能超过 15 MB')
      }

      const randomId = globalThis.crypto?.randomUUID?.()
        ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const extension = FILE_EXTENSIONS[uploadFile.type.toLowerCase()] || 'jpg'
      storagePath = `trips/${tripId}/${randomId}.${extension}`
      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(storagePath, uploadFile, {
          cacheControl: '31536000',
          contentType: uploadFile.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error(uploadError.message)
      }
    }

    try {
      const { data, error } = await supabase
        .from('photos')
        .insert({
          trip_id: tripId,
          city_name: normalizedCityName,
          image_url: storagePath,
          note: note.trim(),
          author,
          entry_type: entryType,
          record_date: recordDate || null,
        })
        .select()
        .single()

      if (error) throw error
      await refresh()
      return data as Photo
    } catch (error) {
      if (storagePath) {
        try {
          await removeStoragePaths([storagePath])
        } catch (cleanupError) {
          console.warn('Failed to clean up an orphaned upload:', cleanupError)
        }
      }
      throw error
    }
  }

  const updatePhoto = async (id: string, updates: PhotoUpdate) => {
    const normalizedUpdates = {
      ...updates,
      note: updates.note === undefined ? undefined : updates.note.trim(),
      city_name: updates.city_name === undefined ? undefined : updates.city_name.trim(),
    }
    const { error } = await supabase.from('photos').update(normalizedUpdates).eq('id', id)
    if (error) throw error
    await refresh()
  }

  const deletePhoto = async (id: string) => {
    const target = photos.find((photo) => photo.id === id)
    let storagePath = target?.storage_path ?? null

    if (!storagePath) {
      const { data: photoRow, error: lookupError } = await supabase
        .from('photos')
        .select('image_url')
        .eq('id', id)
        .maybeSingle()
      if (lookupError) throw lookupError
      if (photoRow && isStoragePath(photoRow.image_url)) {
        storagePath = photoRow.image_url
      }
    }

    const { error } = await supabase.from('photos').delete().eq('id', id)
    if (error) throw error

    if (storagePath) {
      try {
        await removeStoragePaths([storagePath])
      } catch (cleanupError) {
        // The database row is already gone; keep the UI successful and let a
        // later cleanup job remove an unreachable object if Storage is flaky.
        console.warn('Failed to remove the photo object:', cleanupError)
      }
    }
    await refresh()
  }

  return { photos, loading, error, uploadPhoto, updatePhoto, deletePhoto, refresh }
}
