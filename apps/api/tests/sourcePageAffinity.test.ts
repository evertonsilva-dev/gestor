import { describe, expect, it } from 'vitest'
import { suggestSourcePageAffinity } from '../functions/_lib/sourcePageAffinity'

describe('suggestSourcePageAffinity', () => {
  it('requires at least three posts', () => {
    expect(suggestSourcePageAffinity(1, 1, 0)).toBeNull()
  })

  it('maps the strongest sentiment to page affinity', () => {
    expect(suggestSourcePageAffinity(2, 1, 0)).toBe('allied')
    expect(suggestSourcePageAffinity(0, 1, 2)).toBe('critical')
    expect(suggestSourcePageAffinity(1, 2, 0)).toBe('neutral')
  })

  it('returns neutral for a tie', () => {
    expect(suggestSourcePageAffinity(1, 1, 1)).toBe('neutral')
    expect(suggestSourcePageAffinity(2, 2, 0)).toBe('neutral')
  })
})
