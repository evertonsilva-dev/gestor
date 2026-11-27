import type { MonitoringPeriod } from '@/types/domain'

export interface Channel {
  id: string
  name: string
  active: boolean
}

export interface SourcePage {
  id: string
  organizationId: string
  channelId: string
  name: string
  url: string | null
  active: boolean
}

export type PeriodItemInput =
  | {
      type: 'news'
      channelId: string
      sourcePageId?: string | null
      title: string
      sourceUrl: string | null
      sentiment?: 'positive' | 'neutral' | 'negative'
      notes: string | null
    }
  | {
      type: 'comment'
      content: string
      newsItemId: string
      sentiment?: 'positive' | 'neutral' | 'negative'
    }
  | {
      type: 'recommendation'
      category: 'insight' | 'action' | 'example'
      content: string
    }

export type BulkPeriodItemInput =
  | Omit<Extract<PeriodItemInput, { type: 'news' }>, 'type'>
  | Omit<Extract<PeriodItemInput, { type: 'comment' }>, 'type'>

export interface UseAdminMonitoringResult {
  channels: Channel[]
  sourcePages: SourcePage[]
  periods: MonitoringPeriod[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  createChannel: (name: string) => Promise<void>
  setChannelActive: (id: string, active: boolean) => Promise<void>
  createSourcePage: (input: { channelId: string; name: string; url: string | null }) => Promise<void>
  updateSourcePage: (id: string, changes: { name?: string; url?: string | null; active?: boolean }) => Promise<void>
  createPeriod: (startDate: string, endDate: string) => Promise<void>
  updatePeriod: (id: string, changes: { startDate?: string; endDate?: string }) => Promise<void>
  createItem: (periodId: string, item: PeriodItemInput) => Promise<void>
  bulkImportItems: (
    periodId: string,
    type: 'news' | 'comment',
    items: BulkPeriodItemInput[],
  ) => Promise<{ inserted: number; duplicates: number }>
  publishPeriod: (periodId: string) => Promise<void>
}
