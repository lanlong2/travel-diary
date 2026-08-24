import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  recordList: vi.fn(),
  recordCreate: vi.fn(),
  recordUpdate: vi.fn(),
  recordDelete: vi.fn(),
  tripList: vi.fn(),
  tripGet: vi.fn(),
  tripCreate: vi.fn(),
  tripUpdate: vi.fn(),
  tripDelete: vi.fn(),
  addCity: vi.fn(),
  removeCity: vi.fn(),
}))
vi.mock('../data/recordsRepository', () => ({
  recordsRepository: {
    list: mocks.recordList,
    create: mocks.recordCreate,
    update: mocks.recordUpdate,
    delete: mocks.recordDelete,
  },
}))
vi.mock('../data/tripsRepository', () => ({
  tripsRepository: {
    list: mocks.tripList,
    getById: mocks.tripGet,
    create: mocks.tripCreate,
    update: mocks.tripUpdate,
    delete: mocks.tripDelete,
    addCity: mocks.addCity,
    removeCity: mocks.removeCity,
  },
}))

import { queryKeys } from '../data/queryKeys'
import { usePhotoMutations, usePhotosQuery } from './usePhotos'
import { useTripMutations, useTripQuery, useTripsQuery } from './useTrips'

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, wrapper }
}

describe('React Query data hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.recordList.mockResolvedValue([{ id: 'p1' }])
    mocks.recordCreate.mockResolvedValue({ id: 'p2' })
    mocks.recordUpdate.mockResolvedValue({ id: 'p1' })
    mocks.recordDelete.mockResolvedValue(undefined)
    mocks.tripList.mockResolvedValue([{ id: 't1' }])
    mocks.tripGet.mockResolvedValue({ id: 't1' })
    mocks.tripCreate.mockResolvedValue({ id: 't2' })
    mocks.tripUpdate.mockResolvedValue({ id: 't1' })
    mocks.tripDelete.mockResolvedValue(undefined)
    mocks.addCity.mockResolvedValue({ id: 'c1' })
    mocks.removeCity.mockResolvedValue(undefined)
  })

  it('runs record queries with trip-scoped keys and abort signals', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => usePhotosQuery('t1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: 'p1' }])
    expect(mocks.recordList).toHaveBeenCalledWith('t1', expect.any(AbortSignal))
  })

  it('creates, updates and deletes records with exact invalidation', async () => {
    const { client, wrapper } = setup()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => usePhotoMutations('t1'), { wrapper })
    const input = {
      file: null,
      tripId: 't1',
      cityName: '上海',
      lat: 31,
      lng: 121,
      note: 'x',
      author: '我' as const,
      entryType: 'note' as const,
      recordDate: '2026-08-24',
    }

    await act(() => result.current.createRecord(input))
    expect(mocks.recordCreate).toHaveBeenCalledWith(input, expect.any(Object))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.records.list(), exact: true })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.records.list('t1'), exact: true })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.trips.list(), exact: true })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.trips.detail('t1'), exact: true })

    invalidate.mockClear()
    await act(() => result.current.updatePhoto('p1', { note: 'changed' }))
    expect(mocks.recordUpdate).toHaveBeenCalledWith('p1', { note: 'changed' })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.records.list(), exact: true })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.records.list('t1'), exact: true })

    invalidate.mockClear()
    await act(() => result.current.deletePhoto('p1'))
    expect(mocks.recordDelete).toHaveBeenCalledWith('p1')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.records.list(), exact: true })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.records.list('t1'), exact: true })
  })

  it('only invalidates the global record list without an active trip', async () => {
    const { client, wrapper } = setup()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => usePhotoMutations(), { wrapper })
    await act(() => result.current.deletePhoto('p1'))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.records.list(), exact: true })
    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: queryKeys.records.list('t1'),
      exact: true,
    })
  })

  it('runs list/detail trip queries and disables an empty detail id', async () => {
    const { wrapper } = setup()
    const list = renderHook(() => useTripsQuery(), { wrapper })
    const detail = renderHook(() => useTripQuery('t1'), { wrapper })
    const disabled = renderHook(() => useTripQuery(''), { wrapper })
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(detail.result.current.isSuccess).toBe(true))
    expect(mocks.tripList).toHaveBeenCalledWith(expect.any(AbortSignal))
    expect(mocks.tripGet).toHaveBeenCalledWith('t1', expect.any(AbortSignal))
    expect(disabled.result.current.fetchStatus).toBe('idle')
  })

  it('invalidates exact trip queries after every mutation', async () => {
    const { client, wrapper } = setup()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const removeQueries = vi.spyOn(client, 'removeQueries')
    const { result } = renderHook(() => useTripMutations(), { wrapper })
    const trip = {
      title: '旅行',
      cover_photo: null,
      start_date: '2026-01-01',
      end_date: '2026-01-02',
      created_by: '我' as const,
    }

    await act(() => result.current.createTrip(trip, []))
    expect(mocks.tripCreate).toHaveBeenCalledWith(trip, [])
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.trips.list(), exact: true })

    invalidate.mockClear()
    await act(() => result.current.updateTrip('t1', { title: '新标题' }))
    expect(invalidate).toHaveBeenCalledTimes(2)

    invalidate.mockClear()
    await act(() => result.current.addCity('t1', { city_name: '上海', lat: 31, lng: 121 }))
    expect(invalidate).toHaveBeenCalledTimes(2)

    invalidate.mockClear()
    await act(() => result.current.removeCity('c1', 't1'))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.trips.detail('t1'), exact: true })

    invalidate.mockClear()
    await act(() => result.current.removeCity('c2'))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.trips.all })

    invalidate.mockClear()
    await act(() => result.current.deleteTrip('t1'))
    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.trips.detail('t1'),
      exact: true,
    })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.records.all })
  })
})
