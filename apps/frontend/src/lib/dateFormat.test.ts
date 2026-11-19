import { describe, expect, it } from 'vitest'
import { formatDate, formatShortDate } from './dateFormat'

describe('formatDate', () => {
  it('formats valid dates using the Brazilian locale', () => {
    expect(formatDate('2025-03-08')).toBe('08 de março de 2025')
  })

  it('returns a placeholder when no date is available', () => {
    expect(formatDate(null)).toBe('Ainda não publicado')
  })

  it('handles invalid dates consistently', () => {
    expect(formatDate('not-a-date')).toBe('Data indisponível')
    expect(formatShortDate('not-a-date')).toBe('Data indisponível')
  })
})
