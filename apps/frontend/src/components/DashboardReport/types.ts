import type { DashboardData } from '@/types/domain'

export type DashboardAudienceTone = 'blue' | 'gold' | 'red'

export interface DashboardReportProps {
  data: DashboardData
  selectedPeriodId: string
  onPeriodChange: (periodId: string) => void
}

export interface ReportEntryCardsProps {
  data: DashboardData
  period: NonNullable<DashboardData['selectedPeriod']>
}
