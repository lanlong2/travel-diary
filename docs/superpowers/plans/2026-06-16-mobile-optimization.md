# Mobile Optimization & Vercel Deployment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize the travel diary app for mobile devices (battery, touch, PWA) and deploy the latest version to Vercel.

**Architecture:** Enhance existing React SPA with mobile-specific optimizations (reduced animations, battery-conscious particles, iOS Safari fixes), improve PWA manifest, then build and deploy via Vercel CLI.

**Tech Stack:** React 19, Vite 6, TypeScript 5, Tailwind CSS 3, vite-plugin-pwa, Vercel

---

### Task 1: Particles Performance — Mobile Battery Optimization

**Files:**
- Modify: `src/components/ui/Particles.tsx`

The Particles component runs 55 animated canvas particles on every page. On mobile this wastes battery and GPU. Reduce particle count on mobile and add a frame rate cap.

- [ ] **Step 1: Update Particles to detect mobile and reduce load**

Replace `src/components/ui/Particles.tsx`:

```tsx
import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  rotation: number
  rotationSpeed: number
  type: 'heart' | 'sparkle' | 'dust'
  hue: number
  wobble: number
  wobbleSpeed: number
}

const HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

function isMobile() {
  if (typeof window === 'undefined') return false
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && window.innerWidth < 768)
}

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const mobile = isMobile()
    // 移动端减半粒子 + 降低帧率
    const PARTICLE_COUNT = mobile ? 20 : 55
    const FRAME_SKIP = mobile ? 2 : 1 // 移动端每2帧才渲染一次
    let frameCount = 0

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    let animId: number
    let particles: Particle[] = []

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(true))
    }

    function createParticle(randomY: boolean): Particle {
      const types = ['heart', 'sparkle', 'dust'] as const
      const type = types[Math.floor(Math.random() * 3)]
      return {
        x: Math.random() * canvas!.width,
        y: randomY ? Math.random() * canvas!.height : canvas!.height + 20,
        size: type === 'heart' ? 8 + Math.random() * 12
          : type === 'sparkle' ? 3 + Math.random() * 5
          : 1.5 + Math.random() * 3,
        speed: 0.1 + Math.random() * 0.35,
        opacity: 0.25 + Math.random() * 0.35,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        type,
        hue: type === 'heart' ? 340 + Math.random() * 30
          : type === 'sparkle' ? 25 + Math.random() * 20
          : 20 + Math.random() * 30,
        wobble: 0,
        wobbleSpeed: 0.01 + Math.random() * 0.03,
      }
    }

    function drawHeart(x: number, y: number, size: number, opacity: number, hue: number, rotation: number) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.globalAlpha = opacity
      ctx.fillStyle = `hsl(${hue}, 70%, 75%)`
      const path = new Path2D(HEART_PATH)
      const scale = size / 24
      ctx.scale(scale, scale)
      ctx.fill(path)
      ctx.restore()
    }

    function drawSparkle(x: number, y: number, size: number, opacity: number, hue: number) {
      ctx.save()
      ctx.translate(x, y)
      ctx.globalAlpha = opacity
      ctx.fillStyle = `hsl(${hue}, 80%, 85%)`
      ctx.shadowColor = `hsl(${hue}, 80%, 85%)`
      ctx.shadowBlur = size * 2
      ctx.beginPath()
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2
        const innerR = size * 0.3
        const outerR = size
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR)
        ctx.lineTo(Math.cos(angle + Math.PI / 4) * innerR, Math.sin(angle + Math.PI / 4) * innerR)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    function drawDust(x: number, y: number, size: number, opacity: number, hue: number) {
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = `hsl(${hue}, 50%, 80%)`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function animate() {
      // 移动端跳帧渲染
      frameCount++
      if (frameCount % FRAME_SKIP !== 0) {
        animId = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.y -= p.speed
        p.rotation += p.rotationSpeed
        p.wobble += p.wobbleSpeed
        const xOffset = Math.sin(p.wobble) * 15

        const fadeZone = 100
        let opacity = p.opacity
        if (p.y < fadeZone) {
          opacity = p.opacity * (p.y / fadeZone)
        } else if (p.y > canvas!.height - fadeZone) {
          opacity = p.opacity * ((canvas!.height - p.y) / fadeZone)
        }

        switch (p.type) {
          case 'heart':
            drawHeart(p.x + xOffset, p.y, p.size, Math.max(0, opacity), p.hue, p.rotation)
            break
          case 'sparkle':
            drawSparkle(p.x + xOffset, p.y, p.size, Math.max(0, opacity), p.hue)
            break
          case 'dust':
            drawDust(p.x + xOffset, p.y, p.size, Math.max(0, opacity), p.hue)
            break
        }

        if (p.y < -20) {
          particles[i] = createParticle(false)
        }
      }

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /c/Users/35081/Desktop/travel-diary && npx tsc -b --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Particles.tsx
git commit -m "perf: reduce particle count and frame rate on mobile devices"
```

---

### Task 2: Add prefers-reduced-motion Support

**Files:**
- Modify: `src/index.css`

Respect the user's system-level "Reduce Motion" accessibility setting by disabling all animations when it's active.

- [ ] **Step 1: Add reduced-motion media query to CSS**

Add after the existing `@layer components` block in `src/index.css` (before `@layer utilities`):

```css
/* 尊重用户「减弱动态效果」系统偏好 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .animate-heartbeat,
  .animate-pulse-glow,
  .animate-float,
  .animate-shimmer {
    animation: none !important;
  }
}
```

- [ ] **Step 2: Verify CSS is not broken**

Start the dev server and check that animations still work normally when "Reduce Motion" is OFF:

```bash
cd /c/Users/35081/Desktop/travel-diary && npm run dev
```

Open `http://localhost:5174` and verify:
- DayCounter heartbeat animation plays
- Card fade-in animations play
- Particles animate

Then toggle "Reduce Motion" in OS settings and refresh — all animations should stop.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add prefers-reduced-motion support for accessibility"
```

---

### Task 3: iOS Safari Optimizations

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`

Fix iOS Safari specific issues: Apple smart app banner, safe area insets for notch devices, and prevent accidental pull-to-refresh.

- [ ] **Step 1: Add Apple smart app banner to index.html**

Add this meta tag after the other Apple meta tags in `index.html`:

```html
    <!-- Apple Smart App Banner (提示用户添加到主屏幕) -->
    <meta name="apple-itunes-app" content="app-id=0000000000" />
```

Wait — we don't have an App Store app. Instead, let's use the web-app capable meta to encourage Add to Home Screen. Actually the `apple-mobile-web-app-capable` tag is already there. The smart app banner requires an App Store ID which we don't have.

Skip the smart app banner. Instead add a proper iOS status bar and safe area handling.

- [ ] **Step 1 (revised): Enhance iOS meta tags in index.html**

Replace the existing iOS meta tags section (lines 14-17) in `index.html`:

Find:
```html
    <!-- Safari / iOS -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="崔浩❤李沐桐" />
    <link rel="apple-touch-icon" sizes="180x180" href="/pwa-180x180.png" />
    <link rel="apple-touch-startup-image" href="/pwa-512x512.png" />
```

Replace with:
```html
    <!-- Safari / iOS -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="崔浩❤李沐桐" />
    <link rel="apple-touch-icon" sizes="180x180" href="/pwa-180x180.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="/pwa-180x180.png" />
    <link rel="apple-touch-icon" sizes="120x120" href="/pwa-180x180.png" />
    <!-- Splash screens for various iPhone sizes -->
    <link rel="apple-touch-startup-image" href="/pwa-512x512.png" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

- [ ] **Step 2: Prevent iOS pull-to-refresh in CSS**

Add to the `@layer base` body styles in `src/index.css`, after the existing body block:

```css
  /* 防止 iOS Safari 下拉刷新（PWA standalone 模式不需要） */
  @supports (-webkit-overflow-scrolling: touch) {
    body {
      overscroll-behavior-y: none;
      -webkit-overflow-scrolling: touch;
    }
  }
```

Note: The `overscroll-behavior-y: none` already exists on `html`. But iOS Safari sometimes needs it on `body` too for PWA mode. Actually, moving it to body is better since `overscroll-behavior` on `html` can cause issues.

Since we already have `overscroll-behavior-y: none` on `html`, just add the `-webkit-overflow-scrolling`:

Add inside `body { ... }` block:

```css
    -webkit-overflow-scrolling: touch;
```

The current body already has `overscroll-behavior-y: none` on `html`, which is correct. Let's just add `-webkit-overflow-scrolling: touch` to the body styles.

Actually, looking at the CSS more carefully, the `overscroll-behavior-y: none` is on `html` (line 15 of index.css). That's fine for preventing pull-to-refresh. But iOS also needs `-webkit-overflow-scrolling: touch` for smooth momentum scrolling on scrollable containers.

Let's add it to the body and keep the existing `overscroll-behavior` on html.

- [ ] **Step 3: Commit**

```bash
git add index.html src/index.css
git commit -m "feat: iOS Safari optimizations — safe area, pull-to-refresh prevention, scroll behavior"
```

---

### Task 4: PWA Enhancements

**Files:**
- Modify: `vite.config.ts`

Improve the PWA manifest and service worker for better mobile install experience.

- [ ] **Step 1: Update vite.config.ts PWA configuration**

Replace the `VitePWA({...})` block in `vite.config.ts`:

```typescript
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-180x180.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        id: '/',
        name: '崔浩和李沐桐 · 在一起的日子',
        short_name: '崔浩❤李沐桐',
        description: '崔浩和李沐桐在一起的日子 · 旅途回忆',
        theme_color: '#fefaf5',
        background_color: '#fefaf5',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        start_url: '/',
        scope: '/',
        orientation: 'portrait-primary',
        lang: 'zh-CN',
        dir: 'ltr',
        categories: ['lifestyle', 'travel', 'social'],
        prefer_related_applications: false,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'pwa-180x180.png', sizes: '180x180', type: 'image/png' },
        ],
        screenshots: [
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: '足迹地图',
          },
        ],
        shortcuts: [
          {
            name: '记录新回忆',
            short_name: '记录',
            description: '拍照或写留言',
            url: '/add',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: '我们的旅行',
            short_name: '旅行',
            description: '查看所有旅行',
            url: '/trips',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: '时光日记',
            short_name: '时光',
            description: '按时间浏览',
            url: '/timeline',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/webapi\.amap\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'amap-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
```

- [ ] **Step 2: Verify PWA builds correctly**

```bash
cd /c/Users/35081/Desktop/travel-diary && npm run build
```

Expected: Build succeeds with PWA manifest and service worker generated in `dist/`.

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "feat: enhance PWA manifest — app shortcuts, screenshots, better icon config"
```

---

### Task 5: Font Loading Optimization

**Files:**
- Modify: `src/index.css`
- Modify: `index.html`

Google Fonts loaded via `@import` is render-blocking. Preload the font in HTML and use `font-display: swap` in CSS.

- [ ] **Step 1: Add font preload to index.html**

Add this line after the `<link rel="icon">` tag in `index.html`:

```html
    <!-- 预加载字体，避免 FOIT -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="preload"
      href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700;900&display=swap"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'"
    />
    <noscript>
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700;900&display=swap"
        rel="stylesheet"
      />
    </noscript>
```

- [ ] **Step 2: Remove @import from CSS and use local fallback**

In `src/index.css`, remove the `@import` line (line 1):

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700;900&display=swap');
```

The preload link in HTML replaces this. Keep the font-family in body (which already has system font fallbacks).

- [ ] **Step 3: Verify fonts load correctly**

```bash
cd /c/Users/35081/Desktop/travel-diary && npm run build && npm run preview
```

Open the preview URL and check that Noto Serif SC loads correctly.

- [ ] **Step 4: Commit**

```bash
git add src/index.css index.html
git commit -m "perf: preload Google Fonts via link tag to avoid render-blocking"
```

---

### Task 6: Final Build & Vercel Deployment

**Files:**
- No new files

Build the production bundle and deploy to Vercel.

- [ ] **Step 1: Verify full build passes**

```bash
cd /c/Users/35081/Desktop/travel-diary && npm run build
```

Expected: `tsc -b && vite build` succeeds with no errors. Output in `dist/`.

- [ ] **Step 2: Run all tests**

```bash
cd /c/Users/35081/Desktop/travel-diary && npm test
```

Expected: All 15 tests pass.

- [ ] **Step 3: Deploy to Vercel (production)**

First, check if already linked to Vercel:

```bash
cd /c/Users/35081/Desktop/travel-diary && npx vercel --version && npx vercel list
```

If already linked, deploy:

```bash
cd /c/Users/35081/Desktop/travel-diary && npx vercel --prod
```

If not linked, link first then deploy:

```bash
cd /c/Users/35081/Desktop/travel-diary && npx vercel link
npx vercel --prod
```

- [ ] **Step 4: Verify production deployment**

After deploy, verify:
- Open the Vercel production URL on mobile
- Check PWA install prompt appears
- Verify login works
- Verify map loads
- Verify photo upload shows camera + album picker
- Check animations are smooth
- Verify particles are less intensive on mobile

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: production build and Vercel deployment"
git push
```

---

### Verification Checklist

After all tasks complete, verify on an iPhone:

- [ ] 打开 Vercel 生产 URL
- [ ] 登录页正常显示，Noto Serif SC 字体加载
- [ ] 登录后首页显示天数计数器（心跳动画）
- [ ] 中国地图加载，城市标记点可触摸查看弹窗
- [ ] 粒子效果流畅但不卡顿
- [ ] 底部导航可点击切换页面
- [ ] 添加记录 → 点击上传区域弹出"拍照/选照片"
- [ ] 旅行详情页路线地图正常
- [ ] 照片网格可点击放大
- [ ] 删除按钮在卡片上可见
- [ ] PWA "添加到主屏幕" 可用
- [ ] 在系统设置中开启"减弱动态效果"后，所有动画停止
- [ ] 浏览器中没有 JavaScript 错误
