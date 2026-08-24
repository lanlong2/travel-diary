import { afterEach, describe, expect, it, vi } from 'vitest'

async function moduleWithEnv(key = 'browser-key', securityCode = 'security-code') {
  vi.resetModules()
  vi.stubEnv('VITE_AMAP_KEY', key)
  vi.stubEnv('VITE_AMAP_SECURITY_CODE', securityCode)
  return import('./amap')
}

function namespace() {
  return {
    Map: class {},
    Marker: class {},
    Pixel: class {},
  } as never
}

describe('loadAMap', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    delete window.AMap
    window._amap_ready = false
    delete window._AMapSecurityConfig
    document.head
      .querySelectorAll('script[src*="webapi.amap.com"]')
      .forEach((script) => script.remove())
  })

  it('rejects outside the browser and when the key is missing', async () => {
    const originalWindow = globalThis.window
    vi.stubGlobal('window', undefined)
    const server = await moduleWithEnv()
    await expect(server.loadAMap()).rejects.toThrow('地图只能在浏览器环境中加载')
    vi.stubGlobal('window', originalWindow)

    const missing = await moduleWithEnv('')
    await expect(missing.loadAMap()).rejects.toThrow('地图服务未配置')
  })

  it('returns an already initialized namespace without adding a script', async () => {
    const module = await moduleWithEnv()
    const amap = namespace()
    window.AMap = amap
    window._amap_ready = true
    await expect(module.loadAMap()).resolves.toBe(amap)
    expect(document.head.querySelector('script[src*="webapi.amap.com"]')).toBeNull()
  })

  it('loads one shared script promise, applies security config and resolves on readiness', async () => {
    const module = await moduleWithEnv()
    const first = module.loadAMap()
    const second = module.loadAMap()
    expect(second).toBe(first)
    expect(window._AMapSecurityConfig).toEqual({ securityJsCode: 'security-code' })
    const script = document.head.querySelector<HTMLScriptElement>('script[src*="webapi.amap.com"]')!
    expect(script.src).toContain('key=browser-key')
    expect(script.async).toBe(true)

    const amap = namespace()
    window.AMap = amap
    script.onload?.(new Event('load'))
    await expect(first).resolves.toBe(amap)
    expect(window._amap_ready).toBe(true)
  })

  it('supports delayed namespace initialization after script load', async () => {
    vi.useFakeTimers()
    const module = await moduleWithEnv()
    const promise = module.loadAMap()
    const script = document.head.querySelector<HTMLScriptElement>('script[src*="webapi.amap.com"]')!
    script.onload?.(new Event('load'))
    const amap = namespace()
    window.AMap = amap
    await vi.advanceTimersByTimeAsync(100)
    await expect(promise).resolves.toBe(amap)
  })

  it('rejects script errors and permits a fresh retry', async () => {
    const module = await moduleWithEnv()
    const first = module.loadAMap()
    const firstScript = document.head.querySelector<HTMLScriptElement>(
      'script[src*="webapi.amap.com"]',
    )!
    firstScript.onerror?.(new Event('error'))
    await expect(first).rejects.toThrow('高德地图 JS 加载失败')
    firstScript.remove()

    const second = module.loadAMap()
    const secondScript = document.head.querySelector<HTMLScriptElement>(
      'script[src*="webapi.amap.com"]',
    )!
    expect(second).not.toBe(first)
    secondScript.onerror?.(new Event('error'))
    await expect(second).rejects.toThrow('高德地图 JS 加载失败')
  })

  it('times out when the namespace never appears and allows retry', async () => {
    vi.useFakeTimers()
    const module = await moduleWithEnv('browser-key', '')
    const promise = module.loadAMap()
    const rejection = expect(promise).rejects.toThrow('高德地图初始化超时')
    const script = document.head.querySelector<HTMLScriptElement>('script[src*="webapi.amap.com"]')!
    script.onload?.(new Event('load'))
    await vi.advanceTimersByTimeAsync(5_100)
    await rejection
    expect(window._AMapSecurityConfig).toBeUndefined()
  })
})
