import type { FormEventHandler } from 'react'
import { ClipboardList, PlusCircle } from 'lucide-react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { FormField } from '@/components/FormField'
import type { Channel, SourcePage } from '@/hooks/useAdminMonitoring/types'
import type { NewsPeriodItem } from '@/hooks/usePeriodItems/types'
import type { MonitoringPeriod } from '@/types/domain'
import { formatShortDate } from '@/lib/dateFormat'
import { Form, PeriodFormDisclosure, StatusPill } from '@/pages/MonitoringPage/styles'

interface PeriodEntryCardProps {
  period: MonitoringPeriod
  channels: Channel[]
  sourcePages: SourcePage[]
  newsItems: NewsPeriodItem[]
  itemType: string
  itemChannelId: string
  sourcePageId: string
  newsItemId: string
  busy: boolean
  onItemTypeChange: (value: string) => void
  onChannelChange: (value: string) => void
  onSourcePageChange: (value: string) => void
  onNewsItemChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function PeriodEntryCard({
  period,
  channels,
  sourcePages,
  newsItems,
  itemType,
  itemChannelId,
  sourcePageId,
  newsItemId,
  busy,
  onItemTypeChange,
  onChannelChange,
  onSourcePageChange,
  onNewsItemChange,
  onSubmit,
}: PeriodEntryCardProps) {
  const channelOptions = [
    { value: '', label: 'Selecione' },
    ...channels.map((channel) => ({ value: channel.id, label: channel.name })),
  ]
  const sourcePageOptions = [
    { value: '', label: 'Nenhuma página selecionada' },
    ...sourcePages
      .filter((sourcePage) => sourcePage.channelId === itemChannelId && sourcePage.active)
      .map((sourcePage) => ({ value: sourcePage.id, label: sourcePage.name })),
  ]

  return (
    <Card
      title="Registrar conteúdo"
      subtitle={`Adicione notícias, comentários ou recomendações ao período de ${formatShortDate(period.startDate)} a ${formatShortDate(period.endDate)}.`}
      action={<StatusPill $tone="pending">Em processamento</StatusPill>}
    >
      <PeriodFormDisclosure>
        <summary><PlusCircle size={15} /> Adicionar registro individual</summary>
        <Form onSubmit={onSubmit}>
          <FormField
            as="select"
            label="Tipo de registro"
            name="type"
            value={itemType}
            onChange={onItemTypeChange}
            options={[
              { value: 'news', label: 'Notícia' },
              { value: 'comment', label: 'Comentário analisado' },
              { value: 'recommendation', label: 'Recomendação estratégica' },
            ]}
          />
          {itemType === 'news' && (
            <>
              <FormField as="select" label="Canal" name="channelId" value={itemChannelId} onChange={onChannelChange} required options={channelOptions} />
              <FormField as="select" label="Página / fonte (opcional)" name="sourcePageId" value={sourcePageId} onChange={onSourcePageChange} options={sourcePageOptions} />
              <FormField label="Título" name="title" required maxLength={500} />
              <FormField label="Link da fonte (opcional)" name="sourceUrl" type="url" />
              <FormField
                as="select"
                label="Sentimento (opcional)"
                name="sentiment"
                options={[
                  { value: '', label: 'Classificar automaticamente' },
                  { value: 'neutral', label: 'Neutro' },
                  { value: 'positive', label: 'Favorável' },
                  { value: 'negative', label: 'Crítico' },
                ]}
              />
              <FormField as="textarea" label="Anotações (opcional)" name="notes" />
            </>
          )}
          {itemType === 'comment' && (
            <>
              <FormField
                as="select"
                label="Publicação da página"
                name="newsItemId"
                value={newsItemId}
                onChange={onNewsItemChange}
                required
                options={[
                  {
                    value: '',
                    label: newsItems.some((item) => item.sourcePageId)
                      ? 'Selecione uma publicação'
                      : 'Cadastre uma publicação vinculada a uma página',
                  },
                  ...newsItems
                    .filter((item) => item.sourcePageId)
                    .map((item) => ({
                      value: item.id,
                      label: `${item.sourcePageName ?? 'Página'} · ${item.title}`,
                    })),
                ]}
              />
              <FormField as="textarea" label="Comentário" name="content" required />
              <FormField
                as="select"
                label="Sentimento (opcional)"
                name="sentiment"
                options={[
                  { value: '', label: 'Classificar automaticamente' },
                  { value: 'neutral', label: 'Neutro' },
                  { value: 'positive', label: 'Favorável' },
                  { value: 'negative', label: 'Crítico' },
                ]}
              />
            </>
          )}
          {itemType === 'recommendation' && (
            <>
              <FormField
                as="select"
                label="Categoria"
                name="category"
                required
                options={[
                  { value: 'insight', label: 'Insight' },
                  { value: 'action', label: 'Ação' },
                  { value: 'example', label: 'Exemplo' },
                ]}
              />
              <FormField as="textarea" label="Conteúdo" name="content" required />
            </>
          )}
          <Button type="submit" disabled={busy}>
            <ClipboardList size={16} /> Salvar registro
          </Button>
        </Form>
      </PeriodFormDisclosure>
    </Card>
  )
}
