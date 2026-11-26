import { describe, expect, it } from 'vitest'
import { buildPeriodItem, parseKeywords } from './periodEntry'

describe('parseKeywords', () => {
  it('trims entries, removes blanks, and deduplicates keywords', () => {
    expect(parseKeywords(' cultura, saúde, cultura, , educação '))
      .toEqual(['cultura', 'saúde', 'educação'])
  })
})

describe('buildPeriodItem', () => {
  it('normalizes optional news fields without requiring a per-item date', () => {
    const formData = new FormData()
    formData.set('type', 'news')
    formData.set('channelId', 'channel-1')
    formData.set('title', 'Notícia local')
    formData.set('sentiment', 'positive')

    expect(buildPeriodItem(formData)).toEqual({
      type: 'news',
      channelId: 'channel-1',
      sourcePageId: null,
      title: 'Notícia local',
      sourceUrl: null,
      sentiment: 'positive',
      notes: null,
    })
  })

  it('rejects invalid sentiment values', () => {
    const formData = new FormData()
    formData.set('type', 'comment')
    formData.set('channelId', 'channel-1')
    formData.set('content', 'Comentário')
    formData.set('profile', 'simpatizante')
    formData.set('sentiment', 'unknown')

    expect(() => buildPeriodItem(formData)).toThrow()
  })

  it('allows automatic sentiment classification for new news and comments', () => {
    const newsData = new FormData()
    newsData.set('type', 'news')
    newsData.set('channelId', 'channel-1')
    newsData.set('title', 'Notícia local')

    const commentData = new FormData()
    commentData.set('type', 'comment')
    commentData.set('channelId', 'channel-1')
    commentData.set('content', 'Comentário')
    commentData.set('profile', 'simpatizante')

    expect(buildPeriodItem(newsData)).not.toHaveProperty('sentiment')
    expect(buildPeriodItem(commentData)).not.toHaveProperty('sentiment')
  })

  it('creates a comment without per-item dates and accepts an optional related news item', () => {
    const formData = new FormData()
    formData.set('type', 'comment')
    formData.set('channelId', 'channel-1')
    formData.set('content', 'Comentário')
    formData.set('newsItemId', 'news-1')
    formData.set('profile', 'simpatizante')
    formData.set('sentiment', 'positive')

    expect(buildPeriodItem(formData)).toEqual({
      type: 'comment',
      channelId: 'channel-1',
      sourcePageId: null,
      content: 'Comentário',
      newsItemId: 'news-1',
      profile: 'simpatizante',
      sentiment: 'positive',
    })
  })
})
