import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Photo } from '../types'

export function usePhotos(tripId?: string) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPhotos = useCallback(async () => {
    try {
      let query = supabase.from('photos').select('*').order('created_at', { ascending: false })
      if (tripId) {
        query = query.eq('trip_id', tripId)
      }
      const { data, error: queryError } = await query
      if (queryError) {
        setError(queryError.message || '照片加载失败')
      } else {
        setPhotos(data || [])
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '照片加载失败')
    }
    setLoading(false)
  }, [tripId])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  const uploadPhoto = async (
    file: File | null, tripId: string, cityName: string,
    note: string, author: '我' | '她',
    entryType: 'photo' | 'note' = 'photo',
    recordDate?: string
  ) => {
    let imageUrl: string | null = null

    if (file) {
      // 提取扩展名
      const ext = file.name.split('.').pop() || 'jpg'
      // 用 timestamp + 随机数 做文件名，避免中文/特殊字符问题
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(safeName, file)

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error(uploadError.message)
      }

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(safeName)

      if (!urlData?.publicUrl) throw new Error('获取公开 URL 失败')
      imageUrl = urlData.publicUrl
    }

    const { data, error } = await supabase
      .from('photos')
      .insert({
        trip_id: tripId,
        city_name: cityName,
        image_url: imageUrl,
        note,
        author,
        entry_type: entryType,
        record_date: recordDate || null,
      })
      .select()
      .single()

    if (error) throw error
    await fetchPhotos()
    return data
  }

  const updatePhoto = async (id: string, updates: { note?: string; city_name?: string; record_date?: string | null; author?: '我' | '她' }) => {
    const { error } = await supabase.from('photos').update(updates).eq('id', id)
    if (error) throw error
    await fetchPhotos()
  }

  const deletePhoto = async (id: string) => {
    const { error } = await supabase.from('photos').delete().eq('id', id)
    if (error) throw error
    await fetchPhotos()
  }

  return { photos, loading, error, uploadPhoto, updatePhoto, deletePhoto, refresh: fetchPhotos }
}
