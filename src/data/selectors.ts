import { getRecordTimestamp, parseDateOnly } from '../lib/dates'
import type {
  CitySummary,
  HydratedPhoto,
  HydratedTripWithCities,
  Photo,
  RecordViewModel,
  TripWithCities,
} from '../types'

type RecordLike = Photo & Partial<RecordViewModel>
type TripLike = TripWithCities | HydratedTripWithCities

export interface RecordsByMonth<TRecord extends RecordLike = HydratedPhoto> {
  month: string
  records: TRecord[]
}

export interface TripStats {
  tripId: string
  cityCount: number
  recordCount: number
  photoCount: number
  noteCount: number
}

function recordDate(record: RecordLike): string | null {
  return record.recordDate ?? record.record_date
}

function createdAt(record: RecordLike): string {
  return record.createdAt ?? record.created_at
}

function entryType(record: RecordLike) {
  return record.entryType ?? record.entry_type
}

function imageUrl(record: RecordLike): string | null {
  return 'imageUrl' in record ? (record.imageUrl ?? null) : record.image_url
}

/** Returns a new descending array; the input is never mutated. */
export function sortRecords<TRecord extends RecordLike>(records: readonly TRecord[]): TRecord[] {
  return [...records].sort(
    (a, b) =>
      getRecordTimestamp(recordDate(b), createdAt(b)) -
      getRecordTimestamp(recordDate(a), createdAt(a)),
  )
}

/** Sorts once globally, then forms month buckets in one pass. */
export function groupRecordsByMonth<TRecord extends RecordLike>(
  records: readonly TRecord[],
): RecordsByMonth<TRecord>[] {
  const sorted = sortRecords(records)
  const groups: RecordsByMonth<TRecord>[] = []
  let current: RecordsByMonth<TRecord> | undefined

  for (const record of sorted) {
    const dateValue = recordDate(record)
    const date = dateValue ? parseDateOnly(dateValue) : new Date(createdAt(record))
    const month = `${date.getFullYear()}年${date.getMonth() + 1}月`

    if (!current || current.month !== month) {
      current = { month, records: [] }
      groups.push(current)
    }
    current.records.push(record)
  }

  return groups
}

/** Builds all per-trip counts with one trip pass and one record pass. */
export function buildTripStats(
  trips: readonly TripLike[],
  records: readonly RecordLike[],
): Map<string, TripStats> {
  const stats = new Map<string, TripStats>()

  for (const trip of trips) {
    stats.set(trip.id, {
      tripId: trip.id,
      cityCount: new Set(trip.cities.map((city) => city.city_name)).size,
      recordCount: 0,
      photoCount: 0,
      noteCount: 0,
    })
  }

  for (const record of records) {
    const value = stats.get(record.trip_id)
    if (!value) continue
    value.recordCount += 1
    if (entryType(record) === 'photo' && imageUrl(record)) value.photoCount += 1
    if (entryType(record) === 'note') value.noteCount += 1
  }

  return stats
}

/**
 * Aggregates each city exactly once per trip, then scans records once.
 * Legacy records without a mapped city are intentionally not assigned fake
 * coordinates. Photo counts never include note rows or unresolved images.
 */
export function buildCitySummaries(
  trips: readonly TripLike[],
  records: readonly RecordLike[],
): CitySummary[] {
  interface MutableCitySummary extends CitySummary {
    latestTimestamp: number
    tripIds: Set<string>
  }

  const cities = new Map<string, MutableCitySummary>()

  for (const trip of trips) {
    const seenInTrip = new Set<string>()
    for (const city of trip.cities) {
      const name = city.city_name.trim()
      if (!name || seenInTrip.has(name)) continue
      seenInTrip.add(name)

      const existing = cities.get(name)
      if (existing) {
        if (!existing.tripIds.has(trip.id)) {
          existing.tripIds.add(trip.id)
          existing.visit_count += 1
          existing.trips.push(trip.title)
        }
        continue
      }

      cities.set(name, {
        city_name: name,
        visit_count: 1,
        photo_count: 0,
        latest_photo: null,
        lat: city.lat,
        lng: city.lng,
        trips: [trip.title],
        latestTimestamp: Number.NEGATIVE_INFINITY,
        tripIds: new Set([trip.id]),
      })
    }
  }

  for (const record of records) {
    if (entryType(record) !== 'photo') continue
    const url = imageUrl(record)
    if (!url) continue

    const city = cities.get(record.city_name.trim())
    if (!city) continue
    city.photo_count += 1

    const timestamp = getRecordTimestamp(recordDate(record), createdAt(record))
    if (timestamp > city.latestTimestamp) {
      city.latestTimestamp = timestamp
      city.latest_photo = url
    }
  }

  return Array.from(cities.values(), ({ latestTimestamp: _, tripIds: __, ...summary }) => summary)
}
