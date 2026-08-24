import { createRoot } from 'react-dom/client'
import '@fontsource-variable/noto-serif-sc'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { supabase } from './lib/supabase'
import { clearPrivatePhotoCaches, invalidateSignedStoragePath } from './lib/storage'
import { onPrivatePhotoLoadError } from './lib/privatePhotoEvents'

onPrivatePhotoLoadError(invalidateSignedStoragePath)

// AuthProvider owns UI session state. This app-lifetime listener only owns
// private client caches, so sign-out cannot leak one user's URLs to another.
supabase.auth.onAuthStateChange((event) => {
  if (event !== 'SIGNED_OUT') return
  queryClient.clear()
  void clearPrivatePhotoCaches().catch((error) => {
    console.warn('退出后清理私有照片缓存失败:', error)
  })
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </QueryClientProvider>,
)
