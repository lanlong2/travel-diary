# 旅行日记 V2 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为旅行日记添加全量记录时间线、纯文字日记、点击波纹特效，并优化手机端 UI

**Architecture:** 在现有 React + Supabase 架构上扩展 — 不改表结构，只放宽 image_url 为 nullable + 加 entry_type 字段。新增 TimelinePage 页面和 useRipple hook。底部导航从 3 Tab 扩展为 4 Tab。

**Tech Stack:** React 19 + TypeScript + Tailwind CSS + Supabase + Vite

---

## Task 1: 数据层 — 类型 & Hook 更新

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/hooks/usePhotos.ts`

> **前置条件：** 在 Supabase SQL Editor 中执行以下迁移：
> ```sql
> ALTER TABLE photos ALTER COLUMN image_url DROP NOT NULL;
> ALTER TABLE photos ADD COLUMN IF NOT EXISTS entry_type text NOT NULL DEFAULT 'photo' CHECK (entry_type IN ('photo', 'note'));
> ```

- [ ] **Step 1: 更新 Photo 类型**

```ts
// src/types/index.ts
export interface Photo {
  id: string
  trip_id: string
  city_name: string
  image_url: string | null          // 从 string 改为 string | null
  note: string
  author: '我' | '她'
  entry_type: 'photo' | 'note'     // 新增
  created_at: string
}
```

- [ ] **Step 2: 更新 usePhotos hook — uploadPhoto 支持 entry_type**

```ts
// src/hooks/usePhotos.ts — 修改 uploadPhoto 函数签名和实现
const uploadPhoto = async (
  file: File | null,                // 从 File 改为 File | null
  tripId: string,
  cityName: string,
  note: string,
  author: '我' | '她',
  entryType: 'photo' | 'note' = 'photo'  // 新增参数
) => {
  let imageUrl: string | null = null

  if (file) {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.一-龥_-]/g, '_')}`
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    imageUrl = urlData.publicUrl
  }

  const { data, error } = await supabase
    .from('photos')
    .insert({
      trip_id: tripId,
      city_name: cityName,
      image_url: imageUrl,
      note,
      author,
      entry_type: entryType,        // 新增字段
    })
    .select()
    .single()

  if (error) throw error
  await fetchPhotos()
  return data
}
```

- [ ] **Step 3: 运行现有测试确认零回归**

```
npx vitest run
```

Expected: 全部 PASS（6 tests）

- [ ] **Step 4: Commit**

```
git add src/types/index.ts src/hooks/usePhotos.ts
git commit -m "feat: 数据层支持纯文字日记（entry_type + image_url nullable）"
```

---

## Task 2: 点击波纹特效 — useRipple Hook + Ripple 组件 + CSS

**Files:**
- Create: `src/hooks/useRipple.ts`
- Create: `src/components/ui/Ripple.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: 创建 useRipple hook**

```ts
// src/hooks/useRipple.ts
import { useState, useCallback, useRef } from 'react'

export interface RippleData {
  id: number
  x: number
  y: number
}

export function useRipple() {
  const [ripples, setRipples] = useState<RippleData[]>([])
  const counterRef = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = counterRef.current++
    setRipples((prev) => [...prev, { id, x, y }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 600)
  }, [])

  return { ripples, onPointerDown }
}
```

- [ ] **Step 2: 创建 Ripple 组件**

```tsx
// src/components/ui/Ripple.tsx
import type { RippleData } from '../../hooks/useRipple'

interface RippleProps {
  ripples: RippleData[]
}

export function Ripple({ ripples }: RippleProps) {
  return (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-effect"
          style={{
            left: r.x,
            top: r.y,
          }}
        />
      ))}
    </>
  )
}
```

- [ ] **Step 3: 在 index.css 中添加波纹 keyframes**

在 `@layer utilities` 的闭合 `}` 之前添加：

```css
/* src/index.css — 在 @layer utilities 内追加 */
.ripple-effect {
  position: absolute;
  width: 20px;
  height: 20px;
  margin-left: -10px;
  margin-top: -10px;
  border-radius: 9999px;
  background: currentColor;
  opacity: 0.25;
  pointer-events: none;
  animation: rippleExpand 0.6s ease-out forwards;
}

@keyframes rippleExpand {
  0% {
    transform: scale(0);
    opacity: 0.4;
  }
  100% {
    transform: scale(12);
    opacity: 0;
  }
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(196, 77, 52, 0.25);
  }
  50% {
    box-shadow: 0 4px 28px rgba(196, 77, 52, 0.45);
  }
}

@keyframes tabBounce {
  0% { transform: scale(1); }
  30% { transform: scale(0.85); }
  60% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.animate-page-enter {
  animation: pageEnter 0.2s ease-out both;
}

.animate-pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}

.animate-tab-bounce {
  animation: tabBounce 0.15s ease-out;
}
```

- [ ] **Step 4: 在 tailwind.config.ts 注册新动画**

```ts
// tailwind.config.ts — 在 extend.animation 中添加
animation: {
  // ... existing
  'ripple-expand': 'rippleExpand 0.6s ease-out forwards',
  'page-enter': 'pageEnter 0.2s ease-out both',
  'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
  'tab-bounce': 'tabBounce 0.15s ease-out',
},
keyframes: {
  // ... existing
  rippleExpand: {
    '0%': { transform: 'scale(0)', opacity: '0.4' },
    '100%': { transform: 'scale(12)', opacity: '0' },
  },
  pageEnter: {
    from: { opacity: '0', transform: 'translateY(12px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  pulseGlow: {
    '0%, 100%': { boxShadow: '0 4px 16px rgba(196,77,52,0.25)' },
    '50%': { boxShadow: '0 4px 28px rgba(196,77,52,0.45)' },
  },
  tabBounce: {
    '0%': { transform: 'scale(1)' },
    '30%': { transform: 'scale(0.85)' },
    '60%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' },
  },
},
```

- [ ] **Step 5: Commit**

```
git add src/hooks/useRipple.ts src/components/ui/Ripple.tsx src/index.css tailwind.config.ts
git commit -m "feat: 添加点击波纹特效（useRipple hook + Ripple 组件）"
```

---

## Task 3: 底部导航改造 — 3 Tab → 4 Tab

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

- [ ] **Step 1: 重写 BottomNav 组件**

```tsx
// src/components/layout/BottomNav.tsx
import { useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Map, PlusCircle, Compass, ScrollText } from 'lucide-react'

const TABS = [
  { path: '/', icon: Map, label: '足迹' },
  { path: '/timeline', icon: ScrollText, label: '时光' },
  { path: '/add', icon: PlusCircle, label: '记录', isFab: true },
  { path: '/trips', icon: Compass, label: '我们' },
] as const

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const bounceRef = useRef<Record<string, boolean>>({})

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleClick = (path: string) => {
    bounceRef.current[path] = true
    navigate(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="h-px bg-gradient-to-r from-transparent via-warm-300/40 to-transparent" />
      <div className="bg-cream/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex justify-around items-end px-4 pt-3 pb-4">
          {TABS.map(({ path, icon: Icon, label, isFab }) => {
            const active = isActive(path)
            const bounced = bounceRef.current[path]
            // 清除 bounce 标记
            if (bounced) {
              setTimeout(() => { bounceRef.current[path] = false }, 200)
            }

            if (isFab) {
              return (
                <button
                  key={path}
                  onClick={() => handleClick(path)}
                  className="flex flex-col items-center gap-1 -mt-2 group"
                >
                  <div className={`w-[52px] h-[52px] bg-gradient-to-br from-warm-500 to-caramel rounded-2xl flex items-center justify-center shadow-lg shadow-warm-500/25 active:scale-90 transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1 animate-pulse-glow ${bounced ? 'animate-tab-bounce' : ''}`}>
                    <Icon className="w-7 h-7 text-white" fill="white" />
                  </div>
                  <span className="text-xs font-semibold text-warm-500 tracking-wide">
                    {label}
                  </span>
                </button>
              )
            }

            return (
              <button
                key={path}
                onClick={() => handleClick(path)}
                className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center transition-all duration-200 relative ${
                  active ? 'text-caramel' : 'text-warm-300'
                } ${bounced ? 'animate-tab-bounce' : ''}`}
              >
                <div className={`relative p-2 rounded-xl transition-colors ${active ? 'bg-warm-100/80' : ''}`}>
                  <Icon className="w-6 h-6" />
                  {active && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-caramel" />
                  )}
                </div>
                <span className="text-xs font-semibold tracking-wide">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: 运行构建验证**

```
npx vite build 2>&1 | tail -5
```

Expected: 构建成功

- [ ] **Step 3: Commit**

```
git add src/components/layout/BottomNav.tsx
git commit -m "feat: 底部导航 3→4 Tab（新增「时光」）+ FAB 嵌入 + 切换动效"
```

---

## Task 4: 时光线页面 — TimelinePage + TimelineCard + MonthDivider

**Files:**
- Create: `src/components/timeline/MonthDivider.tsx`
- Create: `src/components/timeline/TimelineCard.tsx`
- Create: `src/pages/TimelinePage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建 MonthDivider 组件**

```tsx
// src/components/timeline/MonthDivider.tsx
interface MonthDividerProps {
  label: string
}

export function MonthDivider({ label }: MonthDividerProps) {
  return (
    <div className="flex items-center gap-3 mx-6 my-5">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-warm-300/50 to-warm-300/50" />
      <span className="text-xs text-warm-400 font-medium italic tracking-wider whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-warm-300/50 to-warm-300/50" />
    </div>
  )
}
```

- [ ] **Step 2: 创建 TimelineCard 组件**

```tsx
// src/components/timeline/TimelineCard.tsx
import type { Photo } from '../../types'
import { MapPin } from 'lucide-react'

interface TimelineCardProps {
  record: Photo
  index: number
  onClick: () => void
}

export function TimelineCard({ record, onClick }: TimelineCardProps) {
  const dateStr = new Date(record.created_at).toLocaleDateString('zh-CN', {
    month: 'long', day: 'numeric', weekday: 'short',
  })

  return (
    <button
      onClick={onClick}
      className="w-full text-left mx-6 mb-4 active:scale-[0.98] transition-transform duration-150 animate-fade-in-up relative overflow-hidden rounded-2xl"
      style={{ opacity: 0 }}
    >
      {record.image_url ? (
        /* 照片卡片 — 拍立得 */
        <div className="polaroid !p-3 !pb-6 rounded-xl">
          <div className="aspect-[4/3] rounded-sm overflow-hidden bg-warm-100 mb-3">
            <img
              src={record.image_url}
              alt={record.note || record.city_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {record.note && (
            <p className="text-sm text-wood/70 text-center leading-relaxed font-medium italic px-2 line-clamp-2">
              「{record.note}」
            </p>
          )}
        </div>
      ) : (
        /* 文字卡片 — 便签风格 */
        <div className="bg-[#fff9f0] border border-warm-200/60 rounded-2xl p-5 shadow-sm"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(180,150,120,0.06) 27px, rgba(180,150,120,0.06) 28px)',
            backgroundPosition: '0 8px',
          }}
        >
          <p className="text-base text-warm-800 leading-relaxed whitespace-pre-wrap">
            {record.note}
          </p>
        </div>
      )}

      {/* 底部信息条 */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 bg-warm-100 rounded-lg text-warm-500 font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {record.city_name}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            record.author === '我' ? 'bg-blue-50 text-blue-400' : 'bg-pink-50 text-pink-400'
          }`}>
            {record.author === '我' ? '💙' : '💗'}
          </span>
        </div>
        <span className="text-xs text-warm-300 italic">{dateStr}</span>
      </div>
    </button>
  )
}
```

- [ ] **Step 3: 创建 TimelinePage**

```tsx
// src/pages/TimelinePage.tsx
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { MonthDivider } from '../components/timeline/MonthDivider'
import { TimelineCard } from '../components/timeline/TimelineCard'
import { usePhotos } from '../hooks/usePhotos'
import { useTrips } from '../hooks/useTrips'
import { Spinner } from '../components/ui/Spinner'
import { ScrollText } from 'lucide-react'
import type { Photo } from '../types'

export function TimelinePage() {
  const navigate = useNavigate()
  const { photos, loading } = usePhotos()  // 取所有记录
  const { trips } = useTrips()

  // 按月份分组
  const groupedByMonth = useMemo(() => {
    const groups: { month: string; records: Photo[] }[] = []
    const monthMap = new Map<string, Photo[]>()

    photos.forEach((p) => {
      const d = new Date(p.created_at)
      const key = `${d.getFullYear()}年${d.getMonth() + 1}月`
      const arr = monthMap.get(key)
      if (arr) arr.push(p)
      else monthMap.set(key, [p])
    })

    // 按时间倒序排列月份
    const sortedKeys = Array.from(monthMap.keys()).sort((a, b) => {
      const [ya, ma] = a.replace('年', ' ').split(' ').map(Number)
      const [yb, mb] = b.replace('年', ' ').split(' ').map(Number)
      return yb - ya || mb - ma
    })

    sortedKeys.forEach((key) => {
      groups.push({ month: key, records: monthMap.get(key)! })
    })

    return groups
  }, [photos])

  if (loading) {
    return (
      <PageShell>
        <Spinner className="min-h-screen" />
      </PageShell>
    )
  }

  return (
    <PageShell>
      {/* 页面标题 */}
      <div className="px-6 pt-6 pb-2 animate-page-enter">
        <h1 className="text-2xl font-bold text-warm-900 flex items-center gap-2">
          <ScrollText className="w-7 h-7 text-caramel" />
          时光日记
        </h1>
        <p className="text-sm text-warm-400 mt-1">
          {photos.length} 条记录
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="mx-6 mt-8 py-20 text-center border-2 border-dashed border-warm-300/60 rounded-2xl animate-fade-in-up">
          <div className="text-5xl mb-4">📜</div>
          <p className="text-warm-500 font-medium">还没有记录</p>
          <p className="text-sm text-warm-400 mt-2">
            点击底部「记录」按钮写下第一条吧
          </p>
        </div>
      ) : (
        <div className="py-2">
          {groupedByMonth.map((group) => (
            <div key={group.month}>
              <MonthDivider label={group.month} />
              {group.records.map((record, i) => (
                <TimelineCard
                  key={record.id}
                  record={record}
                  index={i}
                  onClick={() => {
                    const trip = trips.find((t) => t.id === record.trip_id)
                    if (trip) navigate(`/trip/${trip.id}`)
                  }}
                />
              ))}
            </div>
          ))}
          {/* 底部留白 */}
          <div className="h-8" />
        </div>
      )}
    </PageShell>
  )
}
```

- [ ] **Step 4: 在 App.tsx 添加路由**

```tsx
// src/App.tsx — 在 lazy imports 区域添加：
const TimelinePage = lazy(() =>
  import('./pages/TimelinePage').then((m) => ({ default: m.TimelinePage }))
)

// 在 Routes 中添加（放在 HomePage 路由之后）：
<Route path="/timeline" element={<TimelinePage />} />
```

- [ ] **Step 5: 运行构建验证**

```
npx vite build 2>&1 | tail -5
```

Expected: 构建成功

- [ ] **Step 6: Commit**

```
git add src/components/timeline/MonthDivider.tsx src/components/timeline/TimelineCard.tsx src/pages/TimelinePage.tsx src/App.tsx
git commit -m "feat: 新增时光线页面（全量记录时间线 + 月份分组 + 照片/文字卡片）"
```

---

## Task 5: AddRecordPage 扩展 — 类型切换（照片/文字）

**Files:**
- Modify: `src/pages/AddRecordPage.tsx`

- [ ] **Step 1a: NoteInput 支持 rows 参数**

```tsx
// src/components/add/NoteInput.tsx
interface NoteInputProps {
  value: string
  onChange: (value: string) => void
  rows?: number  // 新增
}

export function NoteInput({ value, onChange, rows = 5 }: NoteInputProps) {
  // 将 textarea 的 rows 从固定 5 改为 {rows}
  // ...
}
```

- [ ] **Step 1b: 修改 AddRecordPage，加入 entry_type 切换****

```tsx
// src/pages/AddRecordPage.tsx — 关键改动

// 新增 state
const [entryType, setEntryType] = useState<'photo' | 'note'>('photo')

// PhotoUploader 只在 entryType === 'photo' 时显示
{entryType === 'photo' && (
  <PhotoUploader onFileSelect={setFile} />
)}

// 在 PhotoUploader 之前加类型切换 UI
<div className="mx-6">
  <label className="block text-sm font-semibold text-warm-700 mb-3">📋 记录类型</label>
  <div className="flex gap-2.5">
    {([
      { type: 'photo', icon: '📸', label: '照片记录' },
      { type: 'note', icon: '📝', label: '纯文字' },
    ] as const).map(({ type, icon, label }) => (
      <button
        key={type}
        onClick={() => { setEntryType(type); if (type === 'note') setFile(null) }}
        className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 border-2 ${
          entryType === type
            ? 'bg-warm-100 border-warm-400 text-warm-700 shadow-sm'
            : 'bg-white border-warm-200/60 text-warm-400 hover:border-warm-300'
        }`}
      >
        {icon} {label}
      </button>
    ))}
  </div>
</div>

// NoteInput 在纯文字模式下变大
<NoteInput
  value={note}
  onChange={setNote}
  rows={entryType === 'note' ? 8 : 5}
/>

// handleSubmit 中修改调用
await uploadPhoto(
  entryType === 'photo' ? file : null,
  tripId,
  city!.name,
  note,
  author,
  entryType
)

// isComplete 条件放宽
const isComplete = entryType === 'photo'
  ? !!(file && city && tripId)
  : !!(city && tripId && note.trim())
```

完整改动后的文件关键部分：

```tsx
// 在 AddRecordPage 函数体内：

// 新增 entryType state（放在现有 state 声明之后）
const [entryType, setEntryType] = useState<'photo' | 'note'>(
  preSelectedTripId ? 'photo' : 'photo'
)

// handleSubmit 修改
const handleSubmit = async () => {
  if (!city || !tripId) return
  if (entryType === 'photo' && !file) return
  if (entryType === 'note' && !note.trim()) return

  setSubmitting(true)
  try {
    await uploadPhoto(
      entryType === 'photo' ? file : null,
      tripId,
      city.name,
      note,
      author,
      entryType
    )

    const trip = trips.find((t) => t.id === tripId)
    if (trip && !trip.cities.some((c) => c.city_name === city.name)) {
      await supabase.from('trip_cities').insert({
        trip_id: tripId,
        city_name: city.name,
        lat: city.lat,
        lng: city.lng,
        sort_order: trip.cities.length,
      })
    }

    setToast({ message: '回忆已保存！', type: 'success' })
    setTimeout(() => navigate(`/trip/${tripId}`), 1200)
  } catch {
    setToast({ message: '保存失败，请重试', type: 'error' })
  } finally {
    setSubmitting(false)
  }
}

// isComplete 条件
const isComplete = entryType === 'photo'
  ? !!(file && city && tripId)
  : !!(city && tripId && note.trim())
```

在 JSX 的 `<PhotoUploader>` 之前插入类型切换：

```tsx
{/* 记录类型切换 */}
<div className="mx-6">
  <label className="block text-sm font-semibold text-warm-700 mb-3">📋 记录类型</label>
  <div className="flex gap-2.5">
    {([
      { type: 'photo' as const, icon: '📸', label: '照片记录' },
      { type: 'note' as const, icon: '📝', label: '纯文字' },
    ]).map(({ type, icon, label }) => (
      <button
        key={type}
        onClick={() => { setEntryType(type); if (type === 'note') setFile(null) }}
        className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 border-2 ${
          entryType === type
            ? 'bg-warm-100 border-warm-400 text-warm-700 shadow-sm'
            : 'bg-white border-warm-200/60 text-warm-400 hover:border-warm-300'
        }`}
      >
        {icon} {label}
      </button>
    ))}
  </div>
</div>
```

将 `<PhotoUploader>` 包裹在条件渲染中：

```tsx
{entryType === 'photo' && (
  <PhotoUploader onFileSelect={setFile} />
)}
```

修改 NoteInput 的 rows：

```tsx
<NoteInput
  value={note}
  onChange={setNote}
  rows={entryType === 'note' ? 8 : 5}
/>
```

- [ ] **Step 2: 运行构建验证**

```
npx vite build 2>&1 | tail -5
```

Expected: 构建成功

- [ ] **Step 3: Commit**

```
git add src/pages/AddRecordPage.tsx
git commit -m "feat: AddRecordPage 支持照片/文字记录类型切换"
```

---

## Task 6: TravelDetailPage & PhotoGrid 混合展示

**Files:**
- Modify: `src/components/trip/PhotoGrid.tsx`
- Modify: `src/pages/TripDetailPage.tsx`

- [ ] **Step 1: PhotoGrid 支持无图文字卡片**

```tsx
// src/components/trip/PhotoGrid.tsx — 在 map 中，对 entry_type === 'note' 的记录渲染文字卡片

// 在现有的照片 map 中，根据 entry_type 分支渲染：
{photos.map((photo, i) => {
  if (photo.entry_type === 'note' || !photo.image_url) {
    // 纯文字卡片
    return (
      <div
        key={photo.id}
        className="animate-fade-in-up relative rounded-2xl overflow-hidden"
        style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
      >
        <div
          className="bg-[#fff9f0] border border-warm-200/60 rounded-2xl p-4 shadow-sm cursor-pointer active:scale-[0.98] transition-transform duration-150 h-full"
          onClick={() => onPhotoClick(photo)}
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(180,150,120,0.06) 27px, rgba(180,150,120,0.06) 28px)',
            backgroundPosition: '0 8px',
          }}
        >
          <p className="text-sm text-warm-700 leading-relaxed whitespace-pre-wrap line-clamp-8">
            {photo.note}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-200/40">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              photo.author === '我' ? 'bg-blue-50 text-blue-400' : 'bg-pink-50 text-pink-400'
            }`}>
              {photo.author === '我' ? '💙' : '💗'}
            </span>
          </div>
        </div>
        {/* 删除按钮 */}
        {onDeletePhoto && (
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(photo) }}
            className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200 hover:bg-red-500/80"
            style={{ opacity: undefined }}
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    )
  }

  // 原有的照片卡片渲染保持不变
  // ...
})}

// 空状态文案调整：
{photos.length === 0 && (
  <div className="mx-6 py-20 text-center animate-fade-in-up">
    <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-warm-100 flex items-center justify-center">
      <Camera className="w-10 h-10 text-warm-300" />
    </div>
    <p className="text-base text-warm-400 font-medium">还没有记录</p>
    <p className="text-sm text-warm-300 mt-2">记录属于我们的每一刻</p>
  </div>
)}
```

- [ ] **Step 2: TripDetailPage 微调 — 作者统计区分 entry_type**

```tsx
// src/pages/TripDetailPage.tsx — 修改 authorStats 计算
const authorStats = useMemo(() => {
  const mePhotos = photos.filter(p => p.author === '我' && p.entry_type === 'photo').length
  const herPhotos = photos.filter(p => p.author === '她' && p.entry_type === 'photo').length
  const meNotes = photos.filter(p => p.author === '我' && p.entry_type === 'note').length
  const herNotes = photos.filter(p => p.author === '她' && p.entry_type === 'note').length
  return { mePhotos, herPhotos, meNotes, herNotes }
}, [photos])

// 统计条更新
{photos.length > 0 && (
  <div className="mx-6 mt-6">
    <div className="flex flex-wrap items-center gap-2 text-xs text-warm-500 bg-warm-50/80 rounded-2xl px-5 py-3 border border-warm-200/50">
      <Camera className="w-4 h-4" />
      <span>共 {photos.length} 条记录</span>
      {authorStats.mePhotos + authorStats.meNotes > 0 && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          💙 {authorStats.mePhotos + authorStats.meNotes}
        </span>
      )}
      {authorStats.herPhotos + authorStats.herNotes > 0 && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pink-400" />
          💗 {authorStats.herPhotos + authorStats.herNotes}
        </span>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 3: 运行构建验证**

```
npx vite build 2>&1 | tail -5
```

Expected: 构建成功

- [ ] **Step 4: Commit**

```
git add src/components/trip/PhotoGrid.tsx src/pages/TripDetailPage.tsx
git commit -m "feat: PhotoGrid 支持无图文字卡片 + TripDetail 混合展示"
```

---

## Task 7: 手机 UI 优化 & 全局点击反馈

**Files:**
- Modify: `src/components/layout/PageShell.tsx`
- Modify: `src/components/home/TripCard.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: PageShell 加页面进入动画**

```tsx
// src/components/layout/PageShell.tsx
export function PageShell({ children, hideNav = false }: PageShellProps) {
  return (
    <div className="min-h-screen bg-cream paper-texture relative">
      <Particles />
      <div className="max-w-2xl mx-auto pb-28 relative z-10 animate-page-enter">
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  )
}
```

- [ ] **Step 2: TripCard 加点击反馈**

```tsx
// src/components/home/TripCard.tsx — 在 button 上添加 active 反馈
// 找到 onClick 的 button/div，添加：
className="... active:scale-[0.97] transition-transform duration-150"
```

- [ ] **Step 3: 全局触控区域优化 — index.css**

```css
/* src/index.css — 在 @layer base 中 body 规则后追加 */

/* 最小触控区域 */
@media (pointer: coarse) {
  button, a, [role="button"] {
    min-height: 44px;
  }
}

/* active 反馈全局（针对 pointer: fine 的设备做微调） */
@media (hover: hover) {
  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
}
```

在 `@layer utilities` 中追加：

```css
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.safe-top {
  padding-top: env(safe-area-inset-top, 0px);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

- [ ] **Step 4: 运行构建 & 测试验证**

```
npx vite build 2>&1 | tail -5
npx vitest run
```

Expected: 构建成功 + 所有测试 PASS

- [ ] **Step 5: Commit**

```
git add src/components/layout/PageShell.tsx src/components/home/TripCard.tsx src/index.css
git commit -m "feat: 手机 UI 优化（页面过渡动画 + 触控区域 + 点击反馈）"
```

---

## Task 8: 测试 & 回归验证

**Files:**
- Create: `src/__tests__/useRipple.test.ts`
- Create: `src/__tests__/TimelineCard.test.tsx`

- [ ] **Step 1: useRipple hook 测试**

```ts
// src/__tests__/useRipple.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRipple } from '../hooks/useRipple'

describe('useRipple', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('返回 ripples 和 onPointerDown', () => {
    const { result } = renderHook(() => useRipple())
    expect(result.current).toHaveProperty('ripples')
    expect(result.current).toHaveProperty('onPointerDown')
    expect(Array.isArray(result.current.ripples)).toBe(true)
    expect(result.current.ripples).toHaveLength(0)
    expect(typeof result.current.onPointerDown).toBe('function')
  })

  it('onPointerDown 后 ripples 数组包含新波纹', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useRipple())

    // 模拟 pointerdown 事件
    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 100,
          top: 200,
          right: 300,
          bottom: 400,
          width: 200,
          height: 200,
        }),
      },
      clientX: 150,
      clientY: 250,
    } as unknown as React.PointerEvent<HTMLElement>

    act(() => {
      result.current.onPointerDown(mockEvent)
    })

    expect(result.current.ripples).toHaveLength(1)
    expect(result.current.ripples[0]).toMatchObject({
      x: 50,   // 150 - 100
      y: 50,   // 250 - 200
    })

    vi.useRealTimers()
  })

  it('波纹在 600ms 后自动移除', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useRipple())

    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100,
        }),
      },
      clientX: 50,
      clientY: 50,
    } as unknown as React.PointerEvent<HTMLElement>

    act(() => {
      result.current.onPointerDown(mockEvent)
    })

    expect(result.current.ripples).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(650)
    })

    expect(result.current.ripples).toHaveLength(0)
    vi.useRealTimers()
  })

  it('多次点击产生多个波纹，各自独立消失', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useRipple())

    const makeEvent = (cx: number, cy: number) => ({
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200,
        }),
      },
      clientX: cx,
      clientY: cy,
    } as unknown as React.PointerEvent<HTMLElement>)

    act(() => { result.current.onPointerDown(makeEvent(10, 10)) })
    act(() => { result.current.onPointerDown(makeEvent(50, 50)) })

    expect(result.current.ripples).toHaveLength(2)

    // 只前进 300ms — 第一个还没消失
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current.ripples).toHaveLength(2)

    // 前进到 650ms — 第一个消失
    act(() => { vi.advanceTimersByTime(350) })
    expect(result.current.ripples).toHaveLength(1)

    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: TimelineCard 渲染测试**

```tsx
// src/__tests__/TimelineCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TimelineCard } from '../components/timeline/TimelineCard'
import type { Photo } from '../types'

const photoRecord: Photo = {
  id: '1',
  trip_id: 't1',
  city_name: '大理',
  image_url: 'https://example.com/photo.jpg',
  note: '洱海真美',
  author: '我',
  entry_type: 'photo',
  created_at: '2026-06-15T10:00:00Z',
}

const noteRecord: Photo = {
  id: '2',
  trip_id: 't1',
  city_name: '丽江',
  image_url: null,
  note: '今天在古城吃到了超好吃的烤乳扇，外酥里嫩，玫瑰酱很香。',
  author: '她',
  entry_type: 'note',
  created_at: '2026-06-14T14:00:00Z',
}

describe('TimelineCard', () => {
  it('渲染照片卡片', () => {
    const onClick = vi.fn()
    render(<TimelineCard record={photoRecord} index={0} onClick={onClick} />)

    expect(screen.getByText('「洱海真美」')).toBeTruthy()
    expect(screen.getByText('大理')).toBeTruthy()
    const img = document.querySelector('img')
    expect(img).toBeTruthy()
    expect(img!.getAttribute('src')).toBe('https://example.com/photo.jpg')
  })

  it('渲染文字卡片（无图）', () => {
    const onClick = vi.fn()
    render(<TimelineCard record={noteRecord} index={0} onClick={onClick} />)

    expect(screen.getByText(/烤乳扇/)).toBeTruthy()
    expect(screen.getByText('丽江')).toBeTruthy()
    // 不应该有 img
    const img = document.querySelector('img')
    expect(img).toBeNull()
  })

  it('点击触发 onClick', () => {
    const onClick = vi.fn()
    render(<TimelineCard record={photoRecord} index={0} onClick={onClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('显示作者标记', () => {
    const onClick = vi.fn()
    const { rerender } = render(
      <TimelineCard record={photoRecord} index={0} onClick={onClick} />
    )
    expect(screen.getByText('💙')).toBeTruthy()

    rerender(
      <TimelineCard record={noteRecord} index={0} onClick={onClick} />
    )
    expect(screen.getByText('💗')).toBeTruthy()
  })

  it('显示日期', () => {
    const onClick = vi.fn()
    render(<TimelineCard record={photoRecord} index={0} onClick={onClick} />)
    // 6月15日（locale 相关，检查包含关键文字）
    expect(screen.getByText(/6月/)).toBeTruthy()
  })
})
```

- [ ] **Step 3: 运行全部测试**

```
npx vitest run
```

Expected: 全部 PASS（原有 6 + 新增 9 = 15 tests）

- [ ] **Step 4: 运行完整构建**

```
npx tsc -b && npx vite build
```

Expected: tsc 无错误 + vite build 成功

- [ ] **Step 5: 最终 Commit**

```
git add src/__tests__/useRipple.test.ts src/__tests__/TimelineCard.test.tsx
git commit -m "test: useRipple + TimelineCard 测试"
```
