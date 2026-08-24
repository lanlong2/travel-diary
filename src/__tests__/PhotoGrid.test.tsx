import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PhotoGrid } from '../components/trip/PhotoGrid'
import type { Photo } from '../types'

const photo: Photo = {
  id: 'photo-1',
  trip_id: 'trip-1',
  city_name: '杭州',
  image_url: 'https://example.com/photo.jpg',
  note: '西湖边的傍晚',
  author: '我',
  entry_type: 'photo',
  record_date: '2026-06-15',
  created_at: '2026-06-15T10:00:00Z',
}

describe('PhotoGrid', () => {
  it('shows a loading state before photos are available', () => {
    render(<PhotoGrid photos={[]} loading onPhotoClick={vi.fn()} />)

    expect(screen.getByLabelText('正在加载照片')).toBeInTheDocument()
    expect(screen.queryByText('还没有记录')).not.toBeInTheDocument()
  })

  it('renders the full photo and opens its record', () => {
    const onPhotoClick = vi.fn()
    render(<PhotoGrid photos={[photo]} onPhotoClick={onPhotoClick} />)

    expect(screen.getByRole('img', { name: photo.note })).toHaveAttribute('src', photo.image_url)
    fireEvent.click(screen.getByRole('button', { name: `查看记录：${photo.note}` }))
    expect(onPhotoClick).toHaveBeenCalledWith(photo)
  })

  it('offers a retry action when loading fails', () => {
    const onRetry = vi.fn()
    render(<PhotoGrid photos={[]} error="网络不可用" onRetry={onRetry} onPhotoClick={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /重新加载/ }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
