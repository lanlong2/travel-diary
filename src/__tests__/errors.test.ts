import { describe, expect, it } from 'vitest'
import { getErrorMessage } from '../lib/errors'

describe('getErrorMessage', () => {
  it('keeps native error messages', () => {
    expect(getErrorMessage(new Error('保存失败'))).toBe('保存失败')
  })

  it('extracts messages from Supabase-style plain error objects', () => {
    expect(getErrorMessage({ code: '42703', message: 'column does not exist' })).toBe('column does not exist')
  })

  it('uses a fallback when the error has no message', () => {
    expect(getErrorMessage({ code: 'UNKNOWN' }, '请稍后重试')).toBe('请稍后重试')
  })
})
