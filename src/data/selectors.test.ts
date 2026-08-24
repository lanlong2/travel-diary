import { describe, expect, it } from 'vitest'
import type { HydratedPhoto, HydratedTripWithCities } from '../types'
import { buildCitySummaries, buildTripStats, groupRecordsByMonth, sortRecords } from './selectors'

function record(
  id: string,
  tripId: string,
  city: string,
  date: string,
  type: 'photo' | 'note' = 'photo',
  url: string | null = `${id}.jpg`,
): HydratedPhoto {
  return {
    id,
    tripId,
    cityName: city,
    imagePath: url,
    imageUrl: url,
    note: '',
    author: '我',
    entryType: type,
    recordDate: date,
    createdAt: `${date}T08:00:00Z`,
    trip_id: tripId,
    city_name: city,
    image_url: url,
    storage_path: url,
    entry_type: type,
    record_date: date,
    created_at: `${date}T08:00:00Z`,
  }
}

const trips: HydratedTripWithCities[] = [
  {
    id: 'trip-1',
    title: '南线',
    coverPath: null,
    coverUrl: null,
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    createdBy: '我',
    createdAt: '2026-01-01T00:00:00Z',
    cover_photo: null,
    cover_photo_path: null,
    start_date: '2026-01-01',
    end_date: '2026-01-02',
    created_by: '我',
    created_at: '2026-01-01T00:00:00Z',
    cities: [
      {
        id: 'c1',
        tripId: 'trip-1',
        cityName: '苏州',
        sortOrder: 0,
        trip_id: 'trip-1',
        city_name: '苏州',
        lat: 31,
        lng: 120,
        sort_order: 0,
      },
      {
        id: 'c2',
        tripId: 'trip-1',
        cityName: '苏州',
        sortOrder: 1,
        trip_id: 'trip-1',
        city_name: '苏州',
        lat: 31,
        lng: 120,
        sort_order: 1,
      },
    ],
  },
  {
    id: 'trip-2',
    title: '江南',
    coverPath: null,
    coverUrl: null,
    startDate: '2026-02-01',
    endDate: '2026-02-02',
    createdBy: '她',
    createdAt: '2026-02-01T00:00:00Z',
    cover_photo: null,
    cover_photo_path: null,
    start_date: '2026-02-01',
    end_date: '2026-02-02',
    created_by: '她',
    created_at: '2026-02-01T00:00:00Z',
    cities: [
      {
        id: 'c3',
        tripId: 'trip-2',
        cityName: '苏州',
        sortOrder: 0,
        trip_id: 'trip-2',
        city_name: '苏州',
        lat: 31,
        lng: 120,
        sort_order: 0,
      },
    ],
  },
]

describe('data selectors', () => {
  const records = [
    record('old', 'trip-1', '苏州', '2026-01-02'),
    record('new', 'trip-2', '苏州', '2026-02-03'),
    record('note', 'trip-2', '苏州', '2026-02-04', 'note', null),
    record('unresolved', 'trip-2', '苏州', '2026-02-05', 'photo', null),
  ]

  it('sorts once by record date and groups in the same order', () => {
    expect(sortRecords(records).map((item) => item.id)).toEqual([
      'unresolved',
      'note',
      'new',
      'old',
    ])
    expect(
      groupRecordsByMonth(records).map((group) => [
        group.month,
        group.records.map((item) => item.id),
      ]),
    ).toEqual([
      ['2026年2月', ['unresolved', 'note', 'new']],
      ['2026年1月', ['old']],
    ])
  })

  it('builds trip and de-duplicated city statistics without counting notes or unresolved photos', () => {
    const stats = buildTripStats(trips, records)
    expect(stats.get('trip-1')).toMatchObject({ cityCount: 1, recordCount: 1, photoCount: 1 })
    expect(stats.get('trip-2')).toMatchObject({ recordCount: 3, photoCount: 1, noteCount: 1 })

    expect(buildCitySummaries(trips, records)).toEqual([
      {
        city_name: '苏州',
        visit_count: 2,
        photo_count: 2,
        latest_photo: 'new.jpg',
        lat: 31,
        lng: 120,
        trips: ['南线', '江南'],
      },
    ])
  })
})
