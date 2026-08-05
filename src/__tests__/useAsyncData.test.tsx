import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAsyncData } from '../hooks/useAsyncData'

describe('useAsyncData', () => {
  it('keeps a slower response from replacing newer data', async () => {
    const resolvers: Array<(value: string) => void> = []

    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useAsyncData(
        () => new Promise<string>((resolve) => { resolvers.push(resolve) }),
        'initial',
      ),
      { initialProps: { value: 'old' } },
    )

    await waitFor(() => expect(resolvers).toHaveLength(1))
    rerender({ value: 'new' })
    await waitFor(() => expect(resolvers).toHaveLength(2))

    await act(async () => {
      resolvers[0]('old response')
      await Promise.resolve()
    })
    expect(result.current.data).toBe('initial')

    await act(async () => {
      resolvers[1]('new response')
      await Promise.resolve()
    })
    await waitFor(() => expect(result.current.data).toBe('new response'))
  })
})
