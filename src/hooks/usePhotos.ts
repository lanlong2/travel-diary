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
    entryType: 'photo' | 'note' = 'photo'
  ) => {
    let imageUrl: string | null = null

    if (file) {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.一-龥_-]/g, '_')}`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

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
      })
      .select()
      .single()

    if (error) throw error
    await fetchPhotos()
    return data
  }

  const deletePhoto = async (id: string) => {
    const { error } = await supabase.from('photos').delete().eq('id', id)
    if (error) throw error
    await fetchPhotos()
  }

  return { photos, loading, error, uploadPhoto, deletePhoto, refresh: fetchPhotos }
}
