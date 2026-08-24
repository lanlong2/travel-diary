import type {
  Author,
  EntryType,
  HydratedPhoto,
  HydratedTrip,
  HydratedTripCity,
  PhotoRow,
  TripCityRow,
  TripRow,
} from '../types'
import { signStoragePaths, toStoragePath } from '../lib/storage'

export function mapTripCity(row: TripCityRow): HydratedTripCity {
  return {
    id: row.id,
    tripId: row.trip_id,
    cityName: row.city_name,
    lat: row.lat,
    lng: row.lng,
    sortOrder: row.sort_order,
    trip_id: row.trip_id,
    city_name: row.city_name,
    sort_order: row.sort_order,
  }
}

function mapTrip(row: TripRow, signedUrls: Map<string, string>): HydratedTrip {
  const coverPath = toStoragePath(row.cover_photo)
  const coverUrl = coverPath ? (signedUrls.get(coverPath) ?? null) : row.cover_photo

  return {
    id: row.id,
    title: row.title,
    coverPath,
    coverUrl,
    startDate: row.start_date,
    endDate: row.end_date,
    createdBy: parseAuthor(row.created_by),
    createdAt: row.created_at,
    cover_photo: coverUrl,
    cover_photo_path: coverPath,
    start_date: row.start_date,
    end_date: row.end_date,
    created_by: parseAuthor(row.created_by),
    created_at: row.created_at,
  }
}

export async function mapTrips(rows: TripRow[], signal?: AbortSignal): Promise<HydratedTrip[]> {
  signal?.throwIfAborted()
  const paths = rows
    .map((row) => toStoragePath(row.cover_photo))
    .filter((path): path is string => path !== null)
  const signedUrls = await signStoragePaths(paths, undefined, { signal })
  return rows.map((row) => mapTrip(row, signedUrls))
}

export async function mapTripRow(row: TripRow, signal?: AbortSignal): Promise<HydratedTrip> {
  const [trip] = await mapTrips([row], signal)
  return trip
}

function mapPhoto(row: PhotoRow, signedUrls: Map<string, string>): HydratedPhoto {
  const imagePath = toStoragePath(row.image_url)
  const imageUrl = imagePath ? (signedUrls.get(imagePath) ?? null) : row.image_url

  return {
    id: row.id,
    tripId: row.trip_id,
    cityName: row.city_name,
    imagePath,
    imageUrl,
    note: row.note,
    author: parseAuthor(row.author),
    entryType: parseEntryType(row.entry_type),
    recordDate: row.record_date,
    createdAt: row.created_at,
    trip_id: row.trip_id,
    city_name: row.city_name,
    image_url: imageUrl,
    storage_path: imagePath,
    entry_type: parseEntryType(row.entry_type),
    record_date: row.record_date,
    created_at: row.created_at,
  }
}

export async function mapPhotos(rows: PhotoRow[], signal?: AbortSignal): Promise<HydratedPhoto[]> {
  signal?.throwIfAborted()
  const paths = rows
    .map((row) => toStoragePath(row.image_url))
    .filter((path): path is string => path !== null)
  const signedUrls = await signStoragePaths(paths, undefined, { signal })
  return rows.map((row) => mapPhoto(row, signedUrls))
}

export async function mapPhotoRow(row: PhotoRow, signal?: AbortSignal): Promise<HydratedPhoto> {
  const [photo] = await mapPhotos([row], signal)
  return photo
}
function parseAuthor(value: string): Author {
  if (value === '我' || value === '她') return value
  throw new Error('记录作者数据无效')
}

function parseEntryType(value: string): EntryType {
  if (value === 'photo' || value === 'note') return value
  throw new Error('记录类型数据无效')
}
