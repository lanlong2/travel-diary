import { expect, test, type Page } from '@playwright/test'
import { E2E_EMAIL, E2E_PASSWORD } from './fixture'

const SEED_TRIP_ID = '00000000-0000-0000-0000-000000000001'
interface VisualNode {
  complete?: boolean
  dataset: Record<string, string>
  loading?: string
  parentElement: VisualNode | null
  style: Record<string, string>
  textContent: string | null
  append(...nodes: VisualNode[]): void
  remove(): void
  setAttribute(name: string, value: string): void
  querySelectorAll(selector: string): VisualNode[]
}

interface VisualDocument {
  documentElement: VisualNode
  fonts?: { ready: Promise<unknown> }
  createElement(tagName: string): VisualNode
  querySelectorAll(selector: string): VisualNode[]
}

interface VisualGlobal {
  document: VisualDocument
  scrollTo(x: number, y: number): void
}

async function installStableRendering(page: Page) {
  await page.addInitScript(() => {
    const browser = globalThis as unknown as VisualGlobal
    const style = browser.document.createElement('style')
    style.setAttribute('data-visual-baseline', 'true')
    style.textContent = `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
        caret-color: transparent !important;
      }
      .reveal, .reveal-left, .reveal-right, .reveal-scale,
      .reveal-enabled .reveal:not(.visible),
      .reveal-enabled .reveal-left:not(.visible),
      .reveal-enabled .reveal-right:not(.visible),
      .reveal-enabled .reveal-scale:not(.visible) {
        opacity: 1 !important;
        transform: none !important;
        visibility: visible !important;
      }
      canvas[aria-hidden='true'] { visibility: hidden !important; }
    `
    browser.document.documentElement.append(style)
  })
}

async function installAMapStub(page: Page) {
  await page.addInitScript(() => {
    const browser = globalThis as unknown as VisualGlobal

    class OverlayMock {
      content: VisualNode | null

      constructor(options: { content?: VisualNode } = {}) {
        this.content = options.content ?? null
      }

      on() {}

      setOptions() {}

      setMap(map: unknown) {
        if (!map) this.content?.remove()
      }
    }

    class MapMock {
      constructor(private readonly container: VisualNode) {
        this.container.style.position = 'relative'
      }

      add(overlay: OverlayMock | OverlayMock[]) {
        const overlays = Array.isArray(overlay) ? overlay : [overlay]
        overlays.forEach((item, index) => {
          if (!item.content || item.content.parentElement) return
          item.content.dataset.visualMapOverlay = 'true'
          item.content.style.position = 'absolute'
          item.content.style.left = `${18 + ((index * 23) % 76)}%`
          item.content.style.top = `${28 + ((index * 29) % 46)}%`
          this.container.append(item.content)
        })
      }

      clearMap() {
        this.container
          .querySelectorAll('[data-visual-map-overlay]')
          .forEach((node) => node.remove())
      }

      destroy() {
        this.clearMap()
      }

      setFitView() {}

      lngLatToContainer() {
        return { x: 120, y: 100 }
      }
    }

    class AutoCompleteMock {
      search(keyword: string, callback: (status: string, result: object) => void) {
        callback('complete', {
          tips: [{ name: keyword, location: { lat: 30.2741, lng: 120.1551 } }],
        })
      }
    }

    class GeocoderMock {
      getAddress(
        _coordinate: [number, number],
        callback: (status: string, result: object) => void,
      ) {
        callback('complete', {
          regeocode: { addressComponent: { city: '杭州' } },
        })
      }
    }

    Object.assign(browser, {
      _amap_ready: true,
      AMap: {
        Map: MapMock,
        Marker: OverlayMock,
        Pixel: class {
          constructor(
            public x: number,
            public y: number,
          ) {}
        },
        Polyline: OverlayMock,
        AutoComplete: AutoCompleteMock,
        Geocoder: GeocoderMock,
        plugin: (_name: string, callback: () => void) => callback(),
      },
    })
  })
}

async function waitForStableScreenshot(page: Page) {
  await page.evaluate(() => {
    const browser = globalThis as unknown as VisualGlobal
    browser.document.querySelectorAll('img[loading="lazy"]').forEach((image) => {
      image.loading = 'eager'
    })
    browser.scrollTo(0, 0)
  })
  await page.evaluate(async () => {
    const browser = globalThis as unknown as VisualGlobal
    await browser.document.fonts?.ready
  })
  await page
    .waitForFunction(
      () => {
        const browser = globalThis as unknown as VisualGlobal
        return browser.document.querySelectorAll('img').every((image) => image.complete)
      },
      undefined,
      { timeout: 15_000 },
    )
    .catch(() => undefined)
  await page.mouse.move(0, 0)
  await page.waitForTimeout(150)
}

async function capture(page: Page, name: string) {
  await waitForStableScreenshot(page)
  await expect(page).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
    fullPage: true,
    maxDiffPixels: 500,
    scale: 'css',
  })
}

async function login(page: Page) {
  await page.goto('/')
  await expect(page.locator('input[name="email"]')).toBeVisible()
  await page.locator('input[name="email"]').fill(E2E_EMAIL)
  await page.locator('input[name="password"]').fill(E2E_PASSWORD)
  await expect(page.locator('input[name="email"]')).toHaveValue(E2E_EMAIL)
  await expect(page.locator('input[name="password"]')).toHaveValue(E2E_PASSWORD)
  await page.getByRole('button', { name: '开门' }).click()
  await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
}

test.describe('visual regression baselines', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      process.platform !== 'win32',
      'Pixel baselines are generated on Windows; cross-platform rendering is covered by smoke E2E.',
    )
    test.skip(
      testInfo.project.name === 'mobile-webkit',
      'WebKit is smoke-only and has no pixel baseline',
    )
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await installStableRendering(page)
  })

  test('anonymous login and validation error', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Cui Hao.*Li Mutong/ })).toBeVisible()
    await capture(page, 'login-anonymous.png')

    await page.locator('input[name="email"]').fill('')
    await page.locator('input[name="password"]').fill('')
    await page.getByRole('button', { name: '开门' }).click()
    await expect(page.getByRole('alert')).toHaveText('请输入邮箱和密码')
    await capture(page, 'login-validation-error.png')
  })

  test('authenticated home seeded fixture', async ({ page }) => {
    await installAMapStub(page)
    await login(page)
    await expect(page.getByText('足迹地图')).toBeVisible({ timeout: 20_000 })
    await capture(page, 'home-seeded.png')
  })

  test('authenticated timeline seeded fixture', async ({ page }) => {
    await installAMapStub(page)
    await login(page)
    await page.goto('/timeline')
    await expect(page.getByRole('heading', { name: /Diary/ })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/条记录 · 共/)).toBeVisible()
    await capture(page, 'timeline-seeded.png')
  })

  test('authenticated journeys seeded fixture', async ({ page }) => {
    await installAMapStub(page)
    await login(page)
    await page.goto('/trips')
    await expect(page.getByRole('heading', { name: /Journeys/ })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('川西环线')).toBeVisible()
    await page.waitForTimeout(1_500)
    await capture(page, 'trips-seeded.png')
  })

  test('authenticated trip detail and record dialog', async ({ page }) => {
    await installAMapStub(page)
    await login(page)
    await page.goto(`/trip/${SEED_TRIP_ID}`)
    await expect(page.getByRole('heading', { name: '川西环线' })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('旅行路线')).toBeVisible()
    await expect(page.getByRole('button', { name: /查看记录：/ }).first()).toBeVisible({
      timeout: 20_000,
    })
    await capture(page, 'trip-detail-seeded.png')

    await page
      .getByRole('button', { name: /查看记录：/ })
      .first()
      .click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await capture(page, 'trip-detail-record-dialog.png')
  })

  test('authenticated add record seeded fixture', async ({ page }) => {
    await installAMapStub(page)
    await login(page)
    await page.goto('/add')
    await expect(page.getByRole('heading', { name: 'Record' })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('新建旅行')).toBeVisible({ timeout: 20_000 })
    await capture(page, 'add-record-seeded.png')
  })

  test('authenticated map error fallback', async ({ page }) => {
    await page.route('**://webapi.amap.com/**', (route) => route.abort())
    await login(page)
    await expect(page.getByText('地图加载失败')).toBeVisible({ timeout: 20_000 })
    await capture(page, 'home-map-error.png')
  })
})
