import { Card } from '@/components/Card'
import { formatShortDate } from '@/lib/dateFormat'
import type { MonitoringPeriod } from '@/types/domain'
import type { UsePeriodItemsResult } from '@/hooks/usePeriodItems/types'
import type { SourcePage } from '@/hooks/useAdminMonitoring/types'
import { PeriodItemList } from '@/components/PeriodItemList'
import { StatusPill } from '@/pages/MonitoringPage/styles'

interface PeriodRecordsCardProps {
  period: MonitoringPeriod
  periodItems: UsePeriodItemsResult
  sourcePages: SourcePage[]
}

export function PeriodRecordsCard({ period, periodItems, sourcePages }: PeriodRecordsCardProps) {
  return (
    <Card
      title="Registros do período"
      subtitle={period.status === 'processing'
        ? `Revise, edite ou remova registros de ${formatShortDate(period.startDate)} a ${formatShortDate(period.endDate)} antes de publicar.`
        : 'Correções feitas aqui atualizam o relatório publicado.'}
      action={
        <StatusPill $tone={period.status === 'processing' ? 'pending' : 'active'}>
          {periodItems.items.length} {periodItems.items.length === 1 ? 'registro' : 'registros'}
        </StatusPill>
      }
    >
      <PeriodItemList
        items={periodItems.items}
        sourcePages={sourcePages}
        isLoading={periodItems.isLoading}
        error={periodItems.error}
        onUpdate={periodItems.updateItem}
        onDelete={periodItems.deleteItem}
        allowDelete={period.status === 'processing'}
      />
    </Card>
  )
}
