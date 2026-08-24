import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function githubPagesSpaFallback(): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    closeBundle() {
      const outputDirectory = resolve(import.meta.dirname, 'dist')
      copyFileSync(resolve(outputDirectory, 'index.html'), resolve(outputDirectory, '404.html'))
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-180x180.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: '崔浩和李沐桐 · 在一起的日子',
        short_name: '崔浩❤李沐桐',
        description: '崔浩和李沐桐在一起的日子 · 旅途回忆',
        theme_color: '#272522',
        background_color: '#272522',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        start_url: '/',
        scope: '/',
        orientation: 'portrait-primary',
        lang: 'zh-CN',
        dir: 'ltr',
        categories: ['lifestyle', 'travel', 'social'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-180x180.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: '桌面端 · 登录页',
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow',
            label: '移动端 · 登录页',
          },
        ],
        shortcuts: [
          {
            name: '记录新回忆',
            short_name: '记录',
            description: '拍照或上传照片',
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
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        globIgnores: ['**/screenshot-*.*', '**/*.{woff,woff2,ttf,otf}'],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.*\.(?:woff2?|ttf|otf)(?:\?.*)?$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-font-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
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
            // Cache only public, same-origin assets. Private Supabase signed URLs must
            // never survive a user session in Cache Storage.
            urlPattern: ({ sameOrigin, url }) =>
              sameOrigin && /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'public-image-cache-v2',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
    githubPagesSpaFallback(),
  ],
})
