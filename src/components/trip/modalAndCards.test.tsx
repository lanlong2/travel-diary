import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PhotoModal } from './PhotoModal'
import { TripHeader } from './TripHeader'
import { TripCard } from '../home/TripCard'
import { CityPopup } from '../home/CityPopup'
import { DayCounter } from '../home/DayCounter'
import { NoteInput } from '../add/NoteInput'

const trip = {
  id: 't1',
  title: '江南',
  cover_photo: 'cover.jpg',
  start_date: '2026-08-01',
  end_date: '2026-08-03',
  created_by: '我',
  created_at: '2026-08-01T00:00:00Z',
}
const photo = {
  id: 'p1',
  trip_id: 't1',
  city_name: '上海',
  image_url: 'photo.jpg',
  note: '黄昏',
  author: '我',
  entry_type: 'photo',
  record_date: '2026-08-02',
  created_at: '2026-08-02T00:00:00Z',
}

describe('record modal and travel cards', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        callback(1)
        return 1
      }),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('scrollTo', vi.fn())
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  })

  it('shows a photo, handles broken images and closes from controls or backdrop', () => {
    const onClose = vi.fn()
    const view = render(<PhotoModal photo={photo as never} onClose={onClose} />)
    const image = screen.getByRole('img', { name: '黄昏' })
    fireEvent.error(image)
    expect(screen.getByRole('img', { name: '上海的照片暂时无法显示' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '关闭' }))
    expect(onClose).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(2)
    view.unmount()
  })

  it('renders a text-only record and resets fields when the photo changes', () => {
    const note = { ...photo, image_url: null, entry_type: 'note', record_date: null }
    const { rerender } = render(
      <PhotoModal photo={note as never} onClose={vi.fn()} onUpdate={vi.fn()} />,
    )
    expect(screen.getByRole('img', { name: '文字记录' })).toHaveTextContent('黄昏')
    fireEvent.click(screen.getByRole('button', { name: '编辑' }))
    fireEvent.change(screen.getByLabelText('留言'), { target: { value: 'changed' } })
    rerender(
      <PhotoModal
        photo={{ ...note, id: 'p2', note: '' } as never}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('留言')).toHaveValue('')
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(screen.getByText('没有留言')).toBeInTheDocument()
  })

  it('validates and saves normalized edits', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined)
    render(<PhotoModal photo={photo as never} onClose={vi.fn()} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByRole('button', { name: '编辑' }))
    fireEvent.change(screen.getByLabelText('城市'), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(screen.getByRole('alert')).toHaveTextContent('城市不能为空')

    fireEvent.change(screen.getByLabelText('城市'), { target: { value: ' 苏州 ' } })
    fireEvent.change(screen.getByLabelText('留言'), { target: { value: ' 新留言 ' } })
    fireEvent.change(screen.getByLabelText('日期'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith('p1', {
        note: '新留言',
        city_name: '苏州',
        record_date: null,
      }),
    )
    expect(screen.queryByLabelText('留言')).not.toBeInTheDocument()
  })

  it('shows save failures and lets editing be cancelled', async () => {
    const onUpdate = vi.fn().mockRejectedValueOnce('failure')
    render(<PhotoModal photo={photo as never} onClose={vi.fn()} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByRole('button', { name: '编辑' }))
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('操作失败，请稍后重试')
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(screen.queryByLabelText('留言')).not.toBeInTheDocument()
  })

  it('deletes successfully and surfaces a retryable failure', async () => {
    const onClose = vi.fn()
    const onDelete = vi
      .fn()
      .mockRejectedValueOnce(new Error('无权限'))
      .mockResolvedValueOnce(undefined)
    render(<PhotoModal photo={photo as never} onClose={onClose} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    fireEvent.click(screen.getByRole('button', { name: '确认删除' }))
    expect(await screen.findByText('删除失败：无权限')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '重试删除' }))
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(onDelete).toHaveBeenCalledTimes(2)
  })

  it('renders TripHeader cover and fallback, edit/back/delete success and failure', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn().mockRejectedValueOnce('failed').mockResolvedValueOnce(undefined)
    const { rerender } = render(
      <MemoryRouter>
        <TripHeader trip={trip as never} onEdit={onEdit} onDelete={onDelete} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('img', { name: '江南' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '编辑' }))
    expect(onEdit).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    fireEvent.click(screen.getByRole('button', { name: '确认删除' }))
    expect(await screen.findByText(/删除失败/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '重试删除' }))
    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(2))

    rerender(
      <MemoryRouter>
        <TripHeader trip={{ ...trip, cover_photo: null } as never} />
      </MemoryRouter>,
    )
    expect(screen.getByText('江')).toBeInTheDocument()
  })

  it('renders TripCard variants and confirms deletion', async () => {
    const onClick = vi.fn()
    const onDelete = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(
      <TripCard
        trip={trip as never}
        cityCount={2}
        index={7}
        onClick={onClick}
        onDelete={onDelete}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '查看旅行：江南' }))
    expect(onClick).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: '删除旅行：江南' }))
    fireEvent.click(screen.getByRole('button', { name: '确认删除' }))
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('t1'))

    rerender(
      <TripCard
        trip={{ ...trip, cover_photo: null } as never}
        cityCount={0}
        onClick={onClick}
        onDelete={vi.fn().mockRejectedValue(new Error('失败'))}
      />,
    )
    expect(screen.getByText('江南', { selector: 'span' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '删除旅行：江南' }))
    fireEvent.click(screen.getByRole('button', { name: '确认删除' }))
    expect(await screen.findByText(/删除失败：失败/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
  })

  it('renders populated and empty city popups plus small presentational controls', () => {
    const city = {
      city_name: '上海',
      visit_count: 2,
      photo_count: 6,
      latest_photo: 'x',
      lat: 31,
      lng: 121,
      trips: ['旅一', '旅二', '旅三'],
    }
    const records = [
      photo,
      { ...photo, id: 'p2' },
      { ...photo, id: 'p3' },
      { ...photo, id: 'p4' },
      {
        ...photo,
        id: 'n1',
        entry_type: 'note',
        image_url: null,
        note: '最新文字',
        record_date: '2026-08-03',
      },
    ]
    const { rerender } = render(
      <CityPopup city={city as never} photos={records as never} x={10} y={20} />,
    )
    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.getByText('最新文字')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
    rerender(
      <CityPopup city={{ ...city, photo_count: 0, trips: [] } as never} photos={[]} x={0} y={0} />,
    )
    expect(screen.getByText('还没有照片')).toBeInTheDocument()

    const onChange = vi.fn()
    rerender(<NoteInput value="memo" onChange={onChange} rows={2} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new' } })
    expect(onChange).toHaveBeenCalledWith('new')
    rerender(<DayCounter />)
    expect(screen.getByText('CHAPTER · I')).toBeInTheDocument()
  })
})
