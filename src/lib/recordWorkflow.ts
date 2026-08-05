import { supabase } from './supabase'
import type { TripCityInput } from '../types'

interface CompleteRecordSetupInput {
  tripId: string
  city: Omit<TripCityInput, 'sort_order'>
  coverPhotoPath?: string | null
}

/**
 * Completes the trip-side effects of adding a record.
 *
 * The photo row/storage upload is owned by usePhotos. This workflow only
 * adds the city and the first cover, and compensates a newly inserted city
 * if the later cover update fails.
 */
export async function completeRecordSetup({
  tripId,
  city,
  coverPhotoPath,
}: CompleteRecordSetupInput): Promise<void> {
  const cityName = city.city_name.trim()
  if (!cityName) throw new Error('城市不能为空')

  let createdCityId: string | null = null

  try {
    const { data: existingCities, error: citiesLookupError } = await supabase
      .from('trip_cities')
      .select('id')
      .eq('trip_id', tripId)
      .eq('city_name', cityName)

    if (citiesLookupError) throw citiesLookupError

    if (!existingCities || existingCities.length === 0) {
      const { count: cityCount, error: cityCountError } = await supabase
        .from('trip_cities')
        .select('id', { count: 'exact', head: true })
        .eq('trip_id', tripId)

      if (cityCountError) throw cityCountError

      const { data: insertedCity, error: cityInsertError } = await supabase
        .from('trip_cities')
        .insert({
          trip_id: tripId,
          city_name: cityName,
          lat: city.lat,
          lng: city.lng,
          sort_order: cityCount ?? 0,
        })
        .select('id')
        .single()

      if (cityInsertError) throw cityInsertError
      if (!insertedCity?.id) throw new Error('城市保存失败')
      createdCityId = insertedCity.id
    }

    if (coverPhotoPath) {
      const { data: currentTrip, error: tripLookupError } = await supabase
        .from('trips')
        .select('cover_photo')
        .eq('id', tripId)
        .single()

      if (tripLookupError) throw tripLookupError
      if (!currentTrip) throw new Error('旅行不存在')

      if (!currentTrip.cover_photo) {
        const { error: coverUpdateError } = await supabase
          .from('trips')
          .update({ cover_photo: coverPhotoPath })
          .eq('id', tripId)

        if (coverUpdateError) throw coverUpdateError
      }
    }
  } catch (error) {
    if (createdCityId) {
      const { error: rollbackError } = await supabase
        .from('trip_cities')
        .delete()
        .eq('id', createdCityId)

      if (rollbackError) {
        console.warn('保存记录后的城市清理失败:', rollbackError)
      }
    }

    throw error
  }
}
