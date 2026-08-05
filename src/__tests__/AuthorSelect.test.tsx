import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AuthorSelect } from '../components/add/AuthorSelect'

describe('AuthorSelect', () => {
  it('exposes an accessible two-option control and changes the author', () => {
    const onChange = vi.fn()
    render(<AuthorSelect value="我" onChange={onChange} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true')
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(buttons[1])
    expect(onChange).toHaveBeenCalledWith('她')
  })
})
