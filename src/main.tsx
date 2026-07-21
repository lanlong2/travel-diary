import { createRoot } from 'react-dom/client'
import '@fontsource-variable/noto-serif-sc'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
