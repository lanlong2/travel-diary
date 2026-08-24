import { expect, test, type Page } from '@playwright/test'
import { E2E_EMAIL, E2E_PASSWORD, E2E_TRIP_PREFIX } from './fixture'

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

async function installAMapStub(page: Page) {
  await page.addInitScript(() => {
    class MapMock {
      add() {}
      clearMap() {}
      destroy() {}
      setFitView() {}
      lngLatToContainer() {
        return { x: 20, y: 20 }
      }
    }
    class OverlayMock {
      on() {}
      setMap() {}
      setOptions() {}
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

    Object.assign(globalThis, {
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

async function login(page: Page) {
  await page.goto('/')
  await page.getByLabel('邮箱').fill(E2E_EMAIL)
  await page.getByLabel('密码').fill(E2E_PASSWORD)
  await page.getByRole('button', { name: '开门' }).click()
  await expect(page.getByText('足迹地图')).toBeVisible()
}

async function selectCity(page: Page, city = '杭州') {
  await page.getByLabel('搜索城市').fill(city)
  await page.getByRole('button', { name: city, exact: true }).click()
  await expect(page.getByText(`已选择 · 点击更改`)).toBeVisible()
}

test.describe('authenticated diary workflow', () => {
  test.setTimeout(90_000)

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await installAMapStub(page)
  })

  test('keeps the session across refresh and direct child routes', async ({ page }) => {
    await login(page)
    await page.goto('/timeline')
    await expect(page.getByRole('heading', { name: /Diary/ })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: /Diary/ })).toBeVisible()

    await page.goto('/path-that-does-not-exist')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('足迹地图')).toBeVisible()
  })

  test('creates, edits and deletes a trip plus text and photo records', async ({
    page,
  }, testInfo) => {
    const suffix = `${testInfo.project.name}-${Date.now()}`
    const tripTitle = `${E2E_TRIP_PREFIX}${suffix}`
    const editedTripTitle = `${tripTitle} · 已编辑`
    const note = `文字记录 ${suffix}`
    const editedNote = `${note} · 已编辑`
    const photoNote = `照片记录 ${suffix}`

    await login(page)
    await page.goto('/add')
    await page.getByRole('button', { name: '文字', exact: true }).click()
    await page.getByLabel('想说的话').fill(note)
    await selectCity(page)
    await page.getByRole('button', { name: '新建旅行' }).click()
    await page.getByLabel('旅行标题').fill(tripTitle)
    await page.getByRole('button', { name: '创建', exact: true }).click()
    await expect(page.getByText('新旅行已创建')).toBeVisible()
    await page.getByRole('button', { name: '保存', exact: true }).click()

    await expect(page.getByRole('heading', { name: tripTitle })).toBeVisible()
    const tripUrl = page.url()
    await expect(page.getByRole('button', { name: '查看记录：杭州' })).toBeVisible()

    await page.getByRole('button', { name: '编辑', exact: true }).first().click()
    await page.getByLabel('旅行标题').fill(editedTripTitle)
    await page.getByRole('button', { name: '保存', exact: true }).click()
    await expect(page.getByRole('heading', { name: editedTripTitle })).toBeVisible()

    await page.getByRole('button', { name: '查看记录：杭州' }).click()
    await expect(page.getByRole('dialog')).toContainText(note)
    await page.getByRole('dialog').getByRole('button', { name: '编辑' }).click()
    await page.getByLabel('留言').fill(editedNote)
    await page.getByRole('dialog').getByRole('button', { name: '保存', exact: true }).click()
    await expect(page.getByRole('dialog')).toContainText(editedNote)
    await page.getByRole('dialog').getByRole('button', { name: '删除' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: '确认删除' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    await page.goto(`${new URL(tripUrl).pathname.replace('/trip/', '/add?trip=')}`)
    await page.getByLabel('选择照片').setInputFiles({
      name: 'e2e.png',
      mimeType: 'image/png',
      buffer: ONE_PIXEL_PNG,
    })
    await selectCity(page)
    await page.getByLabel('想说的话').fill(photoNote)
    await page.getByRole('button', { name: '保存', exact: true }).click()
    await expect(page.getByRole('heading', { name: editedTripTitle })).toBeVisible()
    await page.getByRole('button', { name: `查看记录：${photoNote}` }).click()
    await expect(page.getByRole('dialog').getByRole('img')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: '删除' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: '确认删除' }).click()

    await page.getByRole('button', { name: '删除', exact: true }).first().click()
    await page.getByRole('alertdialog').getByRole('button', { name: '确认删除' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: editedTripTitle })).not.toBeVisible()
  })
})
