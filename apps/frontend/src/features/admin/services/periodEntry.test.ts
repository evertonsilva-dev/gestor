import { describe, expect, it } from 'vitest'
import { buildPeriodItem, parseKeywords } from './periodEntry'

describe('parseKeywords', () => {
  it('trims entries, removes blanks, and deduplicates keywords', () => {
    expect(parseKeywords(' cultura, saúde, cultura, , educação '))
      .toEqual(['cultura', 'saúde', 'educação'])
  })
})

describe('buildPeriodItem', () => {
  it('normalizes optional news fields and date values', () => {
    const formData = new FormData()
    formData.set('type', 'news')
    formData.set('channelId', 'channel-1')
    formData.set('title', 'Notícia local')
    formData.set('publishedAt', '2025-03-08T15:00')
    formData.set('sentiment', 'positive')

    expect(buildPeriodItem(formData)).toEqual({
      type: 'news',
      channelId: 'channel-1',
      title: 'Notícia local',
      sourceUrl: null,
      publishedAt: new Date('2025-03-08T15:00').toISOString(),
      sentiment: 'positive',
      notes: null,
    })
  })

  it('rejects invalid sentiment values', () => {
    const formData = new FormData()
    formData.set('type', 'comment')
    formData.set('channelId', 'channel-1')
    formData.set('content', 'Comentário')
    formData.set('commentedAt', '2025-03-08T15:00')
    formData.set('profile', 'simpatizante')
    formData.set('sentiment', 'unknown')

    expect(() => buildPeriodItem(formData)).toThrow()
  })
})
