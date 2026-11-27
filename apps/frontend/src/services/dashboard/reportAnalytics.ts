import type { DashboardData } from '@/types/domain'

export interface NewsSentimentCounts {
  positive: number
  neutral: number
  negative: number
}

export interface NewsSentimentDay extends NewsSentimentCounts {
  date: string
  label: string
}

export interface ChannelSentimentBalance {
  channelName: string
  total: number
  score: number
}

function createSentimentCounts(): NewsSentimentCounts {
  return { positive: 0, neutral: 0, negative: 0 }
}

function getUtcDateKey(value: string): string | null {
  const dateKey = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null

  const timestamp = Date.parse(`${dateKey}T00:00:00.000Z`)
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== dateKey) {
    return null
  }

  return dateKey
}

export function summarizeNewsSentiment(
  channels: DashboardData['sentimentByChannel'],
): NewsSentimentCounts {
  return channels.reduce((totals, channel) => ({
    positive: totals.positive + channel.positive,
    neutral: totals.neutral + channel.neutral,
    negative: totals.negative + channel.negative,
  }), createSentimentCounts())
}

export function buildNewsSentimentTimeline(
  news: DashboardData['news'],
  period: DashboardData['selectedPeriod'],
): NewsSentimentDay[] {
  if (!period) return []

  const startDate = getUtcDateKey(period.startDate)
  const endDate = getUtcDateKey(period.endDate)
  if (!startDate || !endDate) return []

  const start = Date.parse(`${startDate}T00:00:00.000Z`)
  const end = Date.parse(`${endDate}T00:00:00.000Z`)
  if (start > end) return []

  const dailyCounts = new Map<string, NewsSentimentDay>()
  for (let timestamp = start; timestamp <= end; timestamp += 86_400_000) {
    const date = new Date(timestamp).toISOString().slice(0, 10)
    dailyCounts.set(date, {
      date,
      label: `${date.slice(8, 10)}/${date.slice(5, 7)}`,
      ...createSentimentCounts(),
    })
  }

  for (const item of news) {
    if (!item.publishedAt) continue
    const date = getUtcDateKey(item.publishedAt)
    const counts = date ? dailyCounts.get(date) : undefined
    if (counts) counts[item.sentiment] += 1
  }

  return Array.from(dailyCounts.values())
}

export function rankChannelSentiment(
  channels: DashboardData['sentimentByChannel'],
): ChannelSentimentBalance[] {
  return channels
    .map((channel) => {
      const total = channel.positive + channel.neutral + channel.negative
      return {
        channelName: channel.channelName,
        total,
        score: total === 0
          ? 0
          : Math.round(((channel.positive - channel.negative) / total) * 100),
      }
    })
    .filter((channel) => channel.total > 0)
    .sort((left, right) => right.score - left.score || left.channelName.localeCompare(right.channelName))
}

