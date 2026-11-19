export type AppRole = 'admin' | 'client'

export interface UserProfile {
  id: string
  name: string | null
  email: string
  role: AppRole
  organizationId: string | null
  organizationName: string | null
}

export interface Organization {
  id: string
  name: string
  slug: string
  active: boolean
  createdAt: string
}

export type PeriodStatus = 'processing' | 'published'

export interface MonitoringPeriod {
  id: string
  organizationId: string
  startDate: string
  endDate: string
  status: PeriodStatus
  createdAt: string
  publishedAt: string | null
}

export interface DashboardData {
  organization: { id: string; name: string }
  selectedPeriod: {
    id: string
    startDate: string
    endDate: string
    publishedAt: string
  } | null
  updateInProgress: boolean
  lastPublishedAt: string | null
  metrics: {
    newsCount: number
    commentCount: number
  }
  sentimentByChannel: Array<{
    channelName: string
    positive: number
    neutral: number
    negative: number
  }>
  audience: Array<{
    profile: 'militante' | 'simpatizante' | 'detrator'
    count: number
    percentage: number
  }>
  news: Array<{
    id: string
    title: string
    sourceUrl: string | null
    channelName: string
    sentiment: 'positive' | 'neutral' | 'negative'
    publishedAt: string
  }>
  comments: Array<{
    id: string
    content: string
    channelName: string
    profile: 'militante' | 'simpatizante' | 'detrator'
    sentiment: 'positive' | 'neutral' | 'negative'
    commentedAt: string
  }>
  recommendations: Array<{
    id: string
    category: 'insight' | 'action' | 'example'
    content: string
  }>
  availablePeriods: Array<{
    id: string
    startDate: string
    endDate: string
    publishedAt: string
  }>
}
