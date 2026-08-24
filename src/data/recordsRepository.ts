import { supabase } from '../lib/supabase'
import { removeStoragePaths, toStoragePath } from '../lib/storage'
import type { Author, EntryType, HydratedPhoto, PhotoUpdate } from '../types'
import { requireRow } from './errors'
import { mapPhotoRow, mapPhotos } from './mappers'
import { createRecordId, uploadRecordImage } from './storageRepository'

export const PHOTO_COLUMNS =
  'id, trip_id, city_name, image_url, note, author, entry_type, record_date, created_at' as const

export interface CreateRecordInput {
  file: File | null
  tripId: string
  cityName: string
  lat: number
  lng: number
  note: string
  author: Author
  entryType: EntryType
  recordDate: string
}

export const recordsRepository = {
  async list(tripId?: string, signal?: AbortSignal): Promise<HydratedPhoto[]> {
    let query = supabase
      .from('photos')
      .select(PHOTO_COLUMNS)
      .order('record_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (tripId) query = query.eq('trip_id', tripId)
    if (signal) query = query.abortSignal(signal)

    const { data, error } = await query
    if (error) throw error
    return mapPhotos(data ?? [], signal)
  },

  async create(input: CreateRecordInput): Promise<HydratedPhoto> {
    const cityName = input.cityName.trim()
    if (!input.tripId) throw new Error('请选择一段旅行')
    if (!cityName) throw new Error('城市不能为空')
    if (!input.recordDate) throw new Error('请选择记录日期')
    if (!Number.isFinite(input.lat) || !Number.isFinite(input.lng)) {
      throw new Error('城市坐标无效')
    }
    if (input.entryType === 'photo' && !input.file) throw new Error('请选择一张照片')
    if (input.entryType === 'note' && !input.note.trim()) throw new Error('请填写记录内容')

    const id = createRecordId()
    let imagePath: string | null = null
    if (input.entryType === 'photo' && input.file) {
      imagePath = await uploadRecordImage(input.file, input.tripId, id)
    }

    try {
      const { data, error } = await supabase.rpc('create_record', {
        id,
        trip_id: input.tripId,
        city_name: cityName,
        lat: input.lat,
        lng: input.lng,
        image_path: imagePath ?? '',
        note: input.note.trim(),
        author: input.author,
        entry_type: input.entryType,
        record_date: input.recordDate,
      })
      if (error) throw error
      return mapPhotoRow(requireRow(data, '记录'))
    } catch (error) {
      if (imagePath) {
        try {
          await removeStoragePaths([imagePath])
        } catch (cleanupError) {
          console.warn('记录写入失败，且无法清理已上传图片:', cleanupError)
        }
      }
      throw error
    }
  },

  async update(id: string, updates: PhotoUpdate): Promise<HydratedPhoto> {
    const normalized = {
      ...updates,
      note: updates.note?.trim(),
      city_name: updates.city_name?.trim(),
    }
    if (normalized.city_name !== undefined && !normalized.city_name) {
      throw new Error('城市不能为空')
    }

    const { data, error } = await supabase
      .from('photos')
      .update(normalized)
      .eq('id', id)
      .select(PHOTO_COLUMNS)
      .maybeSingle()
    if (error) throw error
    return mapPhotoRow(requireRow(data, '记录'))
  },

  async delete(id: string): Promise<void> {
    const { data, error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id)
      .select('id, trip_id, image_url')
      .maybeSingle()
    if (error) throw error
    const deleted = requireRow(data, '记录')
    const imagePath = toStoragePath(deleted.image_url)

    if (deleted.image_url) {
      const { error: coverError } = await supabase
        .from('trips')
        .update({ cover_photo: null })
        .eq('id', deleted.trip_id)
        .eq('cover_photo', deleted.image_url)
      if (coverError) {
        console.warn('记录已删除，但无法清理旅行封面引用:', coverError)
        // The database row is already gone. Preserve the object so an existing
        // cover reference can never become a broken image.
        return
      }
    }

    if (imagePath) {
      try {
        await removeStoragePaths([imagePath])
      } catch (cleanupError) {
        console.warn('记录已删除，但照片对象清理失败:', cleanupError)
      }
    }
  },
}
