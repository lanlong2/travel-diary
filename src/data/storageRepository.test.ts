import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ upload: vi.fn(), from: vi.fn() }))
vi.mock('../lib/supabase', () => ({
  supabase: { storage: { from: mocks.from } },
}))

import { createRecordId, uploadRecordImage } from './storageRepository'

describe('storageRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.from.mockReturnValue({ upload: mocks.upload })
    mocks.upload.mockResolvedValue({ data: {}, error: null })
  })

  it('uses crypto UUID when available and has a deterministic-format fallback', () => {
    const uuid =
      '00000000-0000-4000-8000-000000000001' as `${string}-${string}-${string}-${string}-${string}`
    const randomUUID = vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(uuid)
    expect(createRecordId()).toBe(uuid)
    randomUUID.mockRestore()

    const originalCrypto = globalThis.crypto
    vi.stubGlobal('crypto', undefined)
    vi.spyOn(Date, 'now').mockReturnValue(12345)
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(createRecordId()).toMatch(/^12345-[a-z0-9]+$/)
    vi.stubGlobal('crypto', originalCrypto)
    vi.restoreAllMocks()
  })

  it.each([
    ['image/avif', 'avif'],
    ['image/gif', 'gif'],
    ['image/heic', 'heic'],
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
    ['image/svg+xml', 'jpg'],
  ])('uploads %s to a canonical path with %s extension', async (mime, extension) => {
    const file = new File(['x'], 'upload', { type: mime })
    await expect(uploadRecordImage(file, 'trip-id', 'record-id')).resolves.toBe(
      `trips/trip-id/record-id.${extension}`,
    )
    expect(mocks.from).toHaveBeenCalledWith('photos')
    expect(mocks.upload).toHaveBeenCalledWith(`trips/trip-id/record-id.${extension}`, file, {
      cacheControl: '31536000',
      contentType: mime,
      upsert: false,
    })
  })

  it('rejects non-images and files larger than 15 MB before upload', async () => {
    await expect(
      uploadRecordImage(new File(['text'], 'readme.txt', { type: 'text/plain' }), 't', 'r'),
    ).rejects.toThrow('请选择图片文件')

    const oversized = new File(['x'], 'large.jpg', { type: 'image/jpeg' })
    Object.defineProperty(oversized, 'size', { value: 15 * 1024 * 1024 + 1 })
    await expect(uploadRecordImage(oversized, 't', 'r')).rejects.toThrow('图片不能超过 15 MB')
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it('surfaces the Storage upload message', async () => {
    mocks.upload.mockResolvedValue({ data: null, error: { message: 'bucket denied' } })
    await expect(
      uploadRecordImage(new File(['x'], 'photo.jpg', { type: 'image/jpeg' }), 't', 'r'),
    ).rejects.toThrow('bucket denied')
  })
})
