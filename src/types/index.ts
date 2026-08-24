import type { PhotoRow, TripCityRow, TripRow } from './database'

export type {
  Database,
  Json,
  PhotoInsert,
  PhotoRow,
  PhotoRowUpdate,
  TripCityInsert,
  TripCityRow,
  TripInsert,
  TripRow,
  TripRowUpdate,
} from './database'

export type Author = '我' | '她'
export type EntryType = 'photo' | 'note'

/** UI model. Database path and browser-ready URL are intentionally separate. */
export interface TripViewModel {
  id: string
  title: string
  coverPath: string | null
  coverUrl: string | null
  startDate: string
  endDate: string
  createdBy: Author
  createdAt: string
}

/** Legacy page contract retained while pages migrate to TripViewModel. */
export interface Trip {
  id: string
  title: string
  cover_photo: string | null
  cover_photo_path?: string | null
  start_date: string
  end_date: string
  created_by: Author
  created_at: string
}

export type HydratedTrip = Trip & TripViewModel & { cover_photo_path: string | null }

export interface TripCityViewModel {
  id: string
  tripId: string
  cityName: string
  lat: number
  lng: number
  sortOrder: number
}

export interface TripCity {
  id: string
  trip_id: string
  city_name: string
  lat: number
  lng: number
  sort_order: number
}

export type HydratedTripCity = TripCity & TripCityViewModel

export type TripWithCities = Trip & { cities: TripCity[] }
export type HydratedTripWithCities = HydratedTrip & { cities: HydratedTripCity[] }

export interface TripCreateInput {
  title: string
  cover_photo: string | null
  start_date: string
  end_date: string
  created_by: Author
}

export interface TripCityInput {
  city_name: string
  lat: number
  lng: number
  sort_order?: number
}

export interface RecordViewModel {
  id: string
  tripId: string
  cityName: string
  imagePath: string | null
  imageUrl: string | null
  note: string
  author: Author
  entryType: EntryType
  recordDate: string | null
  createdAt: string
}

/** Legacy page contract retained while pages migrate to RecordViewModel. */
export interface Photo {
  id: string
  trip_id: string
  city_name: string
  image_url: string | null
  note: string
  author: Author
  entry_type: EntryType
  record_date: string | null
  created_at: string
  storage_path?: string | null
}

export type HydratedPhoto = Photo & RecordViewModel & { storage_path: string | null }

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

// Compile-time alignment checks for this temporary hand-authored schema.
type _TripRowAlignment = TripRow['created_by'] extends Author ? true : never
type _TripCityRowAlignment = TripCityRow['lat'] extends number ? true : never
type _PhotoRowAlignment = PhotoRow['entry_type'] extends EntryType ? true : never
export type DatabaseTypeAlignment = [_TripRowAlignment, _TripCityRowAlignment, _PhotoRowAlignment]
