import type { PeriodItemInput } from '@/hooks/useAdminMonitoring/types'

export type PeriodItemType = PeriodItemInput['type']
export type Sentiment = 'positive' | 'neutral' | 'negative'
export type AudienceProfile = 'militante' | 'simpatizante' | 'detrator'
export type RecommendationCategory = 'insight' | 'action' | 'example'

interface PeriodItemBase {
  id: string
  createdAt: string
}

export interface NewsPeriodItem extends PeriodItemBase {
  type: 'news'
  title: string
  sourceUrl: string | null
  publishedAt: string | null
  sentiment: Sentiment
  sentimentSource: 'ai' | 'manual'
  sentimentReason: string | null
  sentimentKeywords: string[]
  notes: string | null
  channelId: string
  channelName: string
  sourcePageId: string | null
  sourcePageName: string | null
}

export interface CommentPeriodItem extends PeriodItemBase {
  type: 'comment'
  content: string
  commentedAt: string | null
  newsItemId: string | null
  newsTitle: string | null
  profile: AudienceProfile | null
  sentiment: Sentiment
  sentimentSource: 'ai' | 'manual'
  sentimentReason: string | null
  sentimentKeywords: string[]
  channelId: string
  channelName: string
  sourcePageId: string | null
  sourcePageName: string | null
}

export interface RecommendationPeriodItem extends PeriodItemBase {
  type: 'recommendation'
  content: string
  category: RecommendationCategory
}

export type PeriodItem = NewsPeriodItem | CommentPeriodItem | RecommendationPeriodItem

export type PeriodItemUpdate =
  | Partial<Pick<NewsPeriodItem, 'title' | 'sourceUrl' | 'sourcePageId' | 'sentiment' | 'notes'>>
  | Partial<Pick<CommentPeriodItem, 'content' | 'newsItemId' | 'sentiment'>>
  | Partial<Pick<RecommendationPeriodItem, 'category' | 'content'>>

interface PeriodItemsResponse {
  news: NewsPeriodItem[]
  comments: CommentPeriodItem[]
  recommendations: RecommendationPeriodItem[]
}

export interface UsePeriodItemsResult {
  items: PeriodItem[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateItem: (item: PeriodItem, changes: PeriodItemUpdate) => Promise<void>
  deleteItem: (item: PeriodItem) => Promise<void>
}

export type { PeriodItemsResponse }
