import type { MonitoringPeriod } from '@/types/domain'

export interface Channel {
  id: string
  name: string
  active: boolean
}

export interface Topic {
  id: string
  name: string
  keywords: string[]
  active: boolean
}

export type PeriodItemInput =
  | {
      type: 'news'
      channelId: string
      title: string
      sourceUrl: string | null
      publishedAt: string
      sentiment: 'positive' | 'neutral' | 'negative'
      notes: string | null
    }
  | {
      type: 'comment'
      channelId: string
      content: string
      commentedAt: string
      profile: 'militante' | 'simpatizante' | 'detrator'
      sentiment: 'positive' | 'neutral' | 'negative'
    }
  | {
      type: 'recommendation'
      category: 'insight' | 'action' | 'example'
      content: string
    }

export interface UseAdminMonitoringResult {
  channels: Channel[]
  topics: Topic[]
  periods: MonitoringPeriod[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  createChannel: (name: string) => Promise<void>
  setChannelActive: (id: string, active: boolean) => Promise<void>
  createTopic: (name: string, keywords: string[]) => Promise<void>
  setTopicActive: (id: string, active: boolean) => Promise<void>
  createPeriod: (startDate: string, endDate: string) => Promise<void>
  createItem: (periodId: string, item: PeriodItemInput) => Promise<void>
  publishPeriod: (periodId: string) => Promise<void>
}
