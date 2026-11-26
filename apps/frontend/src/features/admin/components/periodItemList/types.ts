import type { PeriodItem, PeriodItemUpdate } from '@/hooks/usePeriodItems/types'
import type { SourcePage } from '@/hooks/useAdminMonitoring/types'

export interface PeriodItemListProps {
  items: PeriodItem[]
  sourcePages: SourcePage[]
  isLoading: boolean
  error: string | null
  onUpdate: (item: PeriodItem, changes: PeriodItemUpdate) => Promise<void>
  onDelete: (item: PeriodItem) => Promise<void>
  allowDelete: boolean
}
