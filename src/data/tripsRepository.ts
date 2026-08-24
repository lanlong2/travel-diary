import { supabase } from '../lib/supabase'
import { removeStoragePaths, toStoragePath } from '../lib/storage'
import type {
  HydratedTrip,
  HydratedTripCity,
  HydratedTripWithCities,
  TripCityInput,
  TripCityRow,
  TripCreateInput,
  TripRow,
  TripUpdate,
} from '../types'
import { isValidDateRange } from '../lib/dates'
import { requireRow } from './errors'
import { mapTripCity, mapTripRow, mapTrips } from './mappers'

export const TRIP_COLUMNS =
  'id, title, cover_photo, start_date, end_date, created_by, created_at' as const
export const TRIP_CITY_COLUMNS = 'id, trip_id, city_name, lat, lng, sort_order' as const

export interface TripCityCreateInput {
  city_name: string
  lat: number
  lng: number
  sort_order: number
}

async function fetchTripRows(signal?: AbortSignal): Promise<TripRow[]> {
  let query = supabase.from('trips').select(TRIP_COLUMNS).order('start_date', { ascending: false })
  if (signal) query = query.abortSignal(signal)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

async function fetchCitiesForTrips(
  tripIds: string[],
  signal?: AbortSignal,
): Promise<TripCityRow[]> {
  if (tripIds.length === 0) return []
  let query = supabase
    .from('trip_cities')
    .select(TRIP_CITY_COLUMNS)
    .in('trip_id', tripIds)
    .order('sort_order', { ascending: true })
  if (signal) query = query.abortSignal(signal)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export const tripsRepository = {
  async list(signal?: AbortSignal): Promise<HydratedTripWithCities[]> {
    const rows = await fetchTripRows(signal)
    const cityRows = await fetchCitiesForTrips(
      rows.map((row) => row.id),
      signal,
    )
    const trips = await mapTrips(rows, signal)
    const citiesByTrip = new Map<string, HydratedTripCity[]>()

    for (const row of cityRows) {
      const cities = citiesByTrip.get(row.trip_id) ?? []
      cities.push(mapTripCity(row))
      citiesByTrip.set(row.trip_id, cities)
    }

    return trips.map((trip) => ({
      ...trip,
      cities: citiesByTrip.get(trip.id) ?? [],
    }))
  },

  async getById(id: string, signal?: AbortSignal): Promise<HydratedTripWithCities | null> {
    if (!id) return null
    let tripQuery = supabase.from('trips').select(TRIP_COLUMNS).eq('id', id)
    let cityQuery = supabase
      .from('trip_cities')
      .select(TRIP_CITY_COLUMNS)
      .eq('trip_id', id)
      .order('sort_order', { ascending: true })
    if (signal) {
      tripQuery = tripQuery.abortSignal(signal)
      cityQuery = cityQuery.abortSignal(signal)
    }

    const [{ data: row, error: tripError }, { data: cityRows, error: citiesError }] =
      await Promise.all([tripQuery.maybeSingle(), cityQuery])
    if (tripError) throw tripError
    if (citiesError) throw citiesError
    if (!row) return null

    const trip = await mapTripRow(row, signal)
    return { ...trip, cities: (cityRows ?? []).map(mapTripCity) }
  },

  async create(input: TripCreateInput, cities: TripCityCreateInput[]): Promise<HydratedTrip> {
    const title = input.title.trim()
    if (!title) throw new Error('旅行标题不能为空')
    if (!isValidDateRange(input.start_date, input.end_date)) {
      throw new Error('结束日期不能早于开始日期')
    }

    const { data, error } = await supabase.rpc('create_trip_with_cities', {
      title,
      cover_path: toStoragePath(input.cover_photo) ?? input.cover_photo ?? '',
      start_date: input.start_date,
      end_date: input.end_date,
      created_by: input.created_by,
      cities_json: cities.map((city, index) => ({
        city_name: city.city_name.trim(),
        lat: city.lat,
        lng: city.lng,
        sort_order: city.sort_order ?? index,
      })),
    })
    if (error) throw error
    return mapTripRow(requireRow(data, '旅行'))
  },

  async update(id: string, updates: TripUpdate): Promise<HydratedTrip> {
    if (updates.title !== undefined && !updates.title.trim()) {
      throw new Error('旅行标题不能为空')
    }

    if (updates.start_date !== undefined || updates.end_date !== undefined) {
      const { data: current, error: lookupError } = await supabase
        .from('trips')
        .select('id, start_date, end_date')
        .eq('id', id)
        .maybeSingle()
      if (lookupError) throw lookupError
      const row = requireRow(current, '旅行')
      if (
        !isValidDateRange(updates.start_date ?? row.start_date, updates.end_date ?? row.end_date)
      ) {
        throw new Error('结束日期不能早于开始日期')
      }
    }

    const normalized = {
      ...updates,
      title: updates.title?.trim(),
      cover_photo:
        updates.cover_photo === undefined
          ? undefined
          : (toStoragePath(updates.cover_photo) ?? updates.cover_photo),
    }
    const { data, error } = await supabase
      .from('trips')
      .update(normalized)
      .eq('id', id)
      .select(TRIP_COLUMNS)
      .maybeSingle()
    if (error) throw error
    return mapTripRow(requireRow(data, '旅行'))
  },

  async delete(id: string): Promise<void> {
    const [{ data: trip, error: tripError }, { data: photos, error: photoError }] =
      await Promise.all([
        supabase.from('trips').select('id, cover_photo').eq('id', id).maybeSingle(),
        supabase.from('photos').select('image_url').eq('trip_id', id),
      ])
    if (tripError) throw tripError
    if (photoError) throw photoError
    const existingTrip = requireRow(trip, '旅行')

    const { data: deleted, error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()
    if (error) throw error
    requireRow(deleted, '旅行')

    const paths = [existingTrip.cover_photo, ...(photos ?? []).map((photo) => photo.image_url)]
      .map(toStoragePath)
      .filter((path): path is string => path !== null)
    try {
      await removeStoragePaths(paths)
    } catch (cleanupError) {
      console.warn('旅行已删除，但照片对象清理失败:', cleanupError)
    }
  },

  async addCity(tripId: string, city: TripCityInput): Promise<HydratedTripCity> {
    const name = city.city_name.trim()
    if (!name) throw new Error('城市不能为空')
    const { data, error } = await supabase
      .from('trip_cities')
      .insert({
        trip_id: tripId,
        city_name: name,
        lat: city.lat,
        lng: city.lng,
        sort_order: city.sort_order ?? 0,
      })
      .select(TRIP_CITY_COLUMNS)
      .single()
    if (error) throw error
    return mapTripCity(requireRow(data, '城市'))
  },

  async removeCity(cityId: string): Promise<void> {
    const { data, error } = await supabase
      .from('trip_cities')
      .delete()
      .eq('id', cityId)
      .select('id')
      .maybeSingle()
    if (error) throw error
    requireRow(data, '城市')
  },
}
