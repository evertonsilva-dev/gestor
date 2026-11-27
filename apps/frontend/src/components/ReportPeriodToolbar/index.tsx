import { FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/Button'
import { FormField } from '@/components/FormField'
import { formatDate, formatShortDate } from '@/lib/dateFormat'
import type { DashboardData } from '@/types/domain'
import { Actions, PeriodBar } from '@/components/DashboardReport/styles'

interface ReportPeriodToolbarProps {
  data: DashboardData
  selectedPeriodId: string
  onPeriodChange: (periodId: string) => void
  onExport: (kind: 'pdf' | 'excel') => void
}

export function ReportPeriodToolbar({
  data,
  selectedPeriodId,
  onPeriodChange,
  onExport,
}: ReportPeriodToolbarProps) {
  return (
    <PeriodBar>
      <FormField
        as="select"
        label="Período de referência"
        value={selectedPeriodId}
        onChange={onPeriodChange}
        isSearchable={false}
        disabled={data.availablePeriods.length === 0}
        options={data.availablePeriods.length === 0
          ? [{ value: '', label: 'Nenhum relatório publicado' }]
          : data.availablePeriods.map((period) => ({
            value: period.id,
            label: `${formatShortDate(period.startDate)} a ${formatShortDate(period.endDate)}`,
          }))}
      />
      <p>Última publicação: <strong>{formatDate(data.lastPublishedAt)}</strong></p>
      <Actions>
        <Button size="small" variant="secondary" disabled={!data.selectedPeriod} onClick={() => onExport('pdf')}>
          <FileText size={15} /> PDF
        </Button>
        <Button size="small" variant="secondary" disabled={!data.selectedPeriod} onClick={() => onExport('excel')}>
          <FileSpreadsheet size={15} /> Excel
        </Button>
      </Actions>
    </PeriodBar>
  )
}
