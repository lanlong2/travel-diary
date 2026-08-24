import { defineConfig, devices } from '@playwright/test'

const host = '127.0.0.1'
const port = 4173

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.spec.ts',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://${host}:${port}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --host ${host} --port ${port}`,
    url: `http://${host}:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      VITE_SUPABASE_URL:
        process.env.VITE_SUPABASE_URL ?? process.env.API_URL ?? 'http://127.0.0.1:54321',
      VITE_SUPABASE_PUBLISHABLE_KEY:
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
        process.env.PUBLISHABLE_KEY ??
        'local-e2e-publishable-key',
      VITE_AMAP_KEY: process.env.VITE_AMAP_KEY ?? 'e2e-map-key',
      VITE_AMAP_SECURITY_CODE: process.env.VITE_AMAP_SECURITY_CODE ?? '',
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 14'] } },
  ],
})
