import { useLocation, useNavigate } from 'react-router-dom'
import { Map, PlusCircle, Compass } from 'lucide-react'

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="h-px bg-gradient-to-r from-transparent via-warm-300/40 to-transparent" />
      <div className="bg-cream/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex justify-around items-end px-8 pt-3 pb-4">
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center gap-1 px-4 py-2 transition-all duration-300 ${
              isActive('/') ? 'text-caramel' : 'text-warm-300 hover:text-warm-400'
            }`}
          >
            <div className={`relative p-2 rounded-xl transition-colors ${isActive('/') ? 'bg-warm-100/80' : ''}`}>
              <Map className="w-6 h-6" />
              {isActive('/') && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-caramel" />
              )}
            </div>
            <span className="text-xs font-semibold tracking-wide">足迹</span>
          </button>

          <button
            onClick={() => navigate('/add')}
            className="flex flex-col items-center gap-1 -mt-5 group"
          >
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-warm-500 to-caramel rounded-2xl flex items-center justify-center shadow-lg shadow-warm-500/25 active:scale-90 transition-all duration-200 group-hover:shadow-xl group-hover:shadow-warm-500/30 group-hover:-translate-y-1">
              <PlusCircle className="w-8 h-8 text-white" fill="white" />
            </div>
            <span className="text-xs font-semibold text-warm-500 tracking-wide">记录</span>
          </button>

          <button
            onClick={() => navigate('/trips')}
            className={`flex flex-col items-center gap-1 px-4 py-2 transition-all duration-300 ${
              isActive('/trips') ? 'text-caramel' : 'text-warm-300 hover:text-warm-400'
            }`}
          >
            <div className={`relative p-2 rounded-xl transition-colors ${isActive('/trips') ? 'bg-warm-100/80' : ''}`}>
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold tracking-wide">我们</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
