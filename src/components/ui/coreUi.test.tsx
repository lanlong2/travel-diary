import { Component, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Mail } from 'lucide-react'
import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'
import { ErrorBoundary } from './ErrorBoundary'
import { Input } from './Input'
import { Spinner } from './Spinner'
import { Toast } from './Toast'
import { BottomNav } from '../layout/BottomNav'
import { MonthDivider } from '../timeline/MonthDivider'

class Thrower extends Component<{ children?: ReactNode }> {
  render(): ReactNode {
    throw new Error('render exploded')
  }
}

describe('core UI components', () => {
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
  })

  it('renders every button variant and size with safe default type', () => {
    const { rerender } = render(<Button>保存</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    for (const variant of ['primary', 'secondary', 'ghost'] as const) {
      for (const size of ['sm', 'md', 'lg'] as const) {
        rerender(
          <Button variant={variant} size={size} className="custom">
            {variant}-{size}
          </Button>,
        )
        expect(screen.getByRole('button')).toHaveClass('custom')
      }
    }
  })

  it('connects input labels, icons, descriptions and errors', () => {
    const { rerender } = render(
      <Input label="邮箱" icon={Mail} error="必填" aria-describedby="help" />,
    )
    const input = screen.getByLabelText('邮箱')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.getAttribute('aria-describedby')).toContain('help')
    expect(screen.getByRole('alert')).toHaveTextContent('必填')
    rerender(<Input id="plain" aria-invalid="false" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'plain')
  })

  it('renders spinner labels and both toast types, then closes manually and automatically', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const { rerender } = render(<Spinner label="读取旅途" />)
    expect(screen.getByRole('status')).toHaveTextContent('读取旅途')

    rerender(<Toast message="成功" isVisible onClose={onClose} duration={10_000} />)
    expect(screen.getByRole('status')).toHaveTextContent('成功')
    fireEvent.click(screen.getByRole('button', { name: '关闭提示' }))
    act(() => vi.advanceTimersByTime(180))
    expect(onClose).toHaveBeenCalledOnce()

    rerender(<Toast message="失败" type="error" isVisible onClose={onClose} duration={100} />)
    expect(screen.getByRole('alert')).toHaveTextContent('失败')
    act(() => vi.advanceTimersByTime(280))
    expect(onClose).toHaveBeenCalledTimes(2)
    rerender(<Toast message="隐藏" isVisible={false} onClose={onClose} />)
    vi.useRealTimers()
  })

  it('operates confirm dialogs in normal and loading modes', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const { rerender } = render(
      <ConfirmDialog
        title="删除旅行"
        message="不可撤销"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '确认删除' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(onCancel).toHaveBeenCalledOnce()
    rerender(
      <ConfirmDialog
        title="删除"
        message="处理中"
        onConfirm={onConfirm}
        onCancel={onCancel}
        loading
      />,
    )
    expect(screen.getByRole('button', { name: '删除中' })).toBeDisabled()
  })

  it('catches render errors and offers a reset action', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { rerender } = render(
      <ErrorBoundary>
        <span>正常</span>
      </ErrorBoundary>,
    )
    expect(screen.getByText('正常')).toBeInTheDocument()
    rerender(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>,
    )
    expect(screen.getByText('出了点问题')).toBeInTheDocument()
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })

  it('renders month labels and navigates through desktop/mobile controls', () => {
    render(
      <MemoryRouter initialEntries={['/timeline']}>
        <BottomNav />
        <MonthDivider label="2026年8月" />
      </MemoryRouter>,
    )
    expect(screen.getByText('2026年8月')).toBeInTheDocument()
    expect(screen.getAllByText('时光')[0].closest('button')).toHaveAttribute('aria-current', 'page')
    fireEvent.click(screen.getByRole('button', { name: '回到足迹首页' }))
  })
})
