import { useCallback, useEffect, useRef, useState } from 'react'

export interface AsyncDataState<T> {
  data: T
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '未知错误'
}

/**
 * Shared async state for data hooks.
 *
 * Each refresh receives a monotonically increasing request id so a slower
 * response from an old trip/filter cannot overwrite the current view.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  initialData: T,
): AsyncDataState<T> {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    try {
      const nextData = await fetcher()
      if (requestId !== requestIdRef.current) return

      setData(nextData)
    } catch (nextError) {
      if (requestId !== requestIdRef.current) return
      setError(getErrorMessage(nextError))
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    void refresh()
    return () => {
      requestIdRef.current += 1
    }
  }, [refresh])

  return { data, loading, error, refresh }
}
