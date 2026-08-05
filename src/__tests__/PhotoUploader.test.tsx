import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PhotoUploader } from '../components/add/PhotoUploader'

describe('PhotoUploader', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('supports camera capture, preview, and cancel-safe replacement on touch devices', () => {
    const createObjectURL = vi.fn(() => 'blob:preview')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    const onFileSelect = vi.fn()
    const file = new File(['image'], 'trip.jpg', { type: 'image/jpeg' })

    render(<PhotoUploader onFileSelect={onFileSelect} />)

    const input = screen.getByLabelText('选择照片') as HTMLInputElement
    expect(input).toHaveAttribute('accept', 'image/*')
    expect(input).toHaveAttribute('capture', 'environment')

    fireEvent.change(input, { target: { files: [file] } })
    expect(onFileSelect).toHaveBeenLastCalledWith(file)
    expect(screen.getByRole('img', { name: '预览' })).toHaveAttribute('src', 'blob:preview')

    fireEvent.click(screen.getByRole('button', { name: '换一张' }))
    expect(onFileSelect).toHaveBeenLastCalledWith(file)
    expect(screen.getByRole('img', { name: '预览' })).toBeInTheDocument()

    const replacement = new File(['replacement'], 'replacement.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [replacement] } })
    expect(onFileSelect).toHaveBeenLastCalledWith(replacement)
  })

  it('ignores non-image files before upload', () => {
    const onFileSelect = vi.fn()
    const file = new File(['text'], 'notes.txt', { type: 'text/plain' })

    render(<PhotoUploader onFileSelect={onFileSelect} />)
    fireEvent.change(screen.getByLabelText('选择照片'), { target: { files: [file] } })

    expect(onFileSelect).not.toHaveBeenCalled()
    expect(screen.queryByRole('img', { name: '预览' })).not.toBeInTheDocument()
  })
})
