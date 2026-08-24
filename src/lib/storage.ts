import { supabase } from './supabase'

export const PHOTO_BUCKET = 'photos'
export const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24
export const SIGNED_URL_CACHE_MS = 23 * 60 * 60 * 1000
export const LEGACY_PRIVATE_PHOTO_CACHES = ['private-photo-cache', 'image-cache'] as const

interface CachedSignedUrl {
  url: string
  expiresAt: number
}

const signedUrlCache = new Map<string, CachedSignedUrl>()
const signedUrlRequests = new Map<string, Promise<string>>()
let cacheGeneration = 0

function cacheKey(userId: string, path: string) {
  return `${userId}\u0000${path}`
}

function decodeStoragePath(value: string): string | null {
  try {
    const url = new URL(value)
    const marker = `/storage/v1/object/`
    const markerIndex = url.pathname.indexOf(marker)
    if (markerIndex < 0) return null

    const objectPath = url.pathname.slice(markerIndex + marker.length)
    const prefixes = [`public/${PHOTO_BUCKET}/`, `sign/${PHOTO_BUCKET}/`]
    const prefix = prefixes.find((candidate) => objectPath.startsWith(candidate))
    return prefix ? decodeURIComponent(objectPath.slice(prefix.length)) : null
  } catch {
    return null
  }
}

export function isStoragePath(value: string | null | undefined): value is string {
  return !!value && !/^(?:https?:|data:|blob:)/i.test(value)
}

/** Returns a private bucket path for either a path or a legacy Supabase URL. */
export function toStoragePath(value: string | null | undefined): string | null {
  if (!value) return null
  if (isStoragePath(value)) return value.replace(/^\/+/, '')
  return decodeStoragePath(value)
}

async function getCacheUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!data.session?.user.id) throw new Error('未登录，无法读取私有照片')
  return data.session.user.id
}

export async function signStoragePaths(
  paths: string[],
  expiresIn = SIGNED_URL_TTL_SECONDS,
  options: { userId?: string; signal?: AbortSignal } = {},
): Promise<Map<string, string>> {
  const uniquePaths = Array.from(
    new Set(paths.map(toStoragePath).filter((path): path is string => path !== null)),
  )
  if (uniquePaths.length === 0) return new Map()
  options.signal?.throwIfAborted()

  const userId = options.userId ?? (await getCacheUserId())
  const requestGeneration = cacheGeneration
  const now = Date.now()
  const cacheTtlMs = Math.min(SIGNED_URL_CACHE_MS, Math.max(0, (expiresIn - 60) * 1000))
  const result = new Map<string, string>()
  const pending: Promise<void>[] = []
  const missing: string[] = []

  for (const path of uniquePaths) {
    const key = cacheKey(userId, path)
    const cached = signedUrlCache.get(key)
    if (cached && cached.expiresAt > now) {
      result.set(path, cached.url)
      continue
    }
    if (cached) signedUrlCache.delete(key)

    const activeRequest = signedUrlRequests.get(key)
    if (activeRequest) {
      pending.push(
        activeRequest.then((url) => {
          result.set(path, url)
        }),
      )
    } else {
      missing.push(path)
    }
  }

  if (missing.length > 0) {
    const batchRequest = supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUrls(missing, expiresIn)
      .then(({ data, error }) => {
        if (error) throw error

        const urls = new Map<string, string>()
        data?.forEach((item) => {
          if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl)
        })
        return urls
      })

    for (const path of missing) {
      const key = cacheKey(userId, path)
      const request: Promise<string> = batchRequest
        .then((urls) => {
          const url = urls.get(path)
          if (!url) throw new Error(`签名地址缺失: ${path}`)
          if (requestGeneration === cacheGeneration && cacheTtlMs > 0) {
            signedUrlCache.set(key, { url, expiresAt: Date.now() + cacheTtlMs })
          }
          return url
        })
        .finally(() => {
          if (signedUrlRequests.get(key) === request) signedUrlRequests.delete(key)
        })
      signedUrlRequests.set(key, request)
      pending.push(
        request.then((url) => {
          result.set(path, url)
        }),
      )
    }
  }

  await Promise.all(pending)
  options.signal?.throwIfAborted()
  return result
}

export async function removeStoragePaths(paths: string[]): Promise<void> {
  const uniquePaths = Array.from(
    new Set(paths.map(toStoragePath).filter((path): path is string => path !== null)),
  )
  if (uniquePaths.length === 0) return

  const { error } = await supabase.storage.from(PHOTO_BUCKET).remove(uniquePaths)
  if (error) throw error

  for (const path of uniquePaths) invalidateSignedStoragePath(path)
}

export function invalidateSignedStoragePath(path: string): void {
  const normalizedPath = toStoragePath(path)
  if (!normalizedPath) return
  for (const key of signedUrlCache.keys()) {
    if (key.endsWith(`\u0000${normalizedPath}`)) signedUrlCache.delete(key)
  }
}

/** Clears in-memory URLs and obsolete Workbox caches on sign-out. */
export async function clearPrivatePhotoCaches(): Promise<void> {
  cacheGeneration += 1
  signedUrlCache.clear()
  signedUrlRequests.clear()

  if (typeof globalThis.caches !== 'undefined') {
    await Promise.all(
      LEGACY_PRIVATE_PHOTO_CACHES.map((cacheName) => globalThis.caches.delete(cacheName)),
    )
  }
}
