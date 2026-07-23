import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { Spinner } from './components/ui/Spinner'

// 路由级代码分割 — 按需加载页面（命名导出 → 默认导出适配）
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
)
const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage }))
)
const TripDetailPage = lazy(() =>
  import('./pages/TripDetailPage').then((m) => ({ default: m.TripDetailPage }))
)
const AddRecordPage = lazy(() =>
  import('./pages/AddRecordPage').then((m) => ({ default: m.AddRecordPage }))
)
const TripsPage = lazy(() =>
  import('./pages/TripsPage').then((m) => ({ default: m.TripsPage }))
)
const TimelinePage = lazy(() =>
  import('./pages/TimelinePage').then((m) => ({ default: m.TimelinePage }))
)

function PageLoader() {
  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'oklch(22% 0.035 45)',
      color: 'oklch(96% 0.02 70)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 40, height: 40, margin: '0 auto 20px' }}>
          <div style={{
            position: 'absolute', inset: 0,
            border: '2px solid oklch(58% 0.13 40 / 0.2)',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            border: '2px solid transparent',
            borderTopColor: 'oklch(68% 0.17 40)',
            borderRadius: '50%', animation: 'spin 1s linear infinite'
          }} />
        </div>
        <p style={{ color: 'oklch(80% 0.03 65 / 0.6)', fontSize: 11, letterSpacing: '0.04em' }}>加载中</p>
      </div>
    </div>
  )
}

/**
 * 路由过渡包装：每次 pathname 变化时，keyed div 强制重挂载，
 * 触发 animate-page-enter 动画（新页从下方 20px 滑入并淡入，250ms）。
 * 退出动画需要 framer-motion 才能流畅实现，此处先实现进入侧。
 */
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div
      key={location.pathname}
      className="animate-page-enter"
      style={{ animationDuration: '0.25s' }}
    >
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/trip/:id" element={<TripDetailPage />} />
        <Route path="/add" element={<AddRecordPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function AppContent() {
  const { session, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (!session) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    )
  }

  // 已登录 — 延迟加载页面路由
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatedRoutes />
    </Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}
