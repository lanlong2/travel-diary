export interface Trip {
  id: string
  title: string
  cover_photo: string | null
  start_date: string
  end_date: string
  created_by: '我' | '她'
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
  author: '我' | '她'
  entry_type: 'photo' | 'note'
  created_at: string
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
