import { describe, expect, it } from 'vitest'
import {
  buildNewsSentimentTimeline,
  rankChannelSentiment,
  summarizeNewsSentiment,
} from '@/services/dashboard/reportAnalytics'

const period = {
  id: 'period-1',
  startDate: '2026-03-01',
  endDate: '2026-03-03',
  publishedAt: '2026-03-04T12:00:00.000Z',
}

describe('report analytics', () => {
  it('sums news sentiment from channel totals', () => {
    expect(summarizeNewsSentiment([
      { channelName: 'Canal A', positive: 3, neutral: 2, negative: 1 },
      { channelName: 'Canal B', positive: 1, neutral: 0, negative: 4 },
    ])).toEqual({ positive: 4, neutral: 2, negative: 5 })
  })

  it('builds a complete daily sentiment timeline and ignores undated or out-of-period news', () => {
    expect(buildNewsSentimentTimeline([
      { id: 'news-1', title: 'Uma', sourceUrl: null, channelName: 'Canal A', sentiment: 'positive', publishedAt: '2026-03-01T10:00:00.000Z' },
      { id: 'news-2', title: 'Duas', sourceUrl: null, channelName: 'Canal A', sentiment: 'negative', publishedAt: '2026-03-03' },
      { id: 'news-3', title: 'Sem data', sourceUrl: null, channelName: 'Canal A', sentiment: 'neutral', publishedAt: null },
      { id: 'news-4', title: 'Fora do período', sourceUrl: null, channelName: 'Canal A', sentiment: 'neutral', publishedAt: '2026-03-04' },
    ], period)).toEqual([
      { date: '2026-03-01', label: '01/03', positive: 1, neutral: 0, negative: 0 },
      { date: '2026-03-02', label: '02/03', positive: 0, neutral: 0, negative: 0 },
      { date: '2026-03-03', label: '03/03', positive: 0, neutral: 0, negative: 1 },
    ])
  })

  it('ranks channels by normalized net sentiment and excludes channels without news', () => {
    expect(rankChannelSentiment([
      { channelName: 'Equilibrado', positive: 2, neutral: 2, negative: 2 },
      { channelName: 'Favorável', positive: 8, neutral: 1, negative: 1 },
      { channelName: 'Sem notícias', positive: 0, neutral: 0, negative: 0 },
      { channelName: 'Crítico', positive: 1, neutral: 1, negative: 8 },
    ])).toEqual([
      { channelName: 'Favorável', total: 10, score: 70 },
      { channelName: 'Equilibrado', total: 6, score: 0 },
      { channelName: 'Crítico', total: 10, score: -70 },
    ])
  })
})
