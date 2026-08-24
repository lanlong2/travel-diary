import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  unsubscribe: vi.fn(),
  authCallback: undefined as undefined | ((event: string, session: unknown) => void),
}))
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
    },
  },
}))

import { AuthProvider, useAuth } from './useAuth'

const session = { access_token: 'token', user: { id: 'u1', email: 'member@test.local' } }

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.authCallback = undefined
    mocks.getSession.mockResolvedValue({ data: { session }, error: null })
    mocks.onAuthStateChange.mockImplementation((callback) => {
      mocks.authCallback = callback
      return { data: { subscription: { unsubscribe: mocks.unsubscribe } } }
    })
    mocks.signInWithPassword.mockResolvedValue({ data: {}, error: null })
    mocks.signOut.mockResolvedValue({ error: null })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  it('loads the initial session and reacts to auth events', async () => {
    const { result, unmount } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.session).toBe(session)
    expect(result.current.user).toBe(session.user)

    act(() => mocks.authCallback?.('SIGNED_OUT', null))
    expect(result.current.session).toBeNull()
    expect(result.current.initializationError).toBeNull()
    unmount()
    expect(mocks.unsubscribe).toHaveBeenCalledOnce()
  })

  it('reports initialization transport failures without creating a session', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: new Error('offline') })
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.initializationError).toContain('无法连接'))
    expect(result.current.user).toBeNull()
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('maps login results and transport failures to safe messages', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(result.current.signIn('a@test.local', 'pw')).resolves.toEqual({ error: null })
    mocks.signInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    })
    await expect(result.current.signIn('a@test.local', 'bad')).resolves.toEqual({
      error: '邮箱或密码错误',
    })
    mocks.signInWithPassword.mockResolvedValueOnce({ error: { message: 'rate limit' } })
    await expect(result.current.signIn('a@test.local', 'bad')).resolves.toEqual({
      error: '登录失败，请稍后重试',
    })
    mocks.signInWithPassword.mockRejectedValueOnce(new Error('offline'))
    await expect(result.current.signIn('a@test.local', 'pw')).resolves.toEqual({
      error: '无法连接登录服务，请检查网络后重试',
    })
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('signs out and clears exposed auth state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.session).toBe(session))
    await act(() => result.current.signOut())
    expect(mocks.signOut).toHaveBeenCalledOnce()
    expect(result.current.session).toBeNull()
    expect(result.current.user).toBeNull()
  })

  it('times out a stalled initialization request', async () => {
    vi.useFakeTimers()
    mocks.getSession.mockReturnValue(new Promise(() => undefined))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(() => vi.advanceTimersByTimeAsync(8000))
    expect(result.current.loading).toBe(false)
    expect(result.current.initializationError).toContain('响应超时')
    vi.useRealTimers()
  })

  it('requires the provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider')
  })
})
