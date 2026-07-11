import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Trip, TripCity } from '../types'

export function useTrips() {
  const [trips, setTrips] = useState<(Trip & { cities: TripCity[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrips = useCallback(async () => {
    try {
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .order('start_date', { ascending: false })

      if (tripsError) {
        setError(tripsError.message || '查询失败')
        setLoading(false)
        return
      }

      // 一次查询拿所有 trip 的城市，避免 N+1
      const tripIds = (tripsData || []).map((t) => t.id)
      const { data: allCities } = tripIds.length > 0
        ? await supabase
            .from('trip_cities')
            .select('*')
            .in('trip_id', tripIds)
            .order('sort_order', { ascending: true })
        : { data: [] }

      const citiesByTripId = new Map<string, TripCity[]>()
      ;(allCities || []).forEach((c) => {
        const arr = citiesByTripId.get(c.trip_id)
        if (arr) arr.push(c)
        else citiesByTripId.set(c.trip_id, [c])
      })

      const tripsWithCities = (tripsData || []).map((trip) => ({
        ...trip,
        cities: citiesByTripId.get(trip.id) || [],
      }))

      setTrips(tripsWithCities)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTrips() }, [fetchTrips])

  const createTrip = async (
    trip: Omit<Trip, 'id' | 'created_at'>,
    cities: Omit<TripCity, 'id' | 'trip_id'>[]
  ) => {
    const { data: newTrip, error: createError } = await supabase
      .from('trips')
      .insert(trip)
      .select()
      .single()

    if (createError) throw createError

    if (cities.length > 0) {
      const { error: citiesError } = await supabase
        .from('trip_cities')
        .insert(cities.map((c, i) => ({ ...c, trip_id: newTrip.id, sort_order: i })))

      if (citiesError) throw citiesError
    }

    await fetchTrips()
    return newTrip
  }

  const deleteTrip = async (id: string) => {
    const { error: delError } = await supabase.from('trips').delete().eq('id', id)
    if (delError) throw delError
    await fetchTrips()
  }

  const updateTrip = async (id: string, updates: { title?: string; start_date?: string; end_date?: string; cover_photo?: string | null }) => {
    const { error } = await supabase.from('trips').update(updates).eq('id', id)
    if (error) throw error
    await fetchTrips()
  }

  const addCity = async (tripId: string, city: { city_name: string; lat: number; lng: number; sort_order: number }) => {
    const { error } = await supabase
      .from('trip_cities')
      .insert({ ...city, trip_id: tripId })
    if (error) throw error
    await fetchTrips()
  }

  const removeCity = async (cityId: string) => {
    const { error } = await supabase
      .from('trip_cities')
      .delete()
      .eq('id', cityId)
    if (error) throw error
    await fetchTrips()
  }

  return { trips, loading, error, createTrip, updateTrip, deleteTrip, addCity, removeCity, refresh: fetchTrips }
}

export function useTrip(id: string) {
  const [trip, setTrip] = useState<(Trip & { cities: TripCity[] }) | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTrip = useCallback(async () => {
    if (!id) return
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single()

    if (error) { setLoading(false); return }

    const { data: cities } = await supabase
      .from('trip_cities')
      .select('*')
      .eq('trip_id', id)
      .order('sort_order', { ascending: true })

    setTrip({ ...data, cities: cities || [] })
    setLoading(false)
  }, [id])

  useEffect(() => { fetchTrip() }, [fetchTrip])

  return { trip, loading, refresh: fetchTrip }
}
