import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
  mapPhotos: vi.fn(async (rows: unknown[]) => rows),
  mapPhotoRow: vi.fn((row: unknown) => row),
  uploadRecordImage: vi.fn(),
  createRecordId: vi.fn(() => 'record-uuid'),
  removeStoragePaths: vi.fn(),
  toStoragePath: vi.fn((value: string | null | undefined) => value || null),
}))

vi.mock('../lib/supabase', () => ({
  supabase: { from: mocks.from, rpc: mocks.rpc },
}))
vi.mock('./mappers', () => ({
  mapPhotos: mocks.mapPhotos,
  mapPhotoRow: mocks.mapPhotoRow,
}))
vi.mock('./storageRepository', () => ({
  createRecordId: mocks.createRecordId,
  uploadRecordImage: mocks.uploadRecordImage,
}))
vi.mock('../lib/storage', () => ({
  removeStoragePaths: mocks.removeStoragePaths,
  toStoragePath: mocks.toStoragePath,
}))

import { PHOTO_COLUMNS, recordsRepository, type CreateRecordInput } from './recordsRepository'

function thenableQuery(result: unknown) {
  const query: Record<string, ReturnType<typeof vi.fn>> & PromiseLike<unknown> = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    abortSignal: vi.fn(),
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  } as never
  query.select.mockReturnValue(query)
  query.order.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.abortSignal.mockReturnValue(query)
  return query
}

function mutationQuery(result: unknown) {
  const query = {
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn(),
  }
  query.update.mockReturnValue(query)
  query.delete.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.select.mockReturnValue(query)
  query.maybeSingle.mockResolvedValue(result)
  return query
}

const baseInput: CreateRecordInput = {
  file: null,
  tripId: 'trip-1',
  cityName: ' 上海 ',
  lat: 31.2,
  lng: 121.5,
  note: ' 一段文字 ',
  author: '我',
  entryType: 'note',
  recordDate: '2026-08-24',
}

describe('recordsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.rpc.mockResolvedValue({ data: { id: 'record-uuid' }, error: null })
    mocks.uploadRecordImage.mockResolvedValue('trips/trip-1/record-uuid.jpg')
    mocks.removeStoragePaths.mockResolvedValue(undefined)
  })

  it('lists records with explicit columns, ordering, filtering, cancellation and mapping', async () => {
    const rows = [{ id: 'p1' }]
    const query = thenableQuery({ data: rows, error: null })
    mocks.from.mockReturnValue(query)
    const controller = new AbortController()

    await expect(recordsRepository.list('trip-1', controller.signal)).resolves.toEqual(rows)
    expect(mocks.from).toHaveBeenCalledWith('photos')
    expect(query.select).toHaveBeenCalledWith(PHOTO_COLUMNS)
    expect(query.order).toHaveBeenNthCalledWith(1, 'record_date', {
      ascending: false,
      nullsFirst: false,
    })
    expect(query.order).toHaveBeenNthCalledWith(2, 'created_at', { ascending: false })
    expect(query.eq).toHaveBeenCalledWith('trip_id', 'trip-1')
    expect(query.abortSignal).toHaveBeenCalledWith(controller.signal)
    expect(mocks.mapPhotos).toHaveBeenCalledWith(rows, controller.signal)
  })

  it('returns an empty mapped list and propagates list errors', async () => {
    let query = thenableQuery({ data: null, error: null })
    mocks.from.mockReturnValue(query)
    await expect(recordsRepository.list()).resolves.toEqual([])
    expect(query.eq).not.toHaveBeenCalled()
    expect(query.abortSignal).not.toHaveBeenCalled()

    const failure = new Error('read failed')
    query = thenableQuery({ data: null, error: failure })
    mocks.from.mockReturnValue(query)
    await expect(recordsRepository.list()).rejects.toBe(failure)
  })

  it.each([
    [{ ...baseInput, tripId: '' }, '请选择一段旅行'],
    [{ ...baseInput, cityName: '  ' }, '城市不能为空'],
    [{ ...baseInput, recordDate: '' }, '请选择记录日期'],
    [{ ...baseInput, lat: Number.NaN }, '城市坐标无效'],
    [{ ...baseInput, lng: Number.POSITIVE_INFINITY }, '城市坐标无效'],
    [{ ...baseInput, entryType: 'photo', file: null }, '请选择一张照片'],
    [{ ...baseInput, entryType: 'note', note: '  ' }, '请填写记录内容'],
  ] as const)('validates create input %#', async (input, message) => {
    await expect(recordsRepository.create(input as CreateRecordInput)).rejects.toThrow(message)
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it('creates a note through the RPC without uploading', async () => {
    const row = { id: 'record-uuid', city_name: '上海' }
    mocks.rpc.mockResolvedValue({ data: row, error: null })

    await expect(recordsRepository.create(baseInput)).resolves.toBe(row)
    expect(mocks.uploadRecordImage).not.toHaveBeenCalled()
    expect(mocks.rpc).toHaveBeenCalledWith('create_record', {
      id: 'record-uuid',
      trip_id: 'trip-1',
      city_name: '上海',
      lat: 31.2,
      lng: 121.5,
      image_path: '',
      note: '一段文字',
      author: '我',
      entry_type: 'note',
      record_date: '2026-08-24',
    })
  })

  it('uploads a photo before RPC creation', async () => {
    const file = new File(['image'], 'memory.webp', { type: 'image/webp' })
    const input = { ...baseInput, file, entryType: 'photo' as const }

    await recordsRepository.create(input)

    expect(mocks.uploadRecordImage).toHaveBeenCalledWith(file, 'trip-1', 'record-uuid')
    expect(mocks.rpc).toHaveBeenCalledWith(
      'create_record',
      expect.objectContaining({
        image_path: 'trips/trip-1/record-uuid.jpg',
        entry_type: 'photo',
      }),
    )
  })

  it('compensates an uploaded image when RPC creation fails', async () => {
    const rpcError = new Error('rpc failed')
    mocks.rpc.mockResolvedValue({ data: null, error: rpcError })
    const file = new File(['image'], 'memory.jpg', { type: 'image/jpeg' })

    await expect(
      recordsRepository.create({
        ...baseInput,
        file,
        entryType: 'photo',
      }),
    ).rejects.toBe(rpcError)
    expect(mocks.removeStoragePaths).toHaveBeenCalledWith(['trips/trip-1/record-uuid.jpg'])
  })

  it('preserves the RPC error and warns if compensation also fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const rpcError = new Error('rpc failed')
    const cleanupError = new Error('cleanup failed')
    mocks.rpc.mockResolvedValue({ data: null, error: rpcError })
    mocks.removeStoragePaths.mockRejectedValue(cleanupError)

    await expect(
      recordsRepository.create({
        ...baseInput,
        file: new File(['image'], 'memory.jpg', { type: 'image/jpeg' }),
        entryType: 'photo',
      }),
    ).rejects.toBe(rpcError)
    expect(warn).toHaveBeenCalledWith('记录写入失败，且无法清理已上传图片:', cleanupError)
    warn.mockRestore()
  })

  it('rejects a zero-row RPC response', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null })
    await expect(recordsRepository.create(baseInput)).rejects.toThrow('记录不存在或无权访问')
  })

  it('normalizes updates and rejects invalid or missing rows', async () => {
    const query = mutationQuery({ data: { id: 'p1' }, error: null })
    mocks.from.mockReturnValue(query)
    await recordsRepository.update('p1', { note: ' note ', city_name: ' 上海 ' })
    expect(query.update).toHaveBeenCalledWith({ note: 'note', city_name: '上海' })
    expect(query.select).toHaveBeenCalledWith(PHOTO_COLUMNS)

    await expect(recordsRepository.update('p1', { city_name: ' ' })).rejects.toThrow('城市不能为空')
    query.maybeSingle.mockResolvedValueOnce({ data: null, error: null })
    await expect(recordsRepository.update('missing', { note: 'x' })).rejects.toThrow(
      '记录不存在或无权访问',
    )
  })

  it('propagates update errors', async () => {
    const failure = new Error('update failed')
    mocks.from.mockReturnValue(mutationQuery({ data: null, error: failure }))
    await expect(recordsRepository.update('p1', {})).rejects.toBe(failure)
  })

  it('deletes the row before cleaning its image and tolerates cleanup failure', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const query = mutationQuery({ data: { id: 'p1', image_url: 'trips/t/p.jpg' }, error: null })
    mocks.from.mockReturnValue(query)
    mocks.removeStoragePaths.mockRejectedValueOnce(new Error('storage failed'))

    await expect(recordsRepository.delete('p1')).resolves.toBeUndefined()
    expect(query.delete).toHaveBeenCalled()
    expect(mocks.removeStoragePaths).toHaveBeenCalledWith(['trips/t/p.jpg'])
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('does not call Storage when a deleted row has no image', async () => {
    mocks.toStoragePath.mockReturnValueOnce(null)
    mocks.from.mockReturnValue(mutationQuery({ data: { id: 'p1', image_url: null }, error: null }))
    await recordsRepository.delete('p1')
    expect(mocks.removeStoragePaths).not.toHaveBeenCalled()
  })

  it('preserves the Storage object when a cover reference cannot be cleared', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const photoQuery = mutationQuery({
      data: { id: 'p1', trip_id: 'trip-1', image_url: 'trips/trip-1/p.jpg' },
      error: null,
    })
    const coverError = new Error('cover update failed')
    const coverQuery = {
      error: coverError,
      update: vi.fn(),
      eq: vi.fn(),
    }
    coverQuery.update.mockReturnValue(coverQuery)
    coverQuery.eq.mockReturnValue(coverQuery)
    mocks.from.mockReturnValueOnce(photoQuery).mockReturnValueOnce(coverQuery)

    await recordsRepository.delete('p1')

    expect(mocks.removeStoragePaths).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith('记录已删除，但无法清理旅行封面引用:', coverError)
    warn.mockRestore()
  })

  it('propagates delete errors and rejects a zero-row delete', async () => {
    const failure = new Error('delete failed')
    mocks.from.mockReturnValueOnce(mutationQuery({ data: null, error: failure }))
    await expect(recordsRepository.delete('p1')).rejects.toBe(failure)

    mocks.from.mockReturnValueOnce(mutationQuery({ data: null, error: null }))
    await expect(recordsRepository.delete('p1')).rejects.toThrow('记录不存在或无权访问')
  })
})
