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
  publishedAt: string
  sentiment: Sentiment
  notes: string | null
  channelId: string
  channelName: string
}

export interface CommentPeriodItem extends PeriodItemBase {
  type: 'comment'
  content: string
  commentedAt: string
  profile: AudienceProfile
  sentiment: Sentiment
  channelId: string
  channelName: string
}

export interface RecommendationPeriodItem extends PeriodItemBase {
  type: 'recommendation'
  content: string
  category: RecommendationCategory
}

export type PeriodItem = NewsPeriodItem | CommentPeriodItem | RecommendationPeriodItem

export type PeriodItemUpdate =
  | Partial<Pick<NewsPeriodItem, 'title' | 'sourceUrl' | 'publishedAt' | 'sentiment' | 'notes'>>
  | Partial<Pick<CommentPeriodItem, 'content' | 'commentedAt' | 'profile' | 'sentiment'>>
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
