import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Trip, TripCity, TripCreateInput, TripUpdate, TripWithCities } from '../types'
import { isValidDateRange } from '../lib/dates'
import { isStoragePath, removeStoragePaths, signStoragePaths } from '../lib/storage'
import { useAsyncData } from './useAsyncData'

async function resolveTripCovers(rows: Trip[]): Promise<Trip[]> {
  const coverPaths = rows
    .map((trip) => trip.cover_photo)
    .filter(isStoragePath)
  const signedUrls = await signStoragePaths(coverPaths)

  return rows.map((trip) => {
    const coverPath = isStoragePath(trip.cover_photo) ? trip.cover_photo : null
    return {
      ...trip,
      cover_photo_path: coverPath,
      cover_photo: coverPath
        ? signedUrls.get(coverPath) ?? null
        : trip.cover_photo,
    }
  })
}

export function useTrips() {
  const fetchTrips = useCallback(async (): Promise<TripWithCities[]> => {
    const { data: tripsData, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .order('start_date', { ascending: false })

    if (tripsError) throw tripsError

    // 一次查询拿所有 trip 的城市，避免 N+1
    const tripIds = (tripsData || []).map((trip) => trip.id)
    const { data: allCities, error: citiesError } = tripIds.length > 0
      ? await supabase
          .from('trip_cities')
          .select('*')
          .in('trip_id', tripIds)
          .order('sort_order', { ascending: true })
      : { data: [], error: null }

    if (citiesError) throw citiesError

    const hydratedTrips = await resolveTripCovers((tripsData || []) as Trip[])
    const citiesByTripId = new Map<string, TripCity[]>()
    for (const city of (allCities || []) as TripCity[]) {
      const cities = citiesByTripId.get(city.trip_id) || []
      cities.push(city)
      citiesByTripId.set(city.trip_id, cities)
    }

    return hydratedTrips.map((trip) => ({
      ...trip,
      cities: citiesByTripId.get(trip.id) || [],
    }))
  }, [])

  const { data: trips, loading, error, refresh } = useAsyncData(fetchTrips, [])

  const createTrip = async (
    trip: TripCreateInput,
    cities: Omit<TripCity, 'id' | 'trip_id'>[]
  ) => {
    if (!trip.title.trim()) throw new Error('旅行标题不能为空')
    if (!isValidDateRange(trip.start_date, trip.end_date)) {
      throw new Error('结束日期不能早于开始日期')
    }

    const { data: newTrip, error: createError } = await supabase
      .from('trips')
      .insert({ ...trip, title: trip.title.trim() })
      .select()
      .single()

    if (createError) throw createError
    if (!newTrip) throw new Error('旅行创建失败')

    try {
      if (cities.length > 0) {
        const { error: citiesError } = await supabase
          .from('trip_cities')
          .insert(cities.map((c, i) => ({ ...c, trip_id: newTrip.id, sort_order: i })))

        if (citiesError) throw citiesError
      }
    } catch (error) {
      // Avoid leaving an empty trip behind when the city insert fails.
      await supabase.from('trips').delete().eq('id', newTrip.id)
      throw error
    }

    await refresh()
    return newTrip as Trip
  }

  const deleteTrip = async (id: string) => {
    const [{ data: tripRow, error: tripLookupError }, { data: photoRows, error: photoLookupError }] = await Promise.all([
      supabase.from('trips').select('cover_photo').eq('id', id).single(),
      supabase.from('photos').select('image_url').eq('trip_id', id),
    ])

    if (tripLookupError) throw tripLookupError
    if (photoLookupError) throw photoLookupError

    const storagePaths = [
      (tripRow as { cover_photo: string | null } | null)?.cover_photo,
      ...(photoRows || []).map((photo) => photo.image_url),
    ].filter(isStoragePath)

    const { error: delError } = await supabase.from('trips').delete().eq('id', id)
    if (delError) throw delError

    try {
      await removeStoragePaths(storagePaths)
    } catch (cleanupError) {
      console.warn('Failed to remove trip photo objects:', cleanupError)
    }
    await refresh()
  }

  const updateTrip = async (id: string, updates: TripUpdate) => {
    if (updates.title !== undefined && !updates.title.trim()) {
      throw new Error('旅行标题不能为空')
    }

    if (updates.start_date !== undefined || updates.end_date !== undefined) {
      const { data: currentTrip, error: lookupError } = await supabase
        .from('trips')
        .select('start_date, end_date')
        .eq('id', id)
        .single()

      if (lookupError) throw lookupError
      if (!currentTrip) throw new Error('旅行不存在')

      const startDate = updates.start_date ?? currentTrip.start_date
      const endDate = updates.end_date ?? currentTrip.end_date
      if (!isValidDateRange(startDate, endDate)) {
        throw new Error('结束日期不能早于开始日期')
      }
    }

    const normalizedUpdates = updates.title === undefined
      ? updates
      : { ...updates, title: updates.title.trim() }
    const { error } = await supabase.from('trips').update(normalizedUpdates).eq('id', id)
    if (error) throw error
    await refresh()
  }

  const addCity = async (tripId: string, city: { city_name: string; lat: number; lng: number; sort_order: number }) => {
    const { error } = await supabase
      .from('trip_cities')
      .insert({ ...city, trip_id: tripId })
    if (error) throw error
    await refresh()
  }

  const removeCity = async (cityId: string) => {
    const { error } = await supabase
      .from('trip_cities')
      .delete()
      .eq('id', cityId)
    if (error) throw error
    await refresh()
  }

  return { trips, loading, error, createTrip, updateTrip, deleteTrip, addCity, removeCity, refresh }
}

export function useTrip(id: string) {
  const fetchTrip = useCallback(async (): Promise<TripWithCities | null> => {
    if (!id) return null

    const { data, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single()

    if (tripError) throw tripError
    if (!data) throw new Error('旅行不存在')

    const { data: cities, error: citiesError } = await supabase
      .from('trip_cities')
      .select('*')
      .eq('trip_id', id)
      .order('sort_order', { ascending: true })

    if (citiesError) throw citiesError
    const [hydratedTrip] = await resolveTripCovers([data as Trip])

    return { ...hydratedTrip, cities: (cities || []) as TripCity[] }
  }, [id])

  const { data: trip, loading, error, refresh } = useAsyncData(fetchTrip, null)

  return { trip, loading, error, refresh }
}
