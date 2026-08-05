import { supabase } from './supabase'

export const PHOTO_BUCKET = 'photos'
export const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24

export function isStoragePath(value: string | null | undefined): value is string {
  return !!value && !/^(?:https?:|data:|blob:)/i.test(value)
}

export async function signStoragePaths(
  paths: string[],
  expiresIn = SIGNED_URL_TTL_SECONDS,
): Promise<Map<string, string>> {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)))
  if (uniquePaths.length === 0) return new Map()

  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(uniquePaths, expiresIn)

  if (error) throw error

  const signedUrls = new Map<string, string>()
  data?.forEach((item) => {
    if (item.path && item.signedUrl) signedUrls.set(item.path, item.signedUrl)
  })
  return signedUrls
}

export async function removeStoragePaths(paths: string[]): Promise<void> {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)))
  if (uniquePaths.length === 0) return

  const { error } = await supabase.storage.from(PHOTO_BUCKET).remove(uniquePaths)
  if (error) throw error
}
