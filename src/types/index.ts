export interface Trip {
  id: string
  title: string
  cover_photo: string | null
  start_date: string
  end_date: string
  created_at: string
}

export interface TripCity {
  id: string
  trip_id: string
  city_name: string
  lat: number
  lng: number
  sort_order: number
}

export interface Photo {
  id: string
  trip_id: string
  city_name: string
  image_url: string | null
  note: string
  entry_type: 'photo' | 'note'
  record_date: string | null
  created_at: string
}

export interface TripUpdate {
  title?: string
  cover_photo?: string | null
  start_date?: string
  end_date?: string
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
