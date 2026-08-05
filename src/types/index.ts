export type Author = '我' | '她'

export interface Trip {
  id: string
  title: string
  cover_photo: string | null
  start_date: string
  end_date: string
  created_by: Author
  created_at: string
  /** Original Storage path when cover_photo has been resolved to a signed URL. */
  cover_photo_path?: string | null
}

export interface TripCity {
  id: string
  trip_id: string
  city_name: string
  lat: number
  lng: number
  sort_order: number
}

export type TripWithCities = Trip & { cities: TripCity[] }

export type TripCreateInput = Omit<Trip, 'id' | 'created_at' | 'cover_photo_path'>

export interface TripCityInput {
  city_name: string
  lat: number
  lng: number
  sort_order?: number
}

export interface Photo {
  id: string
  trip_id: string
  city_name: string
  image_url: string | null
  note: string
  author: Author
  entry_type: 'photo' | 'note'
  record_date: string | null
  created_at: string
  /** Original Storage path when image_url has been resolved to a signed URL. */
  storage_path?: string | null
}

export interface TripUpdate {
  title?: string
  cover_photo?: string | null
  start_date?: string
  end_date?: string
}

export interface PhotoUpdate {
  note?: string
  city_name?: string
  record_date?: string | null
}

export interface CitySummary {
  city_name: string
  visit_count: number
  photo_count: number
  latest_photo: string | null
  lat: number
  lng: number
  trips: string[]
}
