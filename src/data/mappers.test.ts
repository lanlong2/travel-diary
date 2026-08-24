import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ signStoragePaths: vi.fn(), toStoragePath: vi.fn() }))
vi.mock('../lib/storage', () => ({
  signStoragePaths: mocks.signStoragePaths,
  toStoragePath: mocks.toStoragePath,
}))

import { mapPhotoRow, mapPhotos, mapTripCity, mapTripRow, mapTrips } from './mappers'
import type { PhotoRow, TripRow } from '../types'

const trip: TripRow = {
  id: 't1',
  title: '旅行',
  cover_photo: 'trips/t1/cover.jpg',
  start_date: '2026-01-01',
  end_date: '2026-01-02',
  created_by: '我',
  created_at: '2026-01-01T00:00:00Z',
}
const photo: PhotoRow = {
  id: 'p1',
  trip_id: 't1',
  city_name: '上海',
  image_url: 'trips/t1/p1.jpg',
  note: 'note',
  author: '她',
  entry_type: 'photo',
  record_date: '2026-01-01',
  created_at: '2026-01-01T00:00:00Z',
}

describe('data mappers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.toStoragePath.mockImplementation((value: string | null) =>
      value?.startsWith('trips/') ? value : null,
    )
    mocks.signStoragePaths.mockImplementation(
      async (paths: string[]) => new Map(paths.map((path) => [path, `signed:${path}`])),
    )
  })

  it('maps database city fields to view-model aliases', () => {
    expect(
      mapTripCity({
        id: 'c1',
        trip_id: 't1',
        city_name: '上海',
        lat: 31,
        lng: 121,
        sort_order: 2,
      }),
    ).toEqual({
      id: 'c1',
      tripId: 't1',
      cityName: '上海',
      lat: 31,
      lng: 121,
      sortOrder: 2,
      trip_id: 't1',
      city_name: '上海',
      sort_order: 2,
    })
  })

  it('signs trip cover paths once and maps both modern and compatibility fields', async () => {
    const controller = new AbortController()
    const result = await mapTrips([trip], controller.signal)
    expect(mocks.signStoragePaths).toHaveBeenCalledWith(['trips/t1/cover.jpg'], undefined, {
      signal: controller.signal,
    })
    expect(result[0]).toEqual(
      expect.objectContaining({
        coverPath: 'trips/t1/cover.jpg',
        coverUrl: 'signed:trips/t1/cover.jpg',
        cover_photo: 'signed:trips/t1/cover.jpg',
        createdBy: '我',
      }),
    )
    await expect(mapTripRow(trip)).resolves.toEqual(expect.objectContaining({ id: 't1' }))
  })

  it('keeps an external cover URL and nullable cover without signing', async () => {
    const external = { ...trip, cover_photo: 'https://cdn.test/cover.jpg' }
    const none = { ...trip, id: 't2', cover_photo: null }
    const result = await mapTrips([external, none])
    expect(result[0].coverUrl).toBe('https://cdn.test/cover.jpg')
    expect(result[1].coverUrl).toBeNull()
    expect(mocks.signStoragePaths).toHaveBeenCalledWith([], undefined, { signal: undefined })
  })

  it('maps signed photos and note records without images', async () => {
    const note: PhotoRow = { ...photo, id: 'p2', image_url: null, entry_type: 'note', author: '我' }
    const result = await mapPhotos([photo, note])
    expect(result[0]).toEqual(
      expect.objectContaining({
        tripId: 't1',
        cityName: '上海',
        imagePath: 'trips/t1/p1.jpg',
        imageUrl: 'signed:trips/t1/p1.jpg',
        author: '她',
        entryType: 'photo',
      }),
    )
    expect(result[1]).toEqual(
      expect.objectContaining({ imagePath: null, imageUrl: null, entryType: 'note' }),
    )
    await expect(mapPhotoRow(photo)).resolves.toEqual(expect.objectContaining({ id: 'p1' }))
  })

  it('keeps an external image URL when no storage path is available', async () => {
    const external = { ...photo, image_url: 'https://cdn.test/photo.jpg' }
    const [result] = await mapPhotos([external])
    expect(result.imageUrl).toBe('https://cdn.test/photo.jpg')
  })

  it('rejects aborted mapping and invalid enum values', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(mapTrips([trip], controller.signal)).rejects.toThrow()
    await expect(mapPhotos([photo], controller.signal)).rejects.toThrow()
    await expect(mapTrips([{ ...trip, created_by: '陌生人' }])).rejects.toThrow('记录作者数据无效')
    await expect(mapPhotos([{ ...photo, entry_type: 'video' }])).rejects.toThrow('记录类型数据无效')
  })

  it('uses null when a signer omits a requested path', async () => {
    mocks.signStoragePaths.mockResolvedValue(new Map())
    await expect(mapTripRow(trip)).resolves.toEqual(expect.objectContaining({ coverUrl: null }))
    await expect(mapPhotoRow(photo)).resolves.toEqual(expect.objectContaining({ imageUrl: null }))
  })
})
