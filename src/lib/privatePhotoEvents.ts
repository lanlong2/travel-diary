const PRIVATE_PHOTO_LOAD_ERROR_EVENT = 'travel-diary:private-photo-load-error'

export function reportPrivatePhotoLoadError(path: string): void {
  if (typeof globalThis.dispatchEvent !== 'function' || typeof CustomEvent === 'undefined') return
  globalThis.dispatchEvent(
    new CustomEvent<string>(PRIVATE_PHOTO_LOAD_ERROR_EVENT, { detail: path }),
  )
}

export function onPrivatePhotoLoadError(listener: (path: string) => void): () => void {
  if (typeof globalThis.addEventListener !== 'function') return () => undefined

  const handleError = (event: Event) => {
    if (event instanceof CustomEvent && typeof event.detail === 'string') {
      listener(event.detail)
    }
  }
  globalThis.addEventListener(PRIVATE_PHOTO_LOAD_ERROR_EVENT, handleError)
  return () => globalThis.removeEventListener(PRIVATE_PHOTO_LOAD_ERROR_EVENT, handleError)
}
