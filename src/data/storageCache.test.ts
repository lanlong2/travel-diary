import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createSignedUrls: vi.fn(),
  remove: vi.fn(),
  getSession: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
    },
    storage: {
      from: vi.fn(() => ({
        createSignedUrls: mocks.createSignedUrls,
        remove: mocks.remove,
      })),
    },
  },
}))

import {
  clearPrivatePhotoCaches,
  invalidateSignedStoragePath,
  isStoragePath,
  LEGACY_PRIVATE_PHOTO_CACHES,
  removeStoragePaths,
  SIGNED_URL_CACHE_MS,
  signStoragePaths,
  toStoragePath,
} from '../lib/storage'

describe('private Storage URL cache', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mocks.createSignedUrls.mockImplementation(async (paths: string[]) => ({
      data: paths.map((path) => ({ path, signedUrl: `https://signed.test/${path}` })),
      error: null,
    }))
    mocks.remove.mockResolvedValue({ data: [], error: null })
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'session-user' } } },
      error: null,
    })
    await clearPrivatePhotoCaches()
  })

  it('normalizes raw paths and legacy public or signed Supabase URLs', () => {
    expect(isStoragePath('trips/t/a.jpg')).toBe(true)
    expect(isStoragePath('/trips/t/a.jpg')).toBe(true)
    expect(isStoragePath('https://example.test/a.jpg')).toBe(false)
    expect(isStoragePath('data:image/png;base64,x')).toBe(false)
    expect(isStoragePath(null)).toBe(false)
    expect(toStoragePath('/trips/t/a.jpg')).toBe('trips/t/a.jpg')
    expect(
      toStoragePath('https://project.supabase.co/storage/v1/object/public/photos/trips/t/a.jpg'),
    ).toBe('trips/t/a.jpg')
    expect(
      toStoragePath('https://project.supabase.co/storage/v1/object/sign/photos/a%20b.jpg?token=x'),
    ).toBe('a b.jpg')
    expect(toStoragePath('https://example.test/not-storage.jpg')).toBeNull()
    expect(toStoragePath('not a valid url://')).toBe('not a valid url://')
    expect(toStoragePath(undefined)).toBeNull()
  })

  it('short-circuits empty signing and resolves the current user when omitted', async () => {
    await expect(signStoragePaths(['https://cdn.test/external.jpg'])).resolves.toEqual(new Map())
    expect(mocks.getSession).not.toHaveBeenCalled()

    await signStoragePaths(['trips/t/a.jpg'])
    expect(mocks.getSession).toHaveBeenCalledOnce()
  })

  it('rejects session errors, signed URL errors and missing signed rows', async () => {
    const sessionError = new Error('session failed')
    mocks.getSession.mockResolvedValueOnce({ data: { session: null }, error: sessionError })
    await expect(signStoragePaths(['trips/t/a.jpg'])).rejects.toBe(sessionError)

    mocks.getSession.mockResolvedValueOnce({ data: { session: null }, error: null })
    await expect(signStoragePaths(['trips/t/a.jpg'])).rejects.toThrow('未登录')

    mocks.createSignedUrls.mockResolvedValueOnce({ data: null, error: new Error('sign failed') })
    await expect(signStoragePaths(['trips/t/a.jpg'], undefined, { userId: 'u' })).rejects.toThrow(
      'sign failed',
    )

    mocks.createSignedUrls.mockResolvedValueOnce({ data: [], error: null })
    await expect(signStoragePaths(['trips/t/a.jpg'], undefined, { userId: 'u' })).rejects.toThrow(
      '签名地址缺失',
    )
  })

  it('deduplicates input, honors short TTLs and invalidates a cached path', async () => {
    await signStoragePaths(
      ['trips/t/a.jpg', 'trips/t/a.jpg', 'https://cdn.test/external.jpg'],
      30,
      { userId: 'ttl-user' },
    )
    await signStoragePaths(['trips/t/a.jpg'], 30, { userId: 'ttl-user' })
    expect(mocks.createSignedUrls).toHaveBeenCalledTimes(2)

    await signStoragePaths(['trips/t/b.jpg'], undefined, { userId: 'cache-user' })
    await signStoragePaths(['trips/t/b.jpg'], undefined, { userId: 'cache-user' })
    expect(mocks.createSignedUrls).toHaveBeenCalledTimes(3)
    invalidateSignedStoragePath('trips/t/b.jpg')
    await signStoragePaths(['trips/t/b.jpg'], undefined, { userId: 'cache-user' })
    expect(mocks.createSignedUrls).toHaveBeenCalledTimes(4)
    invalidateSignedStoragePath('https://cdn.test/external.jpg')
  })

  it('checks abort signals before and after a signing request', async () => {
    const early = new AbortController()
    early.abort()
    await expect(
      signStoragePaths(['trips/t/a.jpg'], undefined, {
        userId: 'u',
        signal: early.signal,
      }),
    ).rejects.toThrow()

    const late = new AbortController()
    mocks.createSignedUrls.mockImplementationOnce(async (paths: string[]) => {
      late.abort()
      return { data: paths.map((path) => ({ path, signedUrl: `signed:${path}` })), error: null }
    })
    await expect(
      signStoragePaths(['trips/t/a.jpg'], undefined, {
        userId: 'late-user',
        signal: late.signal,
      }),
    ).rejects.toThrow()
  })

  it('removes unique normalized objects and invalidates signed URLs', async () => {
    await signStoragePaths(['trips/t/a.jpg'], undefined, { userId: 'remove-user' })
    await removeStoragePaths(['trips/t/a.jpg', '/trips/t/a.jpg', 'https://cdn.test/external.jpg'])
    expect(mocks.remove).toHaveBeenCalledWith(['trips/t/a.jpg'])
    await signStoragePaths(['trips/t/a.jpg'], undefined, { userId: 'remove-user' })
    expect(mocks.createSignedUrls).toHaveBeenCalledTimes(2)

    mocks.remove.mockClear()
    await removeStoragePaths(['https://cdn.test/external.jpg'])
    expect(mocks.remove).not.toHaveBeenCalled()
  })

  it('propagates Storage removal errors', async () => {
    mocks.remove.mockResolvedValueOnce({ data: null, error: new Error('remove failed') })
    await expect(removeStoragePaths(['trips/t/a.jpg'])).rejects.toThrow('remove failed')
  })

  it('deduplicates concurrent requests per user and isolates another user', async () => {
    const [first, second] = await Promise.all([
      signStoragePaths(['trips/t1/a.jpg'], undefined, { userId: 'user-a' }),
      signStoragePaths(['trips/t1/a.jpg'], undefined, { userId: 'user-a' }),
    ])

    expect(first.get('trips/t1/a.jpg')).toBe('https://signed.test/trips/t1/a.jpg')
    expect(second).toEqual(first)
    expect(mocks.createSignedUrls).toHaveBeenCalledTimes(1)

    await signStoragePaths(['trips/t1/a.jpg'], undefined, { userId: 'user-b' })
    expect(mocks.createSignedUrls).toHaveBeenCalledTimes(2)
    expect(SIGNED_URL_CACHE_MS).toBe(23 * 60 * 60 * 1000)
  })

  it('deletes the legacy browser cache on sign-out cleanup', async () => {
    const deleteCache = vi.fn(async () => true)
    vi.stubGlobal('caches', { delete: deleteCache })

    await clearPrivatePhotoCaches()

    expect(deleteCache).toHaveBeenCalledTimes(LEGACY_PRIVATE_PHOTO_CACHES.length)
    for (const cacheName of LEGACY_PRIVATE_PHOTO_CACHES) {
      expect(deleteCache).toHaveBeenCalledWith(cacheName)
    }
    vi.unstubAllGlobals()
  })
})
