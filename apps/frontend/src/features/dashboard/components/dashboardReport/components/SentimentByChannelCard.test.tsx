import { describe, expect, it } from 'vitest'
import type { ChartOptions } from 'chart.js'
import { SentimentByChannelCard } from './SentimentByChannelCard'

const period = {
  id: 'period-1',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  publishedAt: '2026-02-01',
}

function getChartOptions(channelCount: number): ChartOptions<'bar'> {
  const card = SentimentByChannelCard({
    period,
    channels: Array.from({ length: channelCount }, (_, index) => ({
      channelName: `Canal ${index + 1}`,
      positive: 1,
      neutral: 1,
      negative: 1,
    })),
  })

  return card.props.children.props.children.props.options
}

describe('SentimentByChannelCard', () => {
  it('keeps vertical bars for up to four channels', () => {
    expect(getChartOptions(4).indexAxis).toBe('x')
  })

  it('uses horizontal bars for more than four channels', () => {
    expect(getChartOptions(5).indexAxis).toBe('y')
  })
})
