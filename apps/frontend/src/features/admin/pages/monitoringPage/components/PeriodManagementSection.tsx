import type { FormEvent, FormEventHandler } from 'react'
import { CalendarDays, Pencil, PlusCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { DateRangeField } from '@/components/dateRangeField'
import { formatShortDate } from '@/lib/dateFormat'
import type { MonitoringPeriod } from '@/types/domain'
import {
  Form,
  PeriodActions,
  PeriodCard,
  PeriodCardHeader,
  PeriodDetails,
  PeriodEditor,
  PeriodFormDisclosure,
  PeriodIcon,
  PeriodIdentity,
  PeriodList,
  StatusPill,
  TwoColumns,
} from '../styles'

interface PeriodManagementSectionProps {
  periods: MonitoringPeriod[]
  selectedPeriodId: string
  periodDates: [Date | null, Date | null]
  editingPeriodId: string | null
  editingPeriodDates: [Date | null, Date | null]
  busy: boolean
  onPeriodDatesChange: (dates: [Date | null, Date | null]) => void
  onEditingDatesChange: (dates: [Date | null, Date | null]) => void
  onCreatePeriod: FormEventHandler<HTMLFormElement>
  onSubmitEdit: (event: FormEvent<HTMLFormElement>, periodId: string) => void
  onSelectPeriod: (periodId: string) => void
  onEditPeriod: (period: MonitoringPeriod) => void
  onPublishPeriod: (periodId: string) => void
}

export function PeriodManagementSection({
  periods,
  selectedPeriodId,
  periodDates,
  editingPeriodId,
  editingPeriodDates,
  busy,
  onPeriodDatesChange,
  onEditingDatesChange,
  onCreatePeriod,
  onSubmitEdit,
  onSelectPeriod,
  onEditPeriod,
  onPublishPeriod,
}: PeriodManagementSectionProps) {
  return (
    <TwoColumns>
      <Card
        title="Criar período"
        subtitle="Defina o intervalo que será analisado. O período ficará em processamento até a publicação."
      >
        <PeriodFormDisclosure>
          <summary><PlusCircle size={15} /> Escolher datas do novo período</summary>
          <Form onSubmit={onCreatePeriod}>
            <DateRangeField
              label="Período de monitoramento"
              value={periodDates}
              onChange={onPeriodDatesChange}
              startName="startDate"
              endName="endDate"
            />
            <Button type="submit" disabled={busy}>
              <PlusCircle size={16} /> Criar período
            </Button>
          </Form>
        </PeriodFormDisclosure>
      </Card>
      <Card
        title="Períodos de monitoramento"
        subtitle="Selecione um período para registrar conteúdo ou revisar o relatório publicado."
      >
        {periods.length === 0 ? <p>Nenhum período cadastrado.</p> : (
          <PeriodList>
            {periods.map((period) => {
              const isSelected = selectedPeriodId === period.id
              const isPublished = period.status === 'published'

              return (
                <PeriodCard key={period.id} $selected={isSelected}>
                  <PeriodCardHeader>
                    <PeriodIdentity>
                      <PeriodIcon><CalendarDays size={18} /></PeriodIcon>
                      <PeriodDetails>
                        <strong>{formatShortDate(period.startDate)} a {formatShortDate(period.endDate)}</strong>
                        <div>
                          <StatusPill $tone={isPublished ? 'active' : 'pending'}>
                            {isPublished ? 'Publicado' : 'Em processamento'}
                          </StatusPill>
                          {isSelected && <StatusPill $tone="neutral">Selecionado</StatusPill>}
                        </div>
                      </PeriodDetails>
                    </PeriodIdentity>
                    <PeriodActions>
                      <Button
                        size="small"
                        variant={isSelected ? 'primary' : 'secondary'}
                        onClick={() => onSelectPeriod(period.id)}
                      >
                        {isPublished ? 'Corrigir relatório' : 'Alimentar período'}
                      </Button>
                      <Button size="small" variant="quiet" onClick={() => onEditPeriod(period)}>
                        <Pencil size={14} /> Editar intervalo
                      </Button>
                      {!isPublished && (
                        <Button size="small" onClick={() => onPublishPeriod(period.id)} disabled={busy}>
                          <Send size={14} /> Publicar
                        </Button>
                      )}
                    </PeriodActions>
                  </PeriodCardHeader>
                  {editingPeriodId === period.id && (
                    <PeriodEditor>
                      <Form onSubmit={(event) => onSubmitEdit(event, period.id)}>
                        <DateRangeField
                          label="Intervalo da análise"
                          value={editingPeriodDates}
                          onChange={onEditingDatesChange}
                          startName="startDate"
                          endName="endDate"
                        />
                        <PeriodActions>
                          <Button type="submit" size="small" disabled={busy}>Salvar intervalo</Button>
                          <Button type="button" size="small" variant="quiet" onClick={() => onEditPeriod(period)}>
                            <X size={14} /> Cancelar
                          </Button>
                        </PeriodActions>
                      </Form>
                    </PeriodEditor>
                  )}
                </PeriodCard>
              )
            })}
          </PeriodList>
        )}
      </Card>
    </TwoColumns>
  )
}
