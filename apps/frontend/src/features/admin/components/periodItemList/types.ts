import type { PeriodItem, PeriodItemUpdate } from '@/hooks/usePeriodItems/types'

export interface PeriodItemListProps {
  items: PeriodItem[]
  isLoading: boolean
  error: string | null
  onUpdate: (item: PeriodItem, changes: PeriodItemUpdate) => Promise<void>
  onDelete: (item: PeriodItem) => Promise<void>
}
