import type { DashboardData } from '@/types/domain'

export interface UseDashboardResult {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}
