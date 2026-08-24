import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { TripSelect } from '../components/add/TripSelect'
import type { Trip, TripCity } from '../types'

const emptyTrips: (Trip & { cities: TripCity[] })[] = []

describe('TripSelect', () => {
  it('creates a trip from the mobile-friendly form', async () => {
    const onCreateTrip = vi.fn()
    render(
      <TripSelect
        trips={emptyTrips}
        selectedTripId={null}
        onSelectTrip={vi.fn()}
        onCreateTrip={onCreateTrip}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '新建旅行' }))
    fireEvent.change(screen.getByLabelText('旅行标题'), { target: { value: '夏日旅行' } })
    fireEvent.change(screen.getByLabelText('开始'), { target: { value: '2026-07-01' } })
    fireEvent.change(screen.getByLabelText('结束'), { target: { value: '2026-07-03' } })
    fireEvent.click(screen.getByRole('button', { name: '创建' }))

    await waitFor(() => {
      expect(onCreateTrip).toHaveBeenCalledWith('夏日旅行', '2026-07-01', '2026-07-03')
    })
  })

  it('shows an inline error instead of creating an invalid date range', () => {
    const onCreateTrip = vi.fn()
    render(
      <TripSelect
        trips={emptyTrips}
        selectedTripId={null}
        onSelectTrip={vi.fn()}
        onCreateTrip={onCreateTrip}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '新建旅行' }))
    fireEvent.change(screen.getByLabelText('旅行标题'), { target: { value: '日期校验' } })
    fireEvent.change(screen.getByLabelText('开始'), { target: { value: '2026-07-10' } })
    fireEvent.change(screen.getByLabelText('结束'), { target: { value: '2026-07-09' } })
    fireEvent.click(screen.getByRole('button', { name: '创建' }))

    expect(screen.getByRole('alert')).toHaveTextContent('结束日期不能早于开始日期')
    expect(onCreateTrip).not.toHaveBeenCalled()
  })

  it('locks the create action while an async request is pending', async () => {
    let resolveCreate: (() => void) | undefined
    const onCreateTrip = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCreate = resolve
        }),
    )
    render(
      <TripSelect
        trips={emptyTrips}
        selectedTripId={null}
        onSelectTrip={vi.fn()}
        onCreateTrip={onCreateTrip}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '新建旅行' }))
    fireEvent.change(screen.getByLabelText('旅行标题'), { target: { value: '防重复提交' } })
    const createButton = screen.getByRole('button', { name: '创建' })
    fireEvent.click(createButton)
    fireEvent.click(createButton)

    await waitFor(() => expect(onCreateTrip).toHaveBeenCalledTimes(1))
    expect(createButton).toBeDisabled()
    await act(async () => {
      resolveCreate?.()
      await Promise.resolve()
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '新建旅行' })).toBeInTheDocument()
    })
  })
})
