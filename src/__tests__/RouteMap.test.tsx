import { waitFor, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { loadAMap } from '../lib/amap'
import { RouteMap } from '../components/trip/RouteMap'

vi.mock('../lib/amap', () => ({
  loadAMap: vi.fn(),
}))

const fakeMap = {
  destroy: vi.fn(),
  add: vi.fn(),
  setFitView: vi.fn(),
  clearMap: vi.fn(),
}

const fakeAMap = {
  Map: vi.fn(function mapConstructor() {
    return fakeMap
  }),
  Marker: vi.fn(function markerConstructor() {
    return {}
  }),
  Pixel: vi.fn(function pixelConstructor() {
    return {}
  }),
  Polyline: vi.fn(function polylineConstructor() {
    return { setOptions: vi.fn() }
  }),
}

describe('RouteMap', () => {
  it('initializes when cities are added after an empty state', async () => {
    vi.mocked(loadAMap).mockResolvedValue(fakeAMap)

    const { rerender } = render(<RouteMap cities={[]} />)
    rerender(
      <RouteMap
        cities={[
          {
            id: 'city-1',
            trip_id: 'trip-1',
            city_name: '杭州',
            lat: 30.2741,
            lng: 120.1551,
            sort_order: 0,
          },
        ]}
      />,
    )

    await waitFor(() => expect(fakeAMap.Map).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(fakeMap.setFitView).toHaveBeenCalled())
  })
})
