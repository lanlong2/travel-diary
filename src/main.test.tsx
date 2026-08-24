import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  render: vi.fn(),
  createRoot: vi.fn(),
  onAuthStateChange: vi.fn(),
  authCallback: undefined as undefined | ((event: string) => void),
  clearQueries: vi.fn(),
  clearPrivatePhotoCaches: vi.fn(),
  invalidateSignedStoragePath: vi.fn(),
}))
vi.mock('react-dom/client', () => ({ createRoot: mocks.createRoot }))
vi.mock('./App', () => ({ default: () => <div>app</div> }))
vi.mock('./components/ui/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}))
vi.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))
vi.mock('./lib/queryClient', () => ({ queryClient: { clear: mocks.clearQueries } }))
vi.mock('./lib/storage', () => ({
  clearPrivatePhotoCaches: mocks.clearPrivatePhotoCaches,
  invalidateSignedStoragePath: mocks.invalidateSignedStoragePath,
}))
vi.mock('./lib/supabase', () => ({
  supabase: { auth: { onAuthStateChange: mocks.onAuthStateChange } },
}))

describe('application entrypoint', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    document.body.innerHTML = '<div id="root"></div>'
    mocks.createRoot.mockReturnValue({ render: mocks.render })
    mocks.onAuthStateChange.mockImplementation((callback) => {
      mocks.authCallback = callback
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    mocks.clearPrivatePhotoCaches.mockResolvedValue(undefined)
  })

  it('mounts the app and clears private client state only on sign-out', async () => {
    await import('./main')
    expect(mocks.createRoot).toHaveBeenCalledWith(document.getElementById('root'))
    expect(mocks.render).toHaveBeenCalledOnce()

    mocks.authCallback?.('TOKEN_REFRESHED')
    expect(mocks.clearQueries).not.toHaveBeenCalled()
    mocks.authCallback?.('SIGNED_OUT')
    await vi.waitFor(() => expect(mocks.clearPrivatePhotoCaches).toHaveBeenCalledOnce())
    expect(mocks.clearQueries).toHaveBeenCalledOnce()
  })

  it('warns without failing sign-out when browser cache cleanup rejects', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mocks.clearPrivatePhotoCaches.mockRejectedValue(new Error('cache unavailable'))
    await import('./main')
    mocks.authCallback?.('SIGNED_OUT')
    await vi.waitFor(() =>
      expect(warn).toHaveBeenCalledWith('退出后清理私有照片缓存失败:', expect.any(Error)),
    )
    expect(mocks.clearQueries).toHaveBeenCalledOnce()
    warn.mockRestore()
  })
})
