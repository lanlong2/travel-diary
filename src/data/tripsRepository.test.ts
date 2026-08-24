import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
  removeStoragePaths: vi.fn(),
  toStoragePath: vi.fn((value: string | null | undefined) => value || null),
  mapTrips: vi.fn(async (rows: unknown[]) => rows),
  mapTripRow: vi.fn(async (row: unknown) => row),
  mapTripCity: vi.fn((row: Record<string, unknown>) => ({ ...row, mapped: true })),
}))

vi.mock('../lib/supabase', () => ({ supabase: { from: mocks.from, rpc: mocks.rpc } }))
vi.mock('../lib/storage', () => ({
  removeStoragePaths: mocks.removeStoragePaths,
  toStoragePath: mocks.toStoragePath,
}))
vi.mock('./mappers', () => ({
  mapTrips: mocks.mapTrips,
  mapTripRow: mocks.mapTripRow,
  mapTripCity: mocks.mapTripCity,
}))

import { TRIP_CITY_COLUMNS, TRIP_COLUMNS, tripsRepository } from './tripsRepository'

function query(result: unknown) {
  const value: Record<string, ReturnType<typeof vi.fn>> & PromiseLike<unknown> = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    abortSignal: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    insert: vi.fn(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    then: (resolve: (data: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  } as never
  for (const method of [
    'select',
    'order',
    'eq',
    'in',
    'abortSignal',
    'update',
    'delete',
    'insert',
  ] as const) {
    value[method].mockReturnValue(value)
  }
  value.maybeSingle.mockResolvedValue(result)
  value.single.mockResolvedValue(result)
  return value
}

const tripRow = {
  id: 't1',
  title: '旅途',
  cover_photo: 'trips/t1/cover.jpg',
  start_date: '2026-08-01',
  end_date: '2026-08-03',
  created_by: '我',
  created_at: '2026-08-01T00:00:00Z',
}
const cityRow = { id: 'c1', trip_id: 't1', city_name: '上海', lat: 31, lng: 121, sort_order: 0 }

describe('tripsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.removeStoragePaths.mockResolvedValue(undefined)
    mocks.toStoragePath.mockImplementation((value: string | null | undefined) => value || null)
  })

  it('lists trips and associates ordered cities in two linear queries', async () => {
    const tripsQuery = query({ data: [tripRow], error: null })
    const citiesQuery = query({ data: [cityRow], error: null })
    mocks.from.mockReturnValueOnce(tripsQuery).mockReturnValueOnce(citiesQuery)
    const controller = new AbortController()

    const result = await tripsRepository.list(controller.signal)

    expect(result).toEqual([{ ...tripRow, cities: [{ ...cityRow, mapped: true }] }])
    expect(tripsQuery.select).toHaveBeenCalledWith(TRIP_COLUMNS)
    expect(citiesQuery.select).toHaveBeenCalledWith(TRIP_CITY_COLUMNS)
    expect(citiesQuery.in).toHaveBeenCalledWith('trip_id', ['t1'])
    expect(tripsQuery.abortSignal).toHaveBeenCalledWith(controller.signal)
    expect(citiesQuery.abortSignal).toHaveBeenCalledWith(controller.signal)
  })

  it('does not query cities for an empty trip list', async () => {
    const tripsQuery = query({ data: null, error: null })
    mocks.from.mockReturnValueOnce(tripsQuery)
    await expect(tripsRepository.list()).resolves.toEqual([])
    expect(mocks.from).toHaveBeenCalledTimes(1)
  })

  it('propagates trip and city list errors', async () => {
    const tripFailure = new Error('trip read failed')
    mocks.from.mockReturnValueOnce(query({ data: null, error: tripFailure }))
    await expect(tripsRepository.list()).rejects.toBe(tripFailure)

    const cityFailure = new Error('city read failed')
    mocks.from
      .mockReturnValueOnce(query({ data: [tripRow], error: null }))
      .mockReturnValueOnce(query({ data: null, error: cityFailure }))
    await expect(tripsRepository.list()).rejects.toBe(cityFailure)
  })

  it('gets a trip with cities and supports cancellation', async () => {
    const tripQuery = query({ data: tripRow, error: null })
    const cityQuery = query({ data: [cityRow], error: null })
    mocks.from.mockReturnValueOnce(tripQuery).mockReturnValueOnce(cityQuery)
    const controller = new AbortController()

    const result = await tripsRepository.getById('t1', controller.signal)
    expect(result).toEqual({ ...tripRow, cities: [{ ...cityRow, mapped: true }] })
    expect(tripQuery.abortSignal).toHaveBeenCalledWith(controller.signal)
    expect(cityQuery.abortSignal).toHaveBeenCalledWith(controller.signal)
  })

  it('returns null for an empty id or missing trip', async () => {
    await expect(tripsRepository.getById('')).resolves.toBeNull()
    expect(mocks.from).not.toHaveBeenCalled()

    mocks.from
      .mockReturnValueOnce(query({ data: null, error: null }))
      .mockReturnValueOnce(query({ data: [], error: null }))
    await expect(tripsRepository.getById('missing')).resolves.toBeNull()
  })

  it('propagates getById trip and city errors', async () => {
    const tripFailure = new Error('trip failed')
    mocks.from
      .mockReturnValueOnce(query({ data: null, error: tripFailure }))
      .mockReturnValueOnce(query({ data: [], error: null }))
    await expect(tripsRepository.getById('t1')).rejects.toBe(tripFailure)

    const cityFailure = new Error('city failed')
    mocks.from
      .mockReturnValueOnce(query({ data: tripRow, error: null }))
      .mockReturnValueOnce(query({ data: null, error: cityFailure }))
    await expect(tripsRepository.getById('t1')).rejects.toBe(cityFailure)
  })

  it('creates a normalized trip and ordered city payload through the RPC', async () => {
    mocks.rpc.mockResolvedValue({ data: tripRow, error: null })
    const result = await tripsRepository.create(
      {
        title: '  夏日  ',
        cover_photo: 'trips/t1/cover.jpg',
        start_date: '2026-08-01',
        end_date: '2026-08-03',
        created_by: '她',
      },
      [
        { city_name: ' 上海 ', lat: 31, lng: 121, sort_order: 7 },
        {
          city_name: ' 苏州 ',
          lat: 31.3,
          lng: 120.6,
          sort_order: 1,
        },
      ],
    )

    expect(result).toBe(tripRow)
    expect(mocks.rpc).toHaveBeenCalledWith('create_trip_with_cities', {
      title: '夏日',
      cover_path: 'trips/t1/cover.jpg',
      start_date: '2026-08-01',
      end_date: '2026-08-03',
      created_by: '她',
      cities_json: [
        { city_name: '上海', lat: 31, lng: 121, sort_order: 7 },
        { city_name: '苏州', lat: 31.3, lng: 120.6, sort_order: 1 },
      ],
    })
  })

  it('validates create input and propagates RPC or zero-row errors', async () => {
    await expect(
      tripsRepository.create(
        {
          title: ' ',
          cover_photo: null,
          start_date: '2026-01-01',
          end_date: '2026-01-02',
          created_by: '我',
        },
        [],
      ),
    ).rejects.toThrow('旅行标题不能为空')
    await expect(
      tripsRepository.create(
        {
          title: 'x',
          cover_photo: null,
          start_date: '2026-01-03',
          end_date: '2026-01-02',
          created_by: '我',
        },
        [],
      ),
    ).rejects.toThrow('结束日期不能早于开始日期')

    const failure = new Error('rpc failed')
    mocks.rpc.mockResolvedValueOnce({ data: null, error: failure })
    await expect(
      tripsRepository.create(
        {
          title: 'x',
          cover_photo: null,
          start_date: '2026-01-01',
          end_date: '2026-01-02',
          created_by: '我',
        },
        [],
      ),
    ).rejects.toBe(failure)
    mocks.rpc.mockResolvedValueOnce({ data: null, error: null })
    await expect(
      tripsRepository.create(
        {
          title: 'x',
          cover_photo: null,
          start_date: '2026-01-01',
          end_date: '2026-01-02',
          created_by: '我',
        },
        [],
      ),
    ).rejects.toThrow('旅行不存在或无权访问')
  })

  it('updates normalized values and validates merged date ranges', async () => {
    const lookup = query({
      data: { id: 't1', start_date: '2026-08-01', end_date: '2026-08-03' },
      error: null,
    })
    const update = query({ data: tripRow, error: null })
    mocks.from.mockReturnValueOnce(lookup).mockReturnValueOnce(update)

    await tripsRepository.update('t1', {
      title: '  新标题 ',
      start_date: '2026-08-02',
      cover_photo: 'trips/t1/new.jpg',
    })
    expect(update.update).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '新标题',
        start_date: '2026-08-02',
        cover_photo: 'trips/t1/new.jpg',
      }),
    )
    expect(update.select).toHaveBeenCalledWith(TRIP_COLUMNS)
  })

  it('rejects invalid update titles, lookup failures, ranges and zero-row updates', async () => {
    await expect(tripsRepository.update('t1', { title: ' ' })).rejects.toThrow('旅行标题不能为空')

    const lookupFailure = new Error('lookup failed')
    mocks.from.mockReturnValueOnce(query({ data: null, error: lookupFailure }))
    await expect(tripsRepository.update('t1', { end_date: '2026-08-04' })).rejects.toBe(
      lookupFailure,
    )

    mocks.from.mockReturnValueOnce(query({ data: null, error: null }))
    await expect(tripsRepository.update('t1', { end_date: '2026-08-04' })).rejects.toThrow(
      '旅行不存在或无权访问',
    )

    mocks.from.mockReturnValueOnce(
      query({
        data: { id: 't1', start_date: '2026-08-03', end_date: '2026-08-04' },
        error: null,
      }),
    )
    await expect(tripsRepository.update('t1', { end_date: '2026-08-02' })).rejects.toThrow(
      '结束日期不能早于开始日期',
    )

    const update = query({ data: null, error: null })
    mocks.from.mockReturnValueOnce(update)
    await expect(tripsRepository.update('t1', { title: 'valid' })).rejects.toThrow(
      '旅行不存在或无权访问',
    )
  })

  it('propagates update mutation errors', async () => {
    const failure = new Error('update failed')
    mocks.from.mockReturnValueOnce(query({ data: null, error: failure }))
    await expect(tripsRepository.update('t1', { title: 'valid' })).rejects.toBe(failure)
  })

  it('deletes a trip first and then deduplicates all storage paths', async () => {
    const tripRead = query({ data: { id: 't1', cover_photo: 'cover.jpg' }, error: null })
    const photoRead = query({
      data: [{ image_url: 'one.jpg' }, { image_url: 'one.jpg' }],
      error: null,
    })
    const deletion = query({ data: { id: 't1' }, error: null })
    mocks.from
      .mockReturnValueOnce(tripRead)
      .mockReturnValueOnce(photoRead)
      .mockReturnValueOnce(deletion)

    await tripsRepository.delete('t1')
    expect(deletion.delete).toHaveBeenCalled()
    expect(mocks.removeStoragePaths).toHaveBeenCalledWith(['cover.jpg', 'one.jpg', 'one.jpg'])
  })

  it('handles every trip delete failure and tolerates storage cleanup errors', async () => {
    const tripFailure = new Error('trip read failed')
    mocks.from
      .mockReturnValueOnce(query({ data: null, error: tripFailure }))
      .mockReturnValueOnce(query({ data: [], error: null }))
    await expect(tripsRepository.delete('t1')).rejects.toBe(tripFailure)

    const photoFailure = new Error('photo read failed')
    mocks.from
      .mockReturnValueOnce(query({ data: tripRow, error: null }))
      .mockReturnValueOnce(query({ data: null, error: photoFailure }))
    await expect(tripsRepository.delete('t1')).rejects.toBe(photoFailure)

    mocks.from
      .mockReturnValueOnce(query({ data: null, error: null }))
      .mockReturnValueOnce(query({ data: [], error: null }))
    await expect(tripsRepository.delete('t1')).rejects.toThrow('旅行不存在或无权访问')

    const deleteFailure = new Error('delete failed')
    mocks.from
      .mockReturnValueOnce(query({ data: tripRow, error: null }))
      .mockReturnValueOnce(query({ data: [], error: null }))
      .mockReturnValueOnce(query({ data: null, error: deleteFailure }))
    await expect(tripsRepository.delete('t1')).rejects.toBe(deleteFailure)

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mocks.from
      .mockReturnValueOnce(query({ data: tripRow, error: null }))
      .mockReturnValueOnce(query({ data: [], error: null }))
      .mockReturnValueOnce(query({ data: { id: 't1' }, error: null }))
    mocks.removeStoragePaths.mockRejectedValueOnce(new Error('storage failed'))
    await expect(tripsRepository.delete('t1')).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('adds and removes cities with normalization and row checks', async () => {
    const insertion = query({ data: cityRow, error: null })
    const deletion = query({ data: { id: 'c1' }, error: null })
    mocks.from.mockReturnValueOnce(insertion).mockReturnValueOnce(deletion)

    await tripsRepository.addCity('t1', { city_name: ' 上海 ', lat: 31, lng: 121 })
    expect(insertion.insert).toHaveBeenCalledWith({
      trip_id: 't1',
      city_name: '上海',
      lat: 31,
      lng: 121,
      sort_order: 0,
    })
    await expect(tripsRepository.removeCity('c1')).resolves.toBeUndefined()
  })

  it('validates city writes and propagates their errors', async () => {
    await expect(
      tripsRepository.addCity('t1', {
        city_name: ' ',
        lat: 0,
        lng: 0,
      }),
    ).rejects.toThrow('城市不能为空')

    const insertionFailure = new Error('insert failed')
    mocks.from.mockReturnValueOnce(query({ data: null, error: insertionFailure }))
    await expect(
      tripsRepository.addCity('t1', {
        city_name: '上海',
        lat: 31,
        lng: 121,
        sort_order: 2,
      }),
    ).rejects.toBe(insertionFailure)

    const deletionFailure = new Error('delete failed')
    mocks.from.mockReturnValueOnce(query({ data: null, error: deletionFailure }))
    await expect(tripsRepository.removeCity('c1')).rejects.toBe(deletionFailure)
    mocks.from.mockReturnValueOnce(query({ data: null, error: null }))
    await expect(tripsRepository.removeCity('c1')).rejects.toThrow('城市不存在或无权访问')
  })
})
