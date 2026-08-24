import { describe, expect, it } from 'vitest'
import { EntityNotFoundError, requireRow } from './errors'
import { queryKeys } from './queryKeys'

describe('data core utilities', () => {
  it('returns existing rows and raises a named zero-row error', () => {
    const row = { id: '1' }
    expect(requireRow(row, '记录')).toBe(row)
    expect(() => requireRow(null, '记录')).toThrow(EntityNotFoundError)
    try {
      requireRow(null, '城市')
    } catch (error) {
      expect(error).toMatchObject({ name: 'EntityNotFoundError', message: '城市不存在或无权访问' })
    }
  })

  it('builds stable exact query keys', () => {
    expect(queryKeys.trips.all).toEqual(['trips'])
    expect(queryKeys.trips.list()).toEqual(['trips', 'list'])
    expect(queryKeys.trips.detail('t1')).toEqual(['trips', 'detail', 't1'])
    expect(queryKeys.records.all).toEqual(['records'])
    expect(queryKeys.records.list()).toEqual(['records', 'list', { tripId: null }])
    expect(queryKeys.records.list('t1')).toEqual(['records', 'list', { tripId: 't1' }])
  })
})
