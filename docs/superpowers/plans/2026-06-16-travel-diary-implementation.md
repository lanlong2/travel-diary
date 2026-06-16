# 旅行日记 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private travel diary website with China map, photo upload, and shared password login for a couple.

**Architecture:** React SPA with Vite + TypeScript + Tailwind CSS frontend, Supabase backend (auth, database, file storage), 高德地图 JS API 2.0 for map, deployed on Vercel.

**Tech Stack:** React 19, Vite 6, TypeScript 5, Tailwind CSS 4, Supabase JS SDK, 高德地图 JS API 2.0, React Router 7, vite-plugin-pwa

---

## File Structure

```
travel-diary/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── public/
│   ├── favicon.svg
│   └── pwa-192x192.png
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── lib/
    │   ├── supabase.ts
    │   └── amap.ts
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useDaysCount.ts
    │   ├── useTrips.ts
    │   └── usePhotos.ts
    ├── components/
    │   ├── layout/
    │   │   ├── BottomNav.tsx
    │   │   └── PageShell.tsx
    │   ├── home/
    │   │   ├── DayCounter.tsx
    │   │   ├── ChinaMap.tsx
    │   │   ├── CityPopup.tsx
    │   │   └── TripCard.tsx
    │   ├── trip/
    │   │   ├── TripHeader.tsx
    │   │   ├── RouteMap.tsx
    │   │   ├── PhotoGrid.tsx
    │   │   └── PhotoModal.tsx
    │   ├── add/
    │   │   ├── PhotoUploader.tsx
    │   │   ├── CitySelector.tsx
    │   │   ├── TripSelect.tsx
    │   │   └── NoteInput.tsx
    │   └── ui/
    │       ├── Button.tsx
    │       ├── Input.tsx
    │       ├── Modal.tsx
    │       ├── Toast.tsx
    │       └── Spinner.tsx
    ├── pages/
    │   ├── HomePage.tsx
    │   ├── TripDetailPage.tsx
    │   ├── AddRecordPage.tsx
    │   └── LoginPage.tsx
    ├── types/
    │   └── index.ts
    └── vite-env.d.ts
```

---

### Task 1: Scaffold Vite + React + TypeScript Project

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `postcss.config.js`, `tailwind.config.ts`, `src/main.tsx`, `src/index.css`, `src/vite-env.d.ts`, `.env.example`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "travel-diary",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.5",
    "lucide-react": "^0.474.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vite": "^6.1.0",
    "vite-plugin-pwa": "^0.21.1"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd /c/Users/35081/Desktop/travel-diary && npm install
```

- [ ] **Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#fefaf5" />
    <meta name="description" content="我们的旅行日记" />
    <link rel="apple-touch-icon" href="/pwa-192x192.png" />
    <title>我们的旅程</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.png'],
      manifest: {
        name: '我们的旅程',
        short_name: '旅程',
        description: '我们的旅行日记',
        theme_color: '#fefaf5',
        background_color: '#fefaf5',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
```

- [ ] **Step 5: Create tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

Create `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#fefaf5',
        warm: {
          50: '#fefaf5',
          100: '#fef0e6',
          200: '#fde8da',
          300: '#f0d5c0',
          400: '#e8c8a8',
          DEFAULT: '#e8755a',
          500: '#e8755a',
          600: '#d4845a',
          700: '#c44d34',
          800: '#a0402a',
          900: '#5c3d2e',
        },
        wood: '#8b7355',
        caramel: '#c44d34',
        blush: '#f4a460',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 8: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap');

@layer base {
  body {
    @apply bg-cream font-serif text-warm-900 antialiased;
    -webkit-tap-highlight-color: transparent;
  }
}

@layer components {
  .paper-texture {
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(180, 150, 120, 0.02) 2px,
        rgba(180, 150, 120, 0.02) 4px
      );
  }

  .warm-card {
    @apply bg-cream rounded-2xl border border-warm-300 shadow-sm;
  }

  .warm-btn {
    @apply px-6 py-3 rounded-2xl font-medium
           transition-all duration-200 active:scale-95;
  }

  .warm-btn-primary {
    @apply warm-btn bg-warm-500 text-white
           shadow-lg shadow-warm-500/20
           hover:bg-warm-700;
  }
}
```

- [ ] **Step 9: Create src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 10: Create .env.example**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AMAP_KEY=your-amap-key
VITE_AMAP_SECRET=your-amap-secret  # for JS API security
```

- [ ] **Step 11: Verify build works**

```bash
cd /c/Users/35081/Desktop/travel-diary && npm run build
```

Expected: Build succeeds with mostly empty app (no pages yet).

- [ ] **Step 12: Commit**

```bash
git add -A && git commit -m "chore: scaffold Vite + React + TypeScript + Tailwind project"
```

---

### Task 2: TypeScript Types + Supabase Client + AMap Loader

**Files:**
- Create: `src/types/index.ts`, `src/lib/supabase.ts`, `src/lib/amap.ts`

- [ ] **Step 1: Create src/types/index.ts**

```typescript
export interface Trip {
  id: string
  title: string
  cover_photo: string | null
  start_date: string
  end_date: string
  created_by: '我' | '她'
  created_at: string
}

export interface TripCity {
  id: string
  trip_id: string
  city_name: string
  lat: number
  lng: number
  sort_order: number
}

export interface Photo {
  id: string
  trip_id: string
  city_name: string
  image_url: string
  note: string
  author: '我' | '她'
  created_at: string
}

export interface CitySummary {
  city_name: string
  visit_count: number
  photo_count: number
  latest_photo: string | null
  lat: number
  lng: number
  trips: string[]
}
```

- [ ] **Step 2: Create src/lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
```

- [ ] **Step 3: Create src/lib/amap.ts**

```typescript
const AMAP_KEY = import.meta.env.VITE_AMAP_KEY
const AMAP_SECRET = import.meta.env.VITE_AMAP_SECRET

type AMapLoaderCallback = (AMap: typeof window.AMap) => void

declare global {
  interface Window {
    AMap: typeof window.AMap & { _key?: string }
    _AMapSecurityConfig: { securityJsCode: string }
    onLoadQueue: AMapLoaderCallback[]
    _amap_init_load: () => void
  }
}

// 高德地图 JS API 2.0 loader
export function loadAMap(): Promise<typeof window.AMap> {
  return new Promise((resolve, reject) => {
    if (window.AMap && window.AMap._key === AMAP_KEY) {
      resolve(window.AMap)
      return
    }

    if (!window._amap_init_load) {
      window._AMapSecurityConfig = { securityJsCode: AMAP_SECRET || '' }
      window.onLoadQueue = window.onLoadQueue || []

      window._amap_init_load = () => {
        window.AMap._key = AMAP_KEY
        while (window.onLoadQueue.length) {
          window.onLoadQueue.shift()!(window.AMap)
        }
      }

      const script = document.createElement('script')
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&callback=_amap_init_load`
      script.async = true
      script.onerror = () => reject(new Error('Failed to load AMap'))
      document.head.appendChild(script)
    }

    window.onLoadQueue.push((AMap) => resolve(AMap))
  })
}

// 注册高德安全密钥 (JS API v2.0 必须)
export function initAMapSecurity() {
  if (AMAP_SECRET) {
    window._AMapSecurityConfig = {
      securityJsCode: AMAP_SECRET,
    }
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types src/lib && git commit -m "feat: add types, Supabase client, and AMap loader"
```

---

### Task 3: Supabase Database Migration

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create migration SQL**

```sql
-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover_photo TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by TEXT NOT NULL CHECK (created_by IN ('我', '她')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create trip_cities table
CREATE TABLE IF NOT EXISTS trip_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL CHECK (author IN ('我', '她')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- RLS policies: authenticated users can do everything
CREATE POLICY "Authenticated users can read trips"
  ON trips FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert trips"
  ON trips FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update trips"
  ON trips FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete trips"
  ON trips FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read trip_cities"
  ON trip_cities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert trip_cities"
  ON trip_cities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update trip_cities"
  ON trip_cities FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete trip_cities"
  ON trip_cities FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read photos"
  ON photos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert photos"
  ON photos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update photos"
  ON photos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete photos"
  ON photos FOR DELETE TO authenticated USING (true);

-- Storage RLS: authenticated users can read/write photos bucket
CREATE POLICY "Authenticated users can read photos bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can insert photos bucket"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Authenticated users can delete photos bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'photos');
```

- [ ] **Step 2: Run migration in Supabase Dashboard**

Open Supabase Dashboard → SQL Editor → paste and run the SQL above.

- [ ] **Step 3: Verify tables exist**

In Supabase Dashboard → Table Editor, verify `trips`, `trip_cities`, `photos` tables exist.
In Storage, verify `photos` bucket exists.

- [ ] **Step 4: Create shared account**

In Supabase Dashboard → Authentication → Users → Add User:
- Email: `us@journey.app` (or any shared email)
- Password: [shared password you choose]
- Check "Auto Confirm User"

- [ ] **Step 5: Commit**

```bash
git add supabase && git commit -m "feat: add Supabase migration and RLS policies"
```

---

### Task 4: UI Components (Button, Input, Modal, Toast, Spinner)

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Modal.tsx`, `src/components/ui/Toast.tsx`, `src/components/ui/Spinner.tsx`

- [ ] **Step 1: Create src/components/ui/Button.tsx**

```tsx
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'warm-btn inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-warm-500 text-white shadow-lg shadow-warm-500/20 hover:bg-warm-700',
    secondary: 'bg-warm-100 text-warm-700 border border-warm-300 hover:bg-warm-200',
    ghost: 'text-warm-600 hover:bg-warm-100',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Create src/components/ui/Input.tsx**

```tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: LucideIcon
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-warm-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
          )}
          <input
            ref={ref}
            className={`w-full bg-white border border-warm-300 rounded-2xl
              py-3 ${Icon ? 'pl-10' : 'pl-4'} pr-4
              text-warm-900 placeholder:text-warm-300
              focus:outline-none focus:ring-2 focus:ring-warm-500/30 focus:border-warm-500
              transition-all duration-200
              ${error ? 'border-red-400 focus:ring-red-400/30' : ''}
              ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

- [ ] **Step 3: Create src/components/ui/Modal.tsx**

```tsx
import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-cream rounded-3xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-warm-200">
          {title && <h2 className="text-lg font-semibold text-warm-900">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-warm-100 transition-colors"
          >
            <X className="w-5 h-5 text-warm-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create src/components/ui/Toast.tsx**

```tsx
import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg
        transition-all duration-300
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}
    >
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 rounded-lg hover:bg-black/5">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Create src/components/ui/Spinner.tsx**

```tsx
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-3 border-warm-200 border-t-warm-500 rounded-full animate-spin" />
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ui && git commit -m "feat: add UI components (Button, Input, Modal, Toast, Spinner)"
```

---

### Task 5: Auth Hook + Login Page

**Files:**
- Create: `src/hooks/useAuth.ts`, `src/pages/LoginPage.tsx`

- [ ] **Step 1: Create src/hooks/useAuth.ts**

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: error.message === 'Invalid login credentials'
        ? '邮箱或密码错误' : error.message }
    }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

- [ ] **Step 2: Create src/pages/LoginPage.tsx**

```tsx
import { useState, FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Heart, Mail, Lock } from 'lucide-react'

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError(signInError)
      setLoading(false)
    } else {
      onLogin()
    }
  }

  return (
    <div className="min-h-screen bg-cream paper-texture flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-warm-100 mb-4">
            <Heart className="w-10 h-10 text-warm-500" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-warm-900">我们的旅程</h1>
          <p className="text-warm-400 mt-2 text-sm">记录一起走过的每一步</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="邮箱"
            icon={Mail}
            type="email"
            placeholder="输入共享邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="密码"
            icon={Lock}
            type="password"
            placeholder="输入共享密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? '登录中...' : '进入我们的世界'}
          </Button>
        </form>

        <p className="text-center text-xs text-warm-300 mt-8">
          💕 专属于我们的私人空间
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAuth.ts src/pages/LoginPage.tsx && git commit -m "feat: add auth hook and login page"
```

---

### Task 6: Home Page Components (DayCounter, AMap, CityPopup, TripCard)

**Files:**
- Create: `src/hooks/useDaysCount.ts`, `src/components/home/DayCounter.tsx`, `src/components/home/ChinaMap.tsx`, `src/components/home/CityPopup.tsx`, `src/components/home/TripCard.tsx`, `src/components/layout/BottomNav.tsx`, `src/components/layout/PageShell.tsx`

- [ ] **Step 1: Create src/hooks/useDaysCount.ts**

```typescript
import { useState, useEffect } from 'react'

const START_DATE = new Date('2024-11-08')

export function useDaysCount() {
  const [days, setDays] = useState(0)

  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const diff = now.getTime() - START_DATE.getTime()
      setDays(Math.floor(diff / (1000 * 60 * 60 * 24)))
    }
    calc()
    const timer = setInterval(calc, 60 * 60 * 1000) // update every hour
    return () => clearInterval(timer)
  }, [])

  return days
}
```

- [ ] **Step 2: Create src/components/home/DayCounter.tsx**

```tsx
import { useDaysCount } from '../../hooks/useDaysCount'

export function DayCounter() {
  const days = useDaysCount()

  return (
    <div className="mx-4 mt-3 p-4 bg-gradient-to-br from-warm-100 to-warm-200 rounded-2xl border border-warm-300 relative overflow-hidden">
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-warm-500/8" />
      <div className="relative z-10 flex items-center gap-3">
        <span className="text-3xl animate-pulse" style={{ animationDuration: '2s' }}>💕</span>
        <div>
          <p className="text-xs text-warm-400 tracking-widest">我们在一起</p>
          <p className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-caramel">{days}</span>
            <span className="text-sm text-warm-500">天</span>
          </p>
          <p className="text-[10px] text-wood/60 mt-0.5">从 2024 年 11 月 8 日开始</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create src/components/home/ChinaMap.tsx**

```tsx
import { useEffect, useRef, useState, useCallback } from 'react'
import { loadAMap } from '../../lib/amap'
import { CitySummary } from '../../types'
import { CityPopup } from './CityPopup'

interface ChinaMapProps {
  cities: CitySummary[]
  onCityClick: (city: CitySummary) => void
}

export function ChinaMap({ cities, onCityClick }: ChinaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const markersRef = useRef<unknown[]>([])
  const [selectedCity, setSelectedCity] = useState<CitySummary | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  const clearMarkers = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current as { clearMap: () => void }
      map.clearMap()
    }
    markersRef.current = []
  }, [])

  useEffect(() => {
    if (!containerRef.current || loaded) return

    loadAMap()
      .then((AMap) => {
        if (!containerRef.current) return

        const map = new AMap.Map(containerRef.current, {
          zoom: 4.5,
          center: [104.0, 35.0], // China center
          mapStyle: 'amap://styles/light',
          resizeEnable: true,
          dragEnable: true,
          zoomEnable: true,
          touchZoom: true,
        })

        // Custom warm style
        map.setFeatures(['bg', 'road', 'building', 'point'])

        mapRef.current = map
        setLoaded(true)
      })
      .catch((err) => {
        setError('地图加载失败，请检查网络连接')
        console.error('AMap load error:', err)
      })
  }, [loaded])

  // Update markers when cities change
  useEffect(() => {
    if (!loaded || !mapRef.current) return

    const addMarkers = async () => {
      const AMap = await loadAMap()
      clearMarkers()

      const map = mapRef.current as {
        add: (marker: unknown) => void
        setFitView: (overlays: unknown[]) => void
      }

      const markers = cities.map((city) => {
        const content = document.createElement('div')
        content.className = 'city-marker-container'
        content.innerHTML = `
          <div style="
            width: 14px; height: 14px;
            background: linear-gradient(135deg, #e8755a, #c44d34);
            border: 2px solid #fff;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(196,77,52,0.3);
            cursor: pointer;
          "></div>
          <div style="
            position: absolute; top: -24px; left: 50%; transform: translateX(-50%);
            background: rgba(255,250,245,0.92); padding: 2px 8px;
            border-radius: 8px; font-size: 10px; color: #5c3d2e;
            white-space: nowrap; font-weight: 600;
            pointer-events: none;
          ">${city.city_name}</div>
        `

        const marker = new AMap.Marker({
          position: [city.lng, city.lat],
          content: content,
          offset: new AMap.Pixel(-7, -7),
        })

        marker.on('click', () => {
          setSelectedCity(city)
          onCityClick(city)
        })

        return marker
      })

      markersRef.current = markers
      markers.forEach((m: unknown) => map.add(m))

      if (markers.length > 0) {
        map.setFitView(markers)
      }
    }

    addMarkers()
  }, [cities, loaded, clearMarkers, onCityClick])

  return (
    <div className="mx-4 mt-3 rounded-2xl overflow-hidden border-2 border-warm-200 shadow-sm relative" style={{ height: '55vh' }}>
      {error ? (
        <div className="flex items-center justify-center h-full bg-warm-50 text-warm-400 text-sm">
          {error}
        </div>
      ) : !loaded ? (
        <div className="flex items-center justify-center h-full bg-warm-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-warm-200 border-t-warm-500 rounded-full animate-spin" />
            <span className="text-sm text-warm-400">加载地图中...</span>
          </div>
        </div>
      ) : null}
      <div ref={containerRef} className="w-full h-full" style={{ display: loaded ? 'block' : 'none' }} />

      {selectedCity && (
        <CityPopup
          city={selectedCity}
          onClose={() => setSelectedCity(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create src/components/home/CityPopup.tsx**

```tsx
import { ArrowRight } from 'lucide-react'
import { CitySummary } from '../../types'

interface CityPopupProps {
  city: CitySummary
  onClose: () => void
}

export function CityPopup({ city, onClose }: CityPopupProps) {
  return (
    <div className="absolute bottom-4 left-3 right-3 bg-cream/95 backdrop-blur-sm rounded-2xl p-4 border border-warm-200 shadow-lg animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blush to-warm-500 flex items-center justify-center text-2xl flex-shrink-0 border-2 border-warm-100">
          📍
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-warm-900">{city.city_name}</h4>
          <div className="flex gap-4 mt-1 text-xs text-wood">
            <span>去过 {city.visit_count} 次</span>
            <span>📸 {city.photo_count} 张照片</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center hover:bg-warm-200 transition-colors flex-shrink-0"
        >
          <ArrowRight className="w-4 h-4 text-warm-500" />
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create src/components/home/TripCard.tsx**

```tsx
import { Trip } from '../../types'

interface TripCardProps {
  trip: Trip
  cityCount: number
  onClick: () => void
}

export function TripCard({ trip, cityCount, onClick }: TripCardProps) {
  const dateStr = new Date(trip.start_date).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'numeric', day: 'numeric'
  })

  const gradients = [
    'from-blush to-warm-500',
    'from-amber-300 to-orange-400',
    'from-emerald-300 to-teal-500',
    'from-sky-300 to-blue-500',
    'from-violet-300 to-purple-500',
  ]

  const gradient = gradients[Math.abs(trip.title.charCodeAt(0)) % gradients.length]

  return (
    <div
      onClick={onClick}
      className="min-w-[150px] bg-cream rounded-2xl overflow-hidden border border-warm-200 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
    >
      <div className={`h-24 bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl relative`}>
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/85 rounded-lg text-[10px] text-warm-700 tracking-wider">
          {new Date(trip.start_date).getFullYear()}·{new Date(trip.start_date).toLocaleDateString('zh-CN', { month: 'short' })}
        </div>
        <span>🗺️</span>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm text-warm-900 truncate">{trip.title}</h4>
        <p className="text-xs text-wood mt-1">
          {dateStr} · {cityCount} 个城市
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create src/components/layout/PageShell.tsx**

```tsx
import { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface PageShellProps {
  children: ReactNode
  hideNav?: boolean
}

export function PageShell({ children, hideNav = false }: PageShellProps) {
  return (
    <div className="min-h-screen bg-cream paper-texture pb-20">
      <div className="max-w-lg mx-auto">
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  )
}
```

- [ ] **Step 7: Create src/components/layout/BottomNav.tsx**

```tsx
import { useLocation, useNavigate } from 'react-router-dom'
import { Map, BookOpen, PlusCircle, MessageCircle, Settings } from 'lucide-react'

const navItems = [
  { path: '/', label: '足迹', icon: Map },
  { path: '/trips', label: '旅行', icon: BookOpen },
  { path: '/add', label: '', icon: PlusCircle, isCenter: true },
  { path: '/messages', label: '留言', icon: MessageCircle },
  { path: '/settings', label: '设置', icon: Settings },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream/90 backdrop-blur-md border-t border-warm-200 z-40">
      <div className="max-w-lg mx-auto flex justify-around items-center px-4 py-2">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 -mt-5"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-warm-500 to-caramel rounded-full flex items-center justify-center shadow-lg shadow-warm-500/30 active:scale-90 transition-transform">
                  <PlusCircle className="w-8 h-8 text-white" fill="white" />
                </div>
              </button>
            )
          }

          const active = isActive(item.path)
          const Icon = item.icon

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                active ? 'text-warm-500' : 'text-warm-300'
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? 'fill-warm-100' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useDaysCount.ts src/components/home src/components/layout && git commit -m "feat: add home page components and bottom navigation"
```

---

### Task 7: Trip Detail Page Components

**Files:**
- Create: `src/hooks/useTrips.ts`, `src/hooks/usePhotos.ts`, `src/components/trip/TripHeader.tsx`, `src/components/trip/RouteMap.tsx`, `src/components/trip/PhotoGrid.tsx`, `src/components/trip/PhotoModal.tsx`

- [ ] **Step 1: Create src/hooks/useTrips.ts**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Trip, TripCity } from '../types'

export function useTrips() {
  const [trips, setTrips] = useState<(Trip & { cities: TripCity[] })[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTrips = useCallback(async () => {
    const { data: tripsData, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .order('start_date', { ascending: false })

    if (tripsError) {
      console.error('Error fetching trips:', tripsError)
      setLoading(false)
      return
    }

    const tripsWithCities = await Promise.all(
      (tripsData || []).map(async (trip) => {
        const { data: cities } = await supabase
          .from('trip_cities')
          .select('*')
          .eq('trip_id', trip.id)
          .order('sort_order', { ascending: true })

        return { ...trip, cities: cities || [] }
      })
    )

    setTrips(tripsWithCities)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  const createTrip = async (trip: Omit<Trip, 'id' | 'created_at'>, cities: Omit<TripCity, 'id' | 'trip_id'>[]) => {
    const { data: newTrip, error } = await supabase
      .from('trips')
      .insert(trip)
      .select()
      .single()

    if (error) throw error

    if (cities.length > 0) {
      const { error: citiesError } = await supabase
        .from('trip_cities')
        .insert(cities.map((c, i) => ({ ...c, trip_id: newTrip.id, sort_order: i })))

      if (citiesError) throw citiesError
    }

    await fetchTrips()
    return newTrip
  }

  const deleteTrip = async (id: string) => {
    const { error } = await supabase.from('trips').delete().eq('id', id)
    if (error) throw error
    await fetchTrips()
  }

  return { trips, loading, createTrip, deleteTrip, refresh: fetchTrips }
}

export function useTrip(id: string) {
  const [trip, setTrip] = useState<(Trip & { cities: TripCity[] }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchTrip = async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single()

      if (error) { setLoading(false); return }

      const { data: cities } = await supabase
        .from('trip_cities')
        .select('*')
        .eq('trip_id', id)
        .order('sort_order', { ascending: true })

      setTrip({ ...data, cities: cities || [] })
      setLoading(false)
    }
    fetchTrip()
  }, [id])

  return { trip, loading }
}
```

- [ ] **Step 2: Create src/hooks/usePhotos.ts**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Photo } from '../types'

export function usePhotos(tripId?: string) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPhotos = useCallback(async () => {
    let query = supabase.from('photos').select('*').order('created_at', { ascending: false })
    if (tripId) {
      query = query.eq('trip_id', tripId)
    }
    const { data, error } = await query
    if (error) console.error('Error fetching photos:', error)
    else setPhotos(data || [])
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const uploadPhoto = async (file: File, tripId: string, cityName: string, note: string, author: '我' | '她') => {
    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    // Create database record
    const { data, error } = await supabase
      .from('photos')
      .insert({
        trip_id: tripId,
        city_name: cityName,
        image_url: urlData.publicUrl,
        note,
        author,
      })
      .select()
      .single()

    if (error) throw error
    await fetchPhotos()
    return data
  }

  const deletePhoto = async (id: string) => {
    const { error } = await supabase.from('photos').delete().eq('id', id)
    if (error) throw error
    await fetchPhotos()
  }

  return { photos, loading, uploadPhoto, deletePhoto, refresh: fetchPhotos }
}
```

- [ ] **Step 3: Create src/components/trip/TripHeader.tsx**

```tsx
import { ArrowLeft } from 'lucide-react'
import { Trip } from '../../types'
import { useNavigate } from 'react-router-dom'

interface TripHeaderProps {
  trip: Trip
}

export function TripHeader({ trip }: TripHeaderProps) {
  const navigate = useNavigate()
  const startStr = new Date(trip.start_date).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  const endStr = new Date(trip.end_date).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="relative h-56 bg-gradient-to-b from-warm-200 to-warm-50 overflow-hidden">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm z-10"
      >
        <ArrowLeft className="w-5 h-5 text-warm-700" />
      </button>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl mb-3">🗺️</div>
        <h1 className="text-2xl font-bold text-warm-900">{trip.title}</h1>
        <p className="text-sm text-wood mt-1">
          {startStr} — {endStr}
        </p>
        <p className="text-xs text-warm-400 mt-1">
          {trip.created_by}创建的旅行
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create src/components/trip/RouteMap.tsx**

```tsx
import { useEffect, useRef, useState } from 'react'
import { loadAMap } from '../../lib/amap'
import { TripCity } from '../../types'

interface RouteMapProps {
  cities: TripCity[]
}

export function RouteMap({ cities }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (cities.length === 0 || !containerRef.current || loaded) return

    loadAMap().then((AMap) => {
      if (!containerRef.current) return

      const map = new AMap.Map(containerRef.current, {
        zoom: 8,
        center: [cities[0].lng, cities[0].lat],
        mapStyle: 'amap://styles/light',
        resizeEnable: true,
        dragEnable: false,
        zoomEnable: false,
        scrollWheel: false,
      })

      // Add markers
      const markers = cities.map((city, i) => {
        const marker = new AMap.Marker({
          position: [city.lng, city.lat],
          label: {
            content: `<div style="background:#e8755a;color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.2)">${i + 1}</div>`,
            offset: new AMap.Pixel(-11, -11),
          },
        })
        return marker
      })

      // Draw route line
      if (cities.length > 1) {
        const path = cities.map((c) => [c.lng, c.lat] as [number, number])
        const polyline = new AMap.Polyline({
          path,
          strokeColor: '#e8755a',
          strokeWeight: 3,
          strokeStyle: 'dashed',
          lineJoin: 'round',
          strokeOpacity: 0.8,
          showDir: true,
        })

        map.add(polyline)
      }

      markers.forEach((m) => map.add(m))
      map.setFitView(markers.length > 0 ? markers : undefined, false, [60, 60, 60, 60])
      setLoaded(true)
    })
  }, [cities, loaded])

  if (cities.length === 0) {
    return (
      <div className="mx-4 p-6 bg-warm-50 rounded-2xl text-center text-sm text-warm-400">
        暂无路线信息
      </div>
    )
  }

  return (
    <div className="mx-4">
      <h3 className="text-sm font-semibold text-warm-700 mb-2">🗺️ 旅行路线</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        {cities.map((city, i) => (
          <span key={city.id} className="text-xs px-2 py-1 bg-warm-100 rounded-lg text-warm-700">
            {i + 1}. {city.city_name}
          </span>
        ))}
      </div>
      <div ref={containerRef} className="w-full h-48 rounded-2xl overflow-hidden border border-warm-200" />
    </div>
  )
}
```

- [ ] **Step 5: Create src/components/trip/PhotoGrid.tsx**

```tsx
import { Photo } from '../../types'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="mx-4 py-12 text-center">
        <div className="text-4xl mb-3">📸</div>
        <p className="text-sm text-warm-400">还没有照片</p>
        <p className="text-xs text-warm-300 mt-1">点击下方按钮添加你们的第一张回忆</p>
      </div>
    )
  }

  return (
    <div className="mx-4">
      <h3 className="text-sm font-semibold text-warm-700 mb-3">📸 回忆</h3>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => onPhotoClick(photo)}
            className="aspect-square rounded-xl overflow-hidden bg-warm-100 cursor-pointer active:scale-95 transition-transform relative"
          >
            <img
              src={photo.image_url}
              alt={photo.note || photo.city_name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Show placeholder on error
                (e.target as HTMLImageElement).style.display = 'none'
                ;(e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center')
                ;(e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-2xl">🖼️</span>'
              }}
            />
            {photo.note && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                <p className="text-white text-[10px] truncate">{photo.note}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create src/components/trip/PhotoModal.tsx**

```tsx
import { Photo } from '../../types'

interface PhotoModalProps {
  photo: Photo
  onClose: () => void
}

export function PhotoModal({ photo, onClose }: PhotoModalProps) {
  const dateStr = new Date(photo.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-10"
        onClick={(e) => { e.stopPropagation(); onClose() }}
      >
        ✕
      </button>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.image_url}
          alt={photo.note || photo.city_name}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      {/* Info bar */}
      <div
        className="bg-cream/95 backdrop-blur-md rounded-t-3xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-warm-900">📍 {photo.city_name}</span>
          <span className="text-xs text-warm-400">{dateStr}</span>
        </div>
        {photo.note && (
          <p className="text-warm-700 text-sm leading-relaxed">"{photo.note}"</p>
        )}
        <p className="text-xs text-warm-400 mt-2">— {photo.author === '我' ? '💙 我' : '💗 她'}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useTrips.ts src/hooks/usePhotos.ts src/components/trip && git commit -m "feat: add trip detail components and data hooks"
```

---

### Task 8: Add Record Page Components

**Files:**
- Create: `src/components/add/PhotoUploader.tsx`, `src/components/add/CitySelector.tsx`, `src/components/add/TripSelect.tsx`, `src/components/add/NoteInput.tsx`

- [ ] **Step 1: Create src/components/add/PhotoUploader.tsx**

```tsx
import { useRef, useState } from 'react'
import { Camera, Image as ImageIcon } from 'lucide-react'

interface PhotoUploaderProps {
  onFileSelect: (file: File) => void
}

export function PhotoUploader({ onFileSelect }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = (file: File) => {
    onFileSelect(file)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="mx-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden">
          <img src={preview} alt="预览" className="w-full h-64 object-cover" />
          <button
            onClick={() => { setPreview(null); inputRef.current?.click() }}
            className="absolute bottom-3 right-3 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-sm text-warm-700 shadow-sm"
          >
            换一张
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-warm-300 rounded-2xl p-8 text-center cursor-pointer hover:border-warm-500 transition-colors"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warm-100 mb-3">
            <Camera className="w-8 h-8 text-warm-500" />
          </div>
          <p className="text-sm text-warm-500 font-medium">点击拍照或选择照片</p>
          <p className="text-xs text-warm-300 mt-1">
            <ImageIcon className="w-3 h-3 inline mr-1" />
            支持所有图片格式
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/add/CitySelector.tsx**

```tsx
import { useState, useRef, useEffect } from 'react'
import { loadAMap } from '../../lib/amap'
import { Search, MapPin, Navigation } from 'lucide-react'
import { Input } from '../ui/Input'

interface CitySelectorProps {
  onCitySelect: (city: { name: string; lat: number; lng: number }) => void
  selectedCity: { name: string; lat: number; lng: number } | null
}

export function CitySelector({ onCitySelect, selectedCity }: CitySelectorProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ name: string; lat: number; lng: number }[]>([])
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const searchCity = async (keyword: string) => {
    if (!keyword.trim()) {
      setSuggestions([])
      return
    }
    setSearching(true)
    try {
      const AMap = await loadAMap()
      AMap.plugin('AMap.AutoComplete', () => {
        const auto = new AMap.AutoComplete({ citylimit: false })
        auto.search(keyword, (_status: string, result: { tips: { name: string; location: { lat: number; lng: number } }[] }) => {
          if (result?.tips) {
            const cities = result.tips
              .filter((t: { location?: { lat: number; lng: number } }) => t.location)
              .map((t: { name: string; location: { lat: number; lng: number } }) => ({
                name: t.name,
                lat: t.location.lat,
                lng: t.location.lng,
              }))
            setSuggestions(cities)
          }
          setSearching(false)
        })
      })
    } catch {
      setSearching(false)
    }
  }

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => searchCity(query), 300)
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [query])

  const locateMe = () => {
    setLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          try {
            const AMap = await loadAMap()
            AMap.plugin('AMap.Geocoder', () => {
              const geocoder = new AMap.Geocoder()
              geocoder.getAddress([longitude, latitude], (_status: string, result: { regeocode: { addressComponent: { city: string } } }) => {
                const cityName = result.regeocode.addressComponent.city || '未知城市'
                onCitySelect({ name: cityName.replace('市', ''), lat: latitude, lng: longitude })
                setLocating(false)
              })
            })
          } catch {
            setLocating(false)
          }
        },
        () => {
          setLocating(false)
        }
      )
    }
  }

  return (
    <div className="mx-4">
      <label className="block text-sm font-medium text-warm-700 mb-2">🗺️ 选择城市</label>

      {selectedCity ? (
        <div className="flex items-center justify-between p-4 bg-warm-100 rounded-2xl">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-warm-500" />
            <span className="font-medium text-warm-900">{selectedCity.name}</span>
          </div>
          <button
            onClick={() => onCitySelect(null as never)}
            className="text-xs text-warm-400 hover:text-warm-600"
          >
            更改
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="搜索城市名称..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              onClick={locateMe}
              disabled={locating}
              className="px-4 py-3 bg-warm-100 rounded-2xl border border-warm-300 text-warm-500 hover:bg-warm-200 transition-colors disabled:opacity-50"
            >
              <Navigation className={`w-5 h-5 ${locating ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-2 bg-white rounded-xl border border-warm-200 overflow-hidden shadow-sm max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onCitySelect(s)
                    setQuery('')
                    setSuggestions([])
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-warm-50 transition-colors border-b border-warm-100 last:border-0"
                >
                  <span className="text-sm text-warm-900">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create src/components/add/TripSelect.tsx**

```tsx
import { Trip } from '../../types'
import { Plus } from 'lucide-react'
import { Input } from '../ui/Input'
import { useState } from 'react'

interface TripSelectProps {
  trips: Trip[]
  selectedTripId: string | null
  onSelectTrip: (id: string) => void
  onCreateTrip: (title: string) => void
}

export function TripSelect({ trips, selectedTripId, onSelectTrip, onCreateTrip }: TripSelectProps) {
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const handleCreate = () => {
    if (newTitle.trim()) {
      onCreateTrip(newTitle.trim())
      setNewTitle('')
      setShowNew(false)
    }
  }

  return (
    <div className="mx-4">
      <label className="block text-sm font-medium text-warm-700 mb-2">📖 属于哪次旅行</label>

      <div className="space-y-2 mb-3">
        {trips.map((trip) => (
          <button
            key={trip.id}
            onClick={() => onSelectTrip(trip.id)}
            className={`w-full p-4 rounded-2xl border text-left transition-all ${
              selectedTripId === trip.id
                ? 'border-warm-500 bg-warm-100'
                : 'border-warm-200 bg-white hover:bg-warm-50'
            }`}
          >
            <span className="font-medium text-warm-900">{trip.title}</span>
            <span className="text-xs text-warm-400 ml-2">
              {new Date(trip.start_date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })}
            </span>
          </button>
        ))}
      </div>

      {showNew ? (
        <div className="flex gap-2 p-3 bg-warm-50 rounded-2xl">
          <Input
            placeholder="旅行标题..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1"
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-warm-500 text-white rounded-xl text-sm font-medium"
          >
            创建
          </button>
          <button
            onClick={() => setShowNew(false)}
            className="px-4 py-2 text-warm-400 text-sm"
          >
            取消
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full p-4 border-2 border-dashed border-warm-300 rounded-2xl text-sm text-warm-400 hover:border-warm-500 hover:text-warm-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建旅行
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create src/components/add/NoteInput.tsx**

```tsx
interface NoteInputProps {
  value: string
  onChange: (value: string) => void
}

export function NoteInput({ value, onChange }: NoteInputProps) {
  return (
    <div className="mx-4">
      <label className="block text-sm font-medium text-warm-700 mb-2">💬 想说的话</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="写下这一刻的感受..."
        rows={4}
        className="w-full bg-white border border-warm-300 rounded-2xl p-4 text-warm-900 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-warm-500/30 focus:border-warm-500 transition-all resize-none"
      />
      <p className="text-xs text-warm-300 mt-1 text-right">{value.length}/500</p>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/add && git commit -m "feat: add photo upload, city selector, trip select, and note input components"
```

---

### Task 9: Pages (HomePage, TripDetailPage, AddRecordPage) + Routing

**Files:**
- Create: `src/pages/HomePage.tsx`, `src/pages/TripDetailPage.tsx`, `src/pages/AddRecordPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create src/pages/HomePage.tsx**

```tsx
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { DayCounter } from '../components/home/DayCounter'
import { ChinaMap } from '../components/home/ChinaMap'
import { TripCard } from '../components/home/TripCard'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { CitySummary } from '../types'
import { Spinner } from '../components/ui/Spinner'

export function HomePage() {
  const navigate = useNavigate()
  const { trips, loading: tripsLoading } = useTrips()
  const { photos } = usePhotos()

  // Compute city summaries from trips
  const citySummaries = useMemo((): CitySummary[] => {
    const map = new Map<string, CitySummary>()
    trips.forEach((trip) => {
      trip.cities.forEach((city) => {
        const existing = map.get(city.city_name)
        const cityPhotos = photos.filter((p) => p.city_name === city.city_name)
        if (existing) {
          existing.visit_count++
          existing.photo_count += cityPhotos.length
          existing.trips.push(trip.title)
          if (cityPhotos.length > 0) {
            existing.latest_photo = cityPhotos[0].image_url
          }
        } else {
          map.set(city.city_name, {
            city_name: city.city_name,
            visit_count: 1,
            photo_count: cityPhotos.length,
            latest_photo: cityPhotos.length > 0 ? cityPhotos[0].image_url : null,
            lat: city.lat,
            lng: city.lng,
            trips: [trip.title],
          })
        }
      })
    })
    return Array.from(map.values())
  }, [trips, photos])

  const recentTrips = trips.slice(0, 5)

  if (tripsLoading) {
    return (
      <PageShell>
        <Spinner className="min-h-screen" />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <DayCounter />
      <ChinaMap
        cities={citySummaries}
        onCityClick={(city) => {
          // Find the trip and navigate
          const trip = trips.find((t) =>
            t.cities.some((c) => c.city_name === city.city_name)
          )
          if (trip) navigate(`/trip/${trip.id}`)
        }}
      />
      {recentTrips.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mx-4 mb-2">
            <h3 className="text-sm font-semibold text-warm-700">📖 最近旅行</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2">
            {recentTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                cityCount={trip.cities.length}
                onClick={() => navigate(`/trip/${trip.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </PageShell>
  )
}
```

- [ ] **Step 2: Create src/pages/TripDetailPage.tsx**

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { TripHeader } from '../components/trip/TripHeader'
import { RouteMap } from '../components/trip/RouteMap'
import { PhotoGrid } from '../components/trip/PhotoGrid'
import { PhotoModal } from '../components/trip/PhotoModal'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useTrip } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { Photo } from '../types'

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { trip, loading } = useTrip(id!)
  const { photos } = usePhotos(id)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  if (loading) {
    return (
      <PageShell>
        <Spinner className="min-h-screen" />
      </PageShell>
    )
  }

  if (!trip) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="text-4xl mb-4">😢</div>
          <p className="text-warm-500">找不到这次旅行</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <TripHeader trip={trip} />
      <div className="mt-4">
        <RouteMap cities={trip.cities} />
      </div>
      <div className="mt-6">
        <PhotoGrid photos={photos} onPhotoClick={setSelectedPhoto} />
      </div>
      <div className="p-4">
        <Button
          className="w-full"
          onClick={() => navigate(`/add?trip=${trip.id}`)}
        >
          📸 添加照片
        </Button>
      </div>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </PageShell>
  )
}
```

- [ ] **Step 3: Create src/pages/AddRecordPage.tsx**

```tsx
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { PhotoUploader } from '../components/add/PhotoUploader'
import { CitySelector } from '../components/add/CitySelector'
import { TripSelect } from '../components/add/TripSelect'
import { NoteInput } from '../components/add/NoteInput'
import { Button } from '../components/ui/Button'
import { Toast } from '../components/ui/Toast'
import { useTrips } from '../hooks/useTrips'
import { usePhotos } from '../hooks/usePhotos'
import { ArrowLeft } from 'lucide-react'

export function AddRecordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preSelectedTripId = searchParams.get('trip')

  const { trips, createTrip } = useTrips()
  const { uploadPhoto } = usePhotos()

  const [file, setFile] = useState<File | null>(null)
  const [city, setCity] = useState<{ name: string; lat: number; lng: number } | null>(null)
  const [tripId, setTripId] = useState<string | null>(preSelectedTripId)
  const [note, setNote] = useState('')
  const [author, setAuthor] = useState<'我' | '她'>('我')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async () => {
    if (!file || !city || !tripId) return

    setSubmitting(true)
    try {
      await uploadPhoto(file, tripId, city.name, note, author)

      // Try to add city to trip if not already there
      const trip = trips.find((t) => t.id === tripId)
      if (trip && !trip.cities.some((c) => c.city_name === city.name)) {
        const { supabase } = await import('../lib/supabase')
        await supabase.from('trip_cities').insert({
          trip_id: tripId,
          city_name: city.name,
          lat: city.lat,
          lng: city.lng,
          sort_order: trip.cities.length,
        })
      }

      setToast({ message: '回忆已保存！', type: 'success' })
      setTimeout(() => navigate(`/trip/${tripId}`), 1000)
    } catch (err) {
      setToast({ message: '保存失败，请重试', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateTrip = async (title: string) => {
    try {
      const newTrip = await createTrip(
        {
          title,
          cover_photo: null,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          created_by: author,
        },
        city ? [{ city_name: city.name, lat: city.lat, lng: city.lng, sort_order: 0 }] : []
      )
      setTripId(newTrip.id)
      setToast({ message: '新旅行已创建！', type: 'success' })
    } catch {
      setToast({ message: '创建旅行失败', type: 'error' })
    }
  }

  return (
    <PageShell hideNav>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-warm-100">
          <ArrowLeft className="w-5 h-5 text-warm-700" />
        </button>
        <h1 className="text-lg font-semibold text-warm-900">记录新回忆</h1>
      </div>

      <div className="space-y-5 pb-8">
        <PhotoUploader onFileSelect={setFile} />
        <CitySelector onCitySelect={setCity} selectedCity={city} />
        <TripSelect
          trips={trips}
          selectedTripId={tripId}
          onSelectTrip={setTripId}
          onCreateTrip={handleCreateTrip}
        />

        {/* Author toggle */}
        <div className="mx-4">
          <label className="block text-sm font-medium text-warm-700 mb-2">👤 谁在记录</label>
          <div className="flex gap-2">
            {(['我', '她'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAuthor(a)}
                className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
                  author === a
                    ? 'bg-warm-500 text-white shadow-sm'
                    : 'bg-warm-100 text-warm-500'
                }`}
              >
                {a === '我' ? '💙 我' : '💗 她'}
              </button>
            ))}
          </div>
        </div>

        <NoteInput value={note} onChange={setNote} />

        <div className="mx-4">
          <Button
            className="w-full"
            size="lg"
            disabled={!file || !city || !tripId || submitting}
            onClick={handleSubmit}
          >
            {submitting ? '保存中...' : '💾 保存回忆'}
          </Button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </PageShell>
  )
}
```

- [ ] **Step 4: Update src/App.tsx**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { TripDetailPage } from './pages/TripDetailPage'
import { AddRecordPage } from './pages/AddRecordPage'
import { Spinner } from './components/ui/Spinner'
import { useState } from 'react'

function AppRoutes() {
  const { session, loading } = useAuth()
  const [justLoggedIn, setJustLoggedIn] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session && !justLoggedIn) {
    return <LoginPage onLogin={() => setJustLoggedIn(true)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trip/:id" element={<TripDetailPage />} />
        <Route path="/add" element={<AddRecordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
```

- [ ] **Step 5: Verify build**

```bash
cd /c/Users/35081/Desktop/travel-diary && npm run build
```

Expected: Build succeeds. Fix any TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages src/App.tsx && git commit -m "feat: add all pages and routing"
```

---

### Task 10: Environment Configuration + Final Integration

**Files:**
- Create: `.env` (from template)

- [ ] **Step 1: Create .env file**

Get values from your Supabase project (Settings → API) and 高德地图 console, then create `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_AMAP_KEY=your-amap-js-api-key
VITE_AMAP_SECRET=your-amap-security-code
```

- [ ] **Step 2: Verify dev server works**

```bash
cd /c/Users/35081/Desktop/travel-diary && npm run dev
```

Open http://localhost:5173 and verify:
- Login page appears
- Can log in with shared credentials
- Home page loads with day counter
- Map loads (AMap)
- Can navigate between pages

- [ ] **Step 3: Commit**

```bash
git add .env.example && git commit -m "chore: add environment configuration templates"
```

---

### Task 11: Deployment to Vercel

- [ ] **Step 1: Install Vercel CLI and deploy**

```bash
cd /c/Users/35081/Desktop/travel-diary && npx vercel --prod
```

- [ ] **Step 2: Add environment variables in Vercel Dashboard**

Go to Vercel Dashboard → Project → Settings → Environment Variables, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AMAP_KEY`
- `VITE_AMAP_SECRET`

Redeploy after adding env vars.

- [ ] **Step 3: Add Supabase redirect URL**

Go to Supabase Dashboard → Authentication → URL Configuration → Add:
`https://your-app.vercel.app` to redirect allowlist.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: final deployment configuration"
git push
```

---

### Task 12: Final Verification

- [ ] **Step 1: Test on iPhone**
  - Open Vercel URL in Safari
  - Login with shared credentials
  - Verify day counter is correct
  - Verify map loads and shows markers
  - Take a photo and upload
  - Verify photo appears in trip detail
  - Add to Home Screen (PWA)
  - Verify PWA opens in standalone mode

- [ ] **Step 2: Test on desktop**
  - Open Vercel URL in Chrome
  - Verify responsive layout
  - Verify photo upload from computer
  - Verify all pages render correctly

- [ ] **Step 3: Verify RLS security**
  - Open incognito window
  - Try to access Vercel URL
  - Verify login page appears (not the app content)
  - Verify Supabase API calls fail without auth

---

## Test Strategy

### Unit/Integration Tests (post MVP)
- `useDaysCount` hook — verify correct day count from 2024-11-08
- `useAuth` hook — verify auth state management
- Photo upload flow — verify file upload + DB insert
- Login flow — verify auth success/failure

### Manual Verification Checklist
- [ ] Login with wrong password → shows error
- [ ] Login with correct password → enters app
- [ ] Day counter shows correct days
- [ ] Map displays China centered
- [ ] City markers appear for cities in trips
- [ ] Click marker → shows city popup
- [ ] Trip cards scroll horizontally
- [ ] Click trip card → navigates to trip detail
- [ ] Route map shows city route line
- [ ] Photo grid shows uploaded photos
- [ ] Click photo → opens modal with note
- [ ] Add record: upload photo, select city, choose trip, write note, save
- [ ] Both authors ("我"/"她") can create records
- [ ] PWA installs on iPhone
- [ ] Responsive on desktop and mobile
