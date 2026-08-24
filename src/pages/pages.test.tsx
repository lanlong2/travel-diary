import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  tripsState: {} as Record<string, unknown>,
  photosState: {} as Record<string, unknown>,
  tripState: {} as Record<string, unknown>,
  mutations: {} as Record<string, ReturnType<typeof vi.fn>>,
}))

vi.mock('../hooks/useTrips', () => ({
  useTripsQuery: () => ({
    data: mocks.tripsState.trips,
    isPending: mocks.tripsState.loading,
    error: mocks.tripsState.error ? new Error(String(mocks.tripsState.error)) : null,
    refetch: mocks.tripsState.refresh,
  }),
  useTripQuery: () => ({
    data: mocks.tripState.trip,
    isPending: mocks.tripState.loading,
    error: mocks.tripState.error ? new Error(String(mocks.tripState.error)) : null,
    refetch: mocks.tripState.refresh,
  }),
  useTripMutations: () => ({
    ...mocks.mutations,
    deleteTrip: mocks.tripsState.deleteTrip ?? mocks.mutations.deleteTrip,
  }),
}))
vi.mock('../hooks/usePhotos', () => ({
  usePhotosQuery: () => ({
    data: mocks.photosState.photos,
    isPending: mocks.photosState.loading,
    error: mocks.photosState.error ? new Error(String(mocks.photosState.error)) : null,
    refetch: mocks.photosState.refresh,
  }),
  usePhotoMutations: () => ({
    updatePhoto: mocks.photosState.updatePhoto,
    deletePhoto: mocks.photosState.deletePhoto,
  }),
  usePhotos: () => mocks.photosState,
}))
vi.mock('../hooks/useCountUp', () => ({ useCountUp: (value: number) => value }))
vi.mock('../components/layout/PageShell', () => ({
  PageShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))
vi.mock('../components/home/DayCounter', () => ({ DayCounter: () => <div>day-counter</div> }))
vi.mock('../components/home/ChinaMap', () => ({
  ChinaMap: ({
    cities,
    onCityClick,
  }: {
    cities: unknown[]
    onCityClick: (city: unknown) => void
  }) => <button onClick={() => onCityClick(cities[0])}>map-{cities.length}</button>,
}))
vi.mock('../components/home/TripCard', () => ({
  TripCard: ({
    trip,
    onClick,
    onDelete,
  }: {
    trip: { title: string; id: string }
    onClick: () => void
    onDelete: (id: string) => void
  }) => (
    <div>
      <button onClick={onClick}>card-{trip.title}</button>
      <button onClick={() => onDelete(trip.id)}>delete-{trip.id}</button>
    </div>
  ),
}))
vi.mock('../components/timeline/MonthDivider', () => ({
  MonthDivider: ({ label }: { label: string }) => <h2>{label}</h2>,
}))
vi.mock('../components/timeline/TimelineCard', () => ({
  TimelineCard: ({ record, onClick }: { record: { id: string }; onClick: () => void }) => (
    <button onClick={onClick}>timeline-{record.id}</button>
  ),
}))
vi.mock('../components/trip/TripHeader', () => ({
  TripHeader: ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => Promise<void> }) => (
    <div>
      <button onClick={onEdit}>edit-trip</button>
      <button onClick={() => void onDelete()}>delete-trip</button>
    </div>
  ),
}))
vi.mock('../components/trip/RouteMap', () => ({
  RouteMap: ({ cities }: { cities: unknown[] }) => <div>route-{cities.length}</div>,
}))
vi.mock('../components/trip/PhotoGrid', () => ({
  PhotoGrid: ({
    photos,
    onPhotoClick,
    onRetry,
    onDeletePhoto,
  }: {
    photos: Array<{ id: string }>
    onPhotoClick: (photo: { id: string }) => void
    onRetry: () => void
    onDeletePhoto: (id: string) => void
  }) => (
    <div>
      <button onClick={() => photos[0] && onPhotoClick(photos[0])}>grid</button>
      <button onClick={onRetry}>grid-retry</button>
      <button onClick={() => onDeletePhoto('p1')}>grid-delete</button>
    </div>
  ),
}))
vi.mock('../components/trip/PhotoModal', () => ({
  PhotoModal: ({
    onClose,
    onDelete,
    onUpdate,
  }: {
    onClose: () => void
    onDelete: (id: string) => void
    onUpdate: (id: string, value: unknown) => void
  }) => (
    <div>
      photo-modal<button onClick={onClose}>modal-close</button>
      <button onClick={() => onDelete('p1')}>modal-delete</button>
      <button onClick={() => onUpdate('p1', { note: 'x' })}>modal-update</button>
    </div>
  ),
}))
vi.mock('../components/add/CitySelector', () => ({
  CitySelector: ({
    onCitySelect,
  }: {
    onCitySelect: (city: { name: string; lat: number; lng: number } | null) => void
  }) => (
    <div>
      <button onClick={() => onCitySelect({ name: '苏州', lat: 31.3, lng: 120.6 })}>
        select-city
      </button>
      <button onClick={() => onCitySelect(null)}>clear-city</button>
    </div>
  ),
}))

import { HomePage } from './HomePage'
import { TimelinePage } from './TimelinePage'
import { TripsPage } from './TripsPage'
import { TripDetailPage } from './TripDetailPage'

const trip = {
  id: 't1',
  title: '江南',
  cover_photo: 'cover.jpg',
  start_date: '2026-08-01',
  end_date: '2026-08-03',
  created_by: '我',
  created_at: '2026-08-01T00:00:00Z',
  cities: [{ id: 'c1', trip_id: 't1', city_name: '上海', lat: 31, lng: 121, sort_order: 0 }],
}
const photo = {
  id: 'p1',
  trip_id: 't1',
  city_name: '上海',
  image_url: 'photo.jpg',
  note: '照片',
  author: '我',
  entry_type: 'photo',
  record_date: '2026-08-02',
  created_at: '2026-08-02T00:00:00Z',
}
const note = {
  ...photo,
  id: 'n1',
  image_url: null,
  note: '文字回忆',
  entry_type: 'note',
  record_date: '2026-08-03',
}

function route(element: ReactNode, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('page state orchestration', () => {
  beforeEach(() => {
    mocks.mutations = {
      deleteTrip: vi.fn().mockResolvedValue(undefined),
      updateTrip: vi.fn().mockResolvedValue(undefined),
      addCity: vi.fn().mockResolvedValue(undefined),
      removeCity: vi.fn().mockResolvedValue(undefined),
    }
    mocks.tripsState = {
      trips: [trip],
      loading: false,
      error: null,
      deleteTrip: vi.fn(),
      refresh: vi.fn(),
    }
    mocks.photosState = {
      photos: [photo, note],
      loading: false,
      error: null,
      refresh: vi.fn(),
      updatePhoto: vi.fn(),
      deletePhoto: vi.fn(),
    }
    mocks.tripState = { trip, loading: false, error: null, refresh: vi.fn() }
  })

  it('renders Home loading and trip error states with retry', () => {
    mocks.tripsState = { ...mocks.tripsState, loading: true }
    mocks.photosState = { ...mocks.photosState, loading: true }
    const loading = route(<HomePage />)
    expect(screen.getByText('加载中')).toBeInTheDocument()
    loading.unmount()

    const refresh = vi.fn()
    mocks.tripsState = { ...mocks.tripsState, loading: false, error: '网络错误', refresh }
    route(<HomePage />)
    fireEvent.click(screen.getByRole('button', { name: '重试' }))
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('renders complete Home content and executes photo/map/trip/error actions', () => {
    const refreshPhotos = vi.fn()
    mocks.photosState = { ...mocks.photosState, error: '照片错误', refresh: refreshPhotos }
    route(<HomePage />)
    expect(screen.getByText('最近照片')).toBeInTheDocument()
    expect(screen.getByText('最近记录')).toBeInTheDocument()
    expect(screen.getByText('最近旅行')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'map-1' }))
    fireEvent.click(screen.getByRole('button', { name: '上海' }))
    fireEvent.click(screen.getByText('文字回忆').closest('button')!)
    fireEvent.click(screen.getByRole('button', { name: 'card-江南' }))
    fireEvent.click(screen.getAllByRole('button', { name: '重试' })[0])
    expect(refreshPhotos).toHaveBeenCalledOnce()
  })

  it('renders the empty Home state', () => {
    mocks.tripsState = { ...mocks.tripsState, trips: [] }
    mocks.photosState = { ...mocks.photosState, photos: [] }
    route(<HomePage />)
    expect(screen.getByText(/等待第一段旅程/)).toBeInTheDocument()
  })

  it('covers Timeline loading, failure, empty and grouped record states', () => {
    mocks.photosState = { ...mocks.photosState, loading: true }
    let view = route(<TimelinePage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    view.unmount()

    const refresh = vi.fn()
    mocks.photosState = { ...mocks.photosState, loading: false, error: '失败', refresh }
    view = route(<TimelinePage />)
    fireEvent.click(screen.getByRole('button', { name: '重试' }))
    expect(refresh).toHaveBeenCalledOnce()
    view.unmount()

    mocks.photosState = { ...mocks.photosState, error: null, photos: [] }
    view = route(<TimelinePage />)
    expect(screen.getByText(/等待第一笔/)).toBeInTheDocument()
    view.unmount()

    mocks.photosState = { ...mocks.photosState, photos: [photo, note] }
    route(<TimelinePage />)
    expect(screen.getByText('2026年8月')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'timeline-n1' }))
  })

  it('covers Trips loading, failure, empty, photo error and alternating cards', () => {
    mocks.tripsState = { ...mocks.tripsState, loading: true }
    let view = route(<TripsPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    view.unmount()

    const refreshTrips = vi.fn()
    mocks.tripsState = { ...mocks.tripsState, loading: false, error: '失败', refresh: refreshTrips }
    view = route(<TripsPage />)
    fireEvent.click(screen.getByRole('button', { name: '重试' }))
    expect(refreshTrips).toHaveBeenCalledOnce()
    view.unmount()

    mocks.tripsState = { ...mocks.tripsState, error: null, trips: [] }
    view = route(<TripsPage />)
    expect(screen.getByText(/暂无旅行/)).toBeInTheDocument()
    view.unmount()

    const second = { ...trip, id: 't2', title: '北方', cities: [], cover_photo: 'north.jpg' }
    const third = { ...trip, id: 't3', title: '无封面', cover_photo: null }
    const refreshPhotos = vi.fn()
    mocks.tripsState = { ...mocks.tripsState, trips: [trip, second, third] }
    mocks.photosState = { ...mocks.photosState, error: '统计失败', refresh: refreshPhotos }
    route(<TripsPage />)
    expect(screen.getAllByRole('img')).toHaveLength(2)
    fireEvent.click(
      screen.getByText('照片统计加载失败：统计失败').parentElement!.querySelector('button')!,
    )
    expect(refreshPhotos).toHaveBeenCalledOnce()
  })

  it('covers TripDetail loading, missing and failed missing states', () => {
    mocks.tripState = { trip: null, loading: true, error: null, refresh: vi.fn() }
    let view = route(<TripDetailPage />, '/trip/t1')
    expect(screen.getByRole('status')).toBeInTheDocument()
    view.unmount()

    mocks.tripState = { trip: null, loading: false, error: null, refresh: vi.fn() }
    view = route(<TripDetailPage />, '/trip/t1')
    expect(screen.getByText('找不到这次旅行')).toBeInTheDocument()
    view.unmount()

    const refresh = vi.fn()
    mocks.tripState = { trip: null, loading: false, error: '读取失败', refresh }
    route(<TripDetailPage />, '/trip/t1')
    fireEvent.click(screen.getByRole('button', { name: '重试' }))
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('edits a trip, mutates cities and opens the selected record modal', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined)
    mocks.tripState = { trip, loading: false, error: null, refresh }
    route(<TripDetailPage />, '/trip/t1')
    fireEvent.click(screen.getByRole('button', { name: 'edit-trip' }))
    expect(screen.getByText('编辑旅行')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('旅行标题'), { target: { value: '新江南' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() =>
      expect(mocks.mutations.updateTrip).toHaveBeenCalledWith(
        't1',
        expect.objectContaining({ title: '新江南' }),
      ),
    )

    fireEvent.click(screen.getByRole('button', { name: 'edit-trip' }))
    fireEvent.click(screen.getByRole('button', { name: '移除城市：上海' }))
    await waitFor(() => expect(mocks.mutations.removeCity).toHaveBeenCalledWith('c1'))
    fireEvent.click(screen.getByRole('button', { name: 'select-city' }))
    await waitFor(() => expect(mocks.mutations.addCity).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'clear-city' }))

    fireEvent.click(screen.getByRole('button', { name: 'grid' }))
    expect(screen.getByText('photo-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'modal-update' }))
    fireEvent.click(screen.getByRole('button', { name: 'modal-delete' }))
    fireEvent.click(screen.getByRole('button', { name: 'modal-close' }))
  })

  it('surfaces mutation failures in TripDetail and retries actions', async () => {
    mocks.mutations.updateTrip.mockRejectedValueOnce(new Error('保存失败'))
    mocks.mutations.removeCity.mockRejectedValueOnce('移除失败')
    mocks.mutations.addCity.mockRejectedValueOnce(new Error('添加失败'))
    route(<TripDetailPage />, '/trip/t1')
    fireEvent.click(screen.getByRole('button', { name: 'edit-trip' }))
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await screen.findByText('保存失败')
    fireEvent.click(screen.getByRole('button', { name: '移除城市：上海' }))
    await screen.findByText('移除城市失败，请稍后重试')
    fireEvent.click(screen.getByRole('button', { name: 'select-city' }))
    await screen.findByText('添加失败')
  })
})
