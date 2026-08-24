import { describe, expect, it, vi } from 'vitest'
import { onPrivatePhotoLoadError, reportPrivatePhotoLoadError } from './privatePhotoEvents'

describe('private photo load events', () => {
  it('notifies active listeners synchronously and supports unsubscribe', () => {
    const listener = vi.fn()
    const unsubscribe = onPrivatePhotoLoadError(listener)

    reportPrivatePhotoLoadError('trips/trip-1/photo.jpg')
    expect(listener).toHaveBeenCalledWith('trips/trip-1/photo.jpg')

    unsubscribe()
    reportPrivatePhotoLoadError('trips/trip-1/after-unsubscribe.jpg')
    expect(listener).toHaveBeenCalledOnce()
  })
})
