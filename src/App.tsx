import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
      minHeight: '100vh', background: '#fefaf5',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 32, height: 32, margin: '0 auto 16px',
          border: '3px solid #f0d5c0', borderTopColor: '#e8755a',
          borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#8b7355' }}>加载中...</p>
      </div>
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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/trip/:id" element={<TripDetailPage />} />
        <Route path="/add" element={<AddRecordPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
