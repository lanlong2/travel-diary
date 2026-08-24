import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createRecord: vi.fn(),
  createTrip: vi.fn(),
  signIn: vi.fn(),
  tripsQuery: { data: [] as unknown[] },
}))
vi.mock('../hooks/useTrips', () => ({
  useTripsQuery: () => mocks.tripsQuery,
  useTripMutations: () => ({ createTrip: mocks.createTrip }),
}))
vi.mock('../hooks/usePhotos', () => ({
  usePhotoMutations: () => ({ createRecord: mocks.createRecord }),
}))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ signIn: mocks.signIn }) }))
vi.mock('../components/layout/PageShell', () => ({
  PageShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))
vi.mock('../components/add/PhotoUploader', () => ({
  PhotoUploader: ({ onFileSelect }: { onFileSelect: (file: File) => void }) => (
    <button onClick={() => onFileSelect(new File(['x'], 'photo.jpg', { type: 'image/jpeg' }))}>
      choose-photo
    </button>
  ),
}))
vi.mock('../components/add/CitySelector', () => ({
  CitySelector: ({
    onCitySelect,
    selectedCity,
  }: {
    onCitySelect: (city: { name: string; lat: number; lng: number } | null) => void
    selectedCity: { name: string } | null
  }) => (
    <button onClick={() => onCitySelect(selectedCity ? null : { name: '上海', lat: 31, lng: 121 })}>
      {selectedCity ? 'clear-city' : 'choose-city'}
    </button>
  ),
}))
vi.mock('../components/add/TripSelect', () => ({
  TripSelect: ({
    onSelectTrip,
    onCreateTrip,
  }: {
    onSelectTrip: (id: string) => void
    onCreateTrip: (title: string, start: string, end: string) => Promise<void>
  }) => (
    <div>
      <button onClick={() => onSelectTrip('t1')}>choose-trip</button>
      <button
        onClick={() => {
          void onCreateTrip('新旅行', '2026-08-01', '2026-08-02').catch(() => undefined)
        }}
      >
        create-trip
      </button>
    </div>
  ),
}))
vi.mock('../components/add/AuthorSelect', () => ({
  AuthorSelect: ({ onChange }: { onChange: (value: '我' | '她') => void }) => (
    <button onClick={() => onChange('她')}>choose-author</button>
  ),
}))
vi.mock('../components/add/NoteInput', () => ({
  NoteInput: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      aria-label="记录内容"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

import { AddRecordPage } from './AddRecordPage'
import { LoginPage } from './LoginPage'

describe('record and login pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createRecord.mockResolvedValue({ id: 'p1' })
    mocks.createTrip.mockResolvedValue({ id: 'new-trip' })
    mocks.signIn.mockResolvedValue({ error: null })
  })

  it('creates a complete photo record using selected file, city, trip and author', async () => {
    render(
      <MemoryRouter initialEntries={['/add']}>
        <AddRecordPage />
      </MemoryRouter>,
    )
    expect(screen.getByText(/正在内容/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'choose-photo' }))
    fireEvent.click(screen.getByRole('button', { name: 'choose-author' }))
    fireEvent.click(screen.getByRole('button', { name: 'choose-city' }))
    fireEvent.click(screen.getByRole('button', { name: 'choose-trip' }))
    fireEvent.change(screen.getByLabelText('记录内容'), { target: { value: '照片说明' } })
    fireEvent.change(screen.getByLabelText('日期'), { target: { value: '2026-08-20' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() =>
      expect(mocks.createRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          tripId: 't1',
          cityName: '上海',
          author: '她',
          entryType: 'photo',
          note: '照片说明',
          recordDate: '2026-08-20',
          file: expect.any(File),
        }),
      ),
    )
    expect(await screen.findByText('已保存')).toBeInTheDocument()
  })

  it('creates a note record, clears photo state and reports save failures', async () => {
    mocks.createRecord.mockRejectedValueOnce(new Error('写入失败'))
    render(
      <MemoryRouter>
        <AddRecordPage />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: '照片' }))
    fireEvent.click(screen.getByRole('button', { name: '文字' }))
    fireEvent.change(screen.getByLabelText('记录内容'), { target: { value: '一段文字' } })
    fireEvent.click(screen.getByRole('button', { name: 'choose-city' }))
    fireEvent.click(screen.getByRole('button', { name: 'choose-trip' }))
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('保存失败：写入失败')).toBeInTheDocument()
    expect(mocks.createRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        entryType: 'note',
        file: null,
        note: '一段文字',
      }),
    )
  })

  it('creates a trip with the current city and handles trip creation errors', async () => {
    render(
      <MemoryRouter>
        <AddRecordPage />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'choose-city' }))
    fireEvent.click(screen.getByRole('button', { name: 'create-trip' }))
    await waitFor(() =>
      expect(mocks.createTrip).toHaveBeenCalledWith(expect.objectContaining({ title: '新旅行' }), [
        { city_name: '上海', lat: 31, lng: 121, sort_order: 0 },
      ]),
    )
    expect(await screen.findByText('新旅行已创建')).toBeInTheDocument()

    mocks.createTrip.mockRejectedValueOnce('服务失败')
    fireEvent.click(screen.getByRole('button', { name: 'create-trip' }))
    expect(await screen.findByText('创建旅行失败：服务失败')).toBeInTheDocument()
  })

  it('validates login fields and shows authentication errors', async () => {
    render(<LoginPage />)
    const email = screen.getByLabelText('邮箱')
    const password = screen.getByLabelText('密码')
    fireEvent.change(email, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: '开门' }))
    expect(screen.getByRole('alert')).toHaveTextContent('请输入邮箱和密码')

    fireEvent.change(email, { target: { value: 'member@test.local' } })
    fireEvent.change(password, { target: { value: 'secret' } })
    mocks.signIn.mockResolvedValueOnce({ error: '邮箱或密码错误' })
    fireEvent.click(screen.getByRole('button', { name: '开门' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('邮箱或密码错误'))
    expect(mocks.signIn).toHaveBeenCalledWith('member@test.local', 'secret')
  })

  it('completes successful login and always clears loading state', async () => {
    let resolve!: (value: { error: null }) => void
    mocks.signIn.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done
      }),
    )
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: '开门' }))
    expect(screen.getByRole('button', { name: '登录中' })).toBeDisabled()
    resolve({ error: null })
    await waitFor(() => expect(screen.getByRole('button', { name: '开门' })).toBeEnabled())
  })
})
