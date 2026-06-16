// src/__tests__/TimelineCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TimelineCard } from '../components/timeline/TimelineCard'
import type { Photo } from '../types'

const photoRecord: Photo = {
  id: '1',
  trip_id: 't1',
  city_name: '大理',
  image_url: 'https://example.com/photo.jpg',
  note: '洱海真美',
  author: '我',
  entry_type: 'photo',
  created_at: '2026-06-15T10:00:00Z',
}

const noteRecord: Photo = {
  id: '2',
  trip_id: 't1',
  city_name: '丽江',
  image_url: null,
  note: '今天在古城吃到了超好吃的烤乳扇，外酥里嫩，玫瑰酱很香。',
  author: '她',
  entry_type: 'note',
  created_at: '2026-06-14T14:00:00Z',
}

describe('TimelineCard', () => {
  it('渲染照片卡片', () => {
    const onClick = vi.fn()
    render(<TimelineCard record={photoRecord} index={0} onClick={onClick} />)

    expect(screen.getByText('「洱海真美」')).toBeTruthy()
    expect(screen.getByText('大理')).toBeTruthy()
    const img = document.querySelector('img')
    expect(img).toBeTruthy()
    expect(img!.getAttribute('src')).toBe('https://example.com/photo.jpg')
  })

  it('渲染文字卡片（无图）', () => {
    const onClick = vi.fn()
    render(<TimelineCard record={noteRecord} index={0} onClick={onClick} />)

    expect(screen.getByText(/烤乳扇/)).toBeTruthy()
    expect(screen.getByText('丽江')).toBeTruthy()
    // 不应该有 img
    const img = document.querySelector('img')
    expect(img).toBeNull()
  })

  it('点击触发 onClick', () => {
    const onClick = vi.fn()
    render(<TimelineCard record={photoRecord} index={0} onClick={onClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('显示作者标记', () => {
    const onClick = vi.fn()
    const { rerender } = render(
      <TimelineCard record={photoRecord} index={0} onClick={onClick} />
    )
    expect(screen.getByText('💙')).toBeTruthy()

    rerender(
      <TimelineCard record={noteRecord} index={0} onClick={onClick} />
    )
    expect(screen.getByText('💗')).toBeTruthy()
  })

  it('显示日期', () => {
    const onClick = vi.fn()
    render(<TimelineCard record={photoRecord} index={0} onClick={onClick} />)
    // 6月15日 weekdays vary by locale
    expect(screen.getByText(/6月/)).toBeTruthy()
  })
})
