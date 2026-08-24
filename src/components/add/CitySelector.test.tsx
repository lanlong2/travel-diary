import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ loadAMap: vi.fn() }))
vi.mock('../../lib/amap', () => ({ loadAMap: mocks.loadAMap }))

import { CitySelector } from './CitySelector'

function searchMap(tips: unknown[] = []) {
  const search = vi.fn(
    (_keyword: string, callback: (status: string, result: { tips: unknown[] }) => void) => {
      callback('complete', { tips })
    },
  )
  class AutoComplete {
    search = search
  }
  return {
    plugin: vi.fn((_name: string, callback: () => void) => callback()),
    AutoComplete,
    search,
  }
}

describe('CitySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders and clears the currently selected city', () => {
    const onCitySelect = vi.fn()
    render(
      <CitySelector
        selectedCity={{ name: '上海', lat: 31.23, lng: 121.47 }}
        onCitySelect={onCitySelect}
      />,
    )
    expect(screen.getByText('31.230, 121.470')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '清除城市：上海' }))
    expect(onCitySelect).toHaveBeenCalledWith(null)
  })

  it('debounces search, filters locationless tips and selects a suggestion', async () => {
    const onCitySelect = vi.fn()
    const map = searchMap([
      { name: '上海', location: { lat: 31.2, lng: 121.5 } },
      { name: '无坐标' },
    ])
    mocks.loadAMap.mockResolvedValue(map)
    render(<CitySelector selectedCity={null} onCitySelect={onCitySelect} />)
    const input = screen.getByRole('textbox', { name: '搜索城市' })
    fireEvent.change(input, { target: { value: '上' } })
    expect(screen.getByText('未找到匹配的城市')).toBeInTheDocument()
    await act(() => vi.advanceTimersByTimeAsync(400))
    expect(screen.getByRole('button', { name: '上海' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '上海' }))
    expect(onCitySelect).toHaveBeenCalledWith({ name: '上海', lat: 31.2, lng: 121.5 })
    expect(input).toHaveValue('')
  })

  it('shows a safe search error for loading and plugin failures', async () => {
    mocks.loadAMap.mockRejectedValueOnce(new Error('offline'))
    const { rerender } = render(<CitySelector selectedCity={null} onCitySelect={vi.fn()} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '苏州' } })
    await act(() => vi.advanceTimersByTimeAsync(400))
    expect(screen.getByRole('alert')).toHaveTextContent('地图服务暂时不可用')

    mocks.loadAMap.mockResolvedValueOnce({ plugin: undefined, AutoComplete: undefined })
    rerender(<CitySelector selectedCity={null} onCitySelect={vi.fn()} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '杭州' } })
    await act(() => vi.advanceTimersByTimeAsync(400))
    expect(screen.getByRole('alert')).toHaveTextContent('地图服务暂时不可用')
  })

  it('reports unsupported and denied geolocation', async () => {
    const original = navigator.geolocation
    Reflect.deleteProperty(navigator, 'geolocation')
    const view = render(<CitySelector selectedCity={null} onCitySelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '自动定位' }))
    expect(screen.getByRole('alert')).toHaveTextContent('当前设备不支持定位')
    view.unmount()

    const getCurrentPosition = vi.fn((_success, failure: PositionErrorCallback) =>
      failure({} as never),
    )
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })
    render(<CitySelector selectedCity={null} onCitySelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '自动定位' }))
    expect(screen.getByRole('alert')).toHaveTextContent('检查浏览器定位权限')
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: original })
  })

  it('reverse geocodes the current position and reports an unrecognized address', async () => {
    const onCitySelect = vi.fn()
    let positionSuccess!: PositionCallback
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) => {
          positionSuccess = success
        }),
      },
    })
    const getAddress = vi.fn(
      (_point: number[], callback: (status: string, result: unknown) => void) => {
        callback('complete', { regeocode: { addressComponent: { city: '南京' } } })
      },
    )
    class Geocoder {
      getAddress = getAddress
    }
    mocks.loadAMap.mockResolvedValue({
      plugin: vi.fn((_name: string, callback: () => void) => callback()),
      Geocoder,
    })
    render(<CitySelector selectedCity={null} onCitySelect={onCitySelect} />)
    fireEvent.click(screen.getByRole('button', { name: '自动定位' }))
    await act(async () => positionSuccess({ coords: { latitude: 32, longitude: 118.8 } } as never))
    expect(onCitySelect).toHaveBeenCalledWith({ name: '南京', lat: 32, lng: 118.8 })

    getAddress.mockImplementationOnce((_point, callback) =>
      callback('complete', { regeocode: { addressComponent: {} } }),
    )
    fireEvent.click(screen.getByRole('button', { name: '自动定位' }))
    await act(async () => positionSuccess({ coords: { latitude: 30, longitude: 120 } } as never))
    expect(screen.getByRole('alert')).toHaveTextContent('无法识别当前位置')
  })

  it('handles unavailable reverse-geocoding services', async () => {
    let positionSuccess!: PositionCallback
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) => {
          positionSuccess = success
        }),
      },
    })
    mocks.loadAMap.mockResolvedValue({ plugin: undefined, Geocoder: undefined })
    render(<CitySelector selectedCity={null} onCitySelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '自动定位' }))
    await act(async () => positionSuccess({ coords: { latitude: 0, longitude: 0 } } as never))
    expect(screen.getByRole('alert')).toHaveTextContent('定位服务暂时不可用')
  })
})
