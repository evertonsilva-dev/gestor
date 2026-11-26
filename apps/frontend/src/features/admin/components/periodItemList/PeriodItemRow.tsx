import type { FormEventHandler } from 'react'
import { Lightbulb, MessageCircle, Newspaper, Pencil, Save, Sparkles, Trash2, X } from 'lucide-react'
import { Button } from '@/components/button'
import { FormField } from '@/components/formField'
import type { PeriodItem } from '@/hooks/usePeriodItems/types'
import type { SourcePage } from '@/hooks/useAdminMonitoring/types'
import {
  Actions,
  AnalysisDetails,
  EditForm,
  RecordContent,
  RecordIdentity,
  RecordIcon,
  RecordLabels,
  RecordSentimentPill,
  RecordSourcePill,
  RecordTypePill,
  Row,
  RowHeader,
} from './styles'

const itemLabels = {
  news: 'Notícia',
  comment: 'Comentário',
  recommendation: 'Recomendação',
} as const

const recommendationCategoryLabels = {
  insight: 'Insight',
  action: 'Ação',
  example: 'Exemplo',
} as const

function itemContent(item: PeriodItem): string {
  return item.type === 'news' ? item.title : item.content
}

function itemDescription(item: PeriodItem): string {
  if (item.type === 'recommendation') return itemLabels[item.type]
  if (item.type === 'comment' && item.newsTitle) {
    return `${itemLabels[item.type]} · ${item.channelName}${item.sourcePageName ? ` · ${item.sourcePageName}` : ''} · ${item.newsTitle}`
  }
  return `${itemLabels[item.type]} · ${item.channelName}${item.sourcePageName ? ` · ${item.sourcePageName}` : ''}`
}

interface PeriodItemRowProps {
  item: PeriodItem
  items: PeriodItem[]
  sourcePages: SourcePage[]
  isEditing: boolean
  busy: boolean
  allowDelete: boolean
  onToggleEditing: () => void
  onSubmitEdit: FormEventHandler<HTMLFormElement>
  onDelete: () => void
}

export function PeriodItemRow({
  item,
  items,
  sourcePages,
  isEditing,
  busy,
  allowDelete,
  onToggleEditing,
  onSubmitEdit,
  onDelete,
}: PeriodItemRowProps) {
  return (
    <Row>
      <RowHeader>
        <RecordIdentity>
          <RecordIcon $type={item.type}>
            {item.type === 'news'
              ? <Newspaper size={18} />
              : item.type === 'comment'
                ? <MessageCircle size={18} />
                : <Lightbulb size={18} />}
          </RecordIcon>
          <div>
            <RecordLabels>
              <RecordTypePill>{itemLabels[item.type]}</RecordTypePill>
              {item.type === 'recommendation' ? (
                <RecordSourcePill>{recommendationCategoryLabels[item.category]}</RecordSourcePill>
              ) : (
                <>
                  <RecordSentimentPill $tone={item.sentiment}>
                    {item.sentiment === 'positive' ? 'Favorável' : item.sentiment === 'negative' ? 'Crítico' : 'Neutro'}
                  </RecordSentimentPill>
                  <RecordSourcePill>
                    {item.sentimentSource === 'ai' ? 'Análise da IA' : 'Classificação manual'}
                  </RecordSourcePill>
                </>
              )}
            </RecordLabels>
            <RecordContent>
              {itemContent(item)}
              <small>{itemDescription(item)}</small>
            </RecordContent>
          </div>
        </RecordIdentity>
        <Actions>
          <Button size="small" variant="secondary" disabled={busy} onClick={onToggleEditing}>
            {isEditing ? <X size={14} /> : <Pencil size={14} />}
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
          {allowDelete && (
            <Button size="small" variant="quiet" disabled={busy} onClick={onDelete}>
              <Trash2 size={14} /> Remover
            </Button>
          )}
        </Actions>
      </RowHeader>
      {(item.type === 'news' || item.type === 'comment') && item.sentimentSource === 'ai' && item.sentimentReason && (
        <AnalysisDetails>
          <strong><Sparkles size={14} /> Análise contextual da IA</strong>
          <p>{item.sentimentReason}</p>
          {item.sentimentKeywords.length > 0 && (
            <small>Palavras-chave: {item.sentimentKeywords.join(', ')}</small>
          )}
        </AnalysisDetails>
      )}
      {isEditing && (
        <EditForm onSubmit={onSubmitEdit}>
          {item.type === 'news' ? (
            <>
              <FormField label="Título" name="title" defaultValue={item.title} required maxLength={500} />
              <FormField label="Link da fonte" name="sourceUrl" type="url" defaultValue={item.sourceUrl ?? ''} />
              <FormField
                as="select"
                label="Página / fonte"
                name="sourcePageId"
                defaultValue={item.sourcePageId ?? ''}
                options={[
                  { value: '', label: 'Nenhuma página selecionada' },
                  ...sourcePages
                    .filter((page) => page.channelId === item.channelId && (page.active || page.id === item.sourcePageId))
                    .map((page) => ({ value: page.id, label: page.name })),
                ]}
              />
              <FormField
                as="select"
                label="Sentimento"
                name="sentiment"
                defaultValue={item.sentiment}
                options={[
                  { value: 'positive', label: 'Favorável' },
                  { value: 'neutral', label: 'Neutro' },
                  { value: 'negative', label: 'Crítico' },
                ]}
              />
              <FormField as="textarea" label="Anotações" name="notes" defaultValue={item.notes ?? ''} maxLength={4000} />
            </>
          ) : item.type === 'comment' ? (
            <>
              <FormField as="textarea" label="Comentário" name="content" defaultValue={item.content} required maxLength={4000} />
              <FormField
                as="select"
                label="Página / fonte"
                name="sourcePageId"
                defaultValue={item.sourcePageId ?? ''}
                options={[
                  { value: '', label: 'Nenhuma página selecionada' },
                  ...sourcePages
                    .filter((page) => page.channelId === item.channelId && (page.active || page.id === item.sourcePageId))
                    .map((page) => ({ value: page.id, label: page.name })),
                ]}
              />
              <FormField
                as="select"
                label="Notícia relacionada (opcional)"
                name="newsItemId"
                defaultValue={item.newsItemId ?? ''}
                options={[
                  { value: '', label: 'Nenhuma notícia selecionada' },
                  ...items.flatMap((candidate) => (
                    candidate.type === 'news' && candidate.channelId === item.channelId
                      ? [{ value: candidate.id, label: candidate.title }]
                      : []
                  )),
                ]}
              />
              <FormField
                as="select"
                label="Perfil"
                name="profile"
                defaultValue={item.profile}
                options={[
                  { value: 'militante', label: 'Apoiador' },
                  { value: 'simpatizante', label: 'Simpatizante' },
                  { value: 'detrator', label: 'Opositor' },
                ]}
              />
              <FormField
                as="select"
                label="Sentimento"
                name="sentiment"
                defaultValue={item.sentiment}
                options={[
                  { value: 'positive', label: 'Favorável' },
                  { value: 'neutral', label: 'Neutro' },
                  { value: 'negative', label: 'Crítico' },
                ]}
              />
            </>
          ) : (
            <FormField as="textarea" label="Recomendação" name="content" defaultValue={item.content} required maxLength={4000} />
          )}
          <Actions>
            <Button type="submit" size="small" disabled={busy}><Save size={14} /> Salvar alterações</Button>
          </Actions>
        </EditForm>
      )}
    </Row>
  )
}
