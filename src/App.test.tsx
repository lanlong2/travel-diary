import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: {
    session: null as null | { user: { id: string } },
    loading: false,
    initializationError: null as string | null,
  },
}))
vi.mock('./hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mocks.auth,
}))
vi.mock('./pages/LoginPage', () => ({ LoginPage: () => <div>login-page</div> }))
vi.mock('./pages/HomePage', () => ({ HomePage: () => <div>home-page</div> }))
vi.mock('./pages/TimelinePage', () => ({ TimelinePage: () => <div>timeline-page</div> }))
vi.mock('./pages/TripDetailPage', () => ({ TripDetailPage: () => <div>trip-page</div> }))
vi.mock('./pages/AddRecordPage', () => ({ AddRecordPage: () => <div>add-page</div> }))
vi.mock('./pages/TripsPage', () => ({ TripsPage: () => <div>trips-page</div> }))

import App from './App'

describe('App routing and auth gates', () => {
  beforeEach(() => {
    mocks.auth = { session: null, loading: false, initializationError: null }
    window.history.replaceState({}, '', '/')
  })

  it('shows the persistent loading and initialization failure states', () => {
    mocks.auth.loading = true
    const { rerender } = render(<App />)
    expect(screen.getByText('加载中')).toBeInTheDocument()

    mocks.auth.loading = false
    mocks.auth.initializationError = '连接超时'
    rerender(<App />)
    expect(screen.getByText('登录服务暂不可用')).toBeInTheDocument()
    expect(screen.getByText('连接超时')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新连接' })).toBeInTheDocument()
  })

  it('lazy-loads the login page for anonymous visitors', async () => {
    render(<App />)
    expect(await screen.findByText('login-page')).toBeInTheDocument()
  })

  it.each([
    ['/', 'home-page'],
    ['/timeline', 'timeline-page'],
    ['/trip/t1', 'trip-page'],
    ['/add', 'add-page'],
    ['/trips', 'trips-page'],
  ])('renders authenticated route %s', async (path, label) => {
    mocks.auth.session = { user: { id: 'u1' } }
    window.history.replaceState({}, '', path)
    render(<App />)
    expect(await screen.findByText(label)).toBeInTheDocument()
  })

  it('redirects an unknown authenticated path to home', async () => {
    mocks.auth.session = { user: { id: 'u1' } }
    window.history.replaceState({}, '', '/unknown')
    render(<App />)
    expect(await screen.findByText('home-page')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })
})
