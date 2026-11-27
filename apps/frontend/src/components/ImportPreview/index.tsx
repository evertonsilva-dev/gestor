import { ChevronLeft, ChevronRight, MessageCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/Button'
import { FormField } from '@/components/FormField'
import type { NewsImportRow, Sentiment } from '@/services/admin/bulkImport'
import { bulkImportPageSize, type CommentDraft } from '@/components/BulkPeriodImport/types'
import {
  ClassificationFields,
  CommentHeaderActions,
  CommentIcon,
  CommentIdentity,
  CommentPreviewCard,
  CommentPreviewHeader,
  CommentReviewControls,
  CommentSentiment,
  CommentText,
  ImportActions,
  ImportPreviewHeader,
  ImportStatus,
  Preview,
  PreviewRow,
} from '@/components/BulkPeriodImport/styles'

interface ImportPreviewProps {
  type: 'news' | 'comment'
  newsRows: NewsImportRow[]
  visibleComments: CommentDraft[]
  page: number
  pageCount: number
  draftsCount: number
  invalidNewsCount: number
  onCommentUpdate: (index: number, changes: Partial<CommentDraft>) => void
  onCommentRemove: (index: number) => void
  onNewsSentimentChange: (index: number, sentiment: Sentiment | '') => void
  onPageChange: (page: number) => void
}

const sentimentOptions = [
  { value: '', label: 'Classificar automaticamente' },
  { value: 'positive', label: 'Favorável' },
  { value: 'neutral', label: 'Neutro' },
  { value: 'negative', label: 'Crítico' },
]

const sentimentLabels: Record<Sentiment, string> = {
  positive: 'Favorável',
  neutral: 'Neutro',
  negative: 'Crítico',
}

export function ImportPreview({
  type,
  newsRows,
  visibleComments,
  page,
  pageCount,
  draftsCount,
  invalidNewsCount,
  onCommentUpdate,
  onCommentRemove,
  onNewsSentimentChange,
  onPageChange,
}: ImportPreviewProps) {
  return (
    <>
      <ImportPreviewHeader>
        <div>
          <strong>Revisão da importação</strong>
          <small aria-live="polite">
            {draftsCount} registro(s)
            {type === 'comment' ? ` · página ${page + 1} de ${pageCount}` : ''}
          </small>
        </div>
        <ImportStatus $tone={invalidNewsCount > 0 ? 'warning' : 'ready'}>
          {invalidNewsCount > 0 ? `${invalidNewsCount} linha(s) com erro` : 'Prévia gerada'}
        </ImportStatus>
      </ImportPreviewHeader>
      <Preview>
        {type === 'news' ? newsRows.map((row, index) => (
          <PreviewRow key={row.line}>
            <p>
              {row.title || `Linha ${row.line}`}
              <small data-error={Boolean(row.error)}>
                {row.error ?? `Linha ${row.line} · ${row.sentiment || 'Automático'}`}
              </small>
            </p>
            <ClassificationFields>
              <FormField
                as="select"
                label="Sentimento"
                name={`news-sentiment-${row.line}`}
                value={row.sentiment}
                onChange={(value) => onNewsSentimentChange(index, value as Sentiment | '')}
                options={sentimentOptions}
              />
            </ClassificationFields>
          </PreviewRow>
        )) : visibleComments.map((comment, visibleIndex) => {
          const index = page * bulkImportPageSize + visibleIndex
          return (
            <CommentPreviewCard key={`${index}-${comment.content}`}>
              <CommentPreviewHeader>
                <CommentIdentity>
                  <CommentIcon><MessageCircle size={17} aria-hidden="true" /></CommentIcon>
                  <div>
                    <strong>Comentário {index + 1}</strong>
                    <small>
                      {comment.sentiment
                        ? 'Sentimento selecionado manualmente'
                        : 'A IA classificará este comentário'}
                    </small>
                  </div>
                </CommentIdentity>
                <CommentHeaderActions>
                  <CommentSentiment $tone={comment.sentiment || 'automatic'}>
                    {comment.sentiment ? sentimentLabels[comment.sentiment] : 'Automático'}
                  </CommentSentiment>
                  <Button
                    type="button"
                    size="small"
                    variant="quiet"
                    aria-label={`Remover comentário ${index + 1}`}
                    onClick={() => onCommentRemove(index)}
                  >
                    <Trash2 size={15} /> Remover
                  </Button>
                </CommentHeaderActions>
              </CommentPreviewHeader>
              <CommentText>{comment.content}</CommentText>
              <CommentReviewControls>
                <FormField
                  as="select"
                  label="Sentimento"
                  value={comment.sentiment}
                  onChange={(value) => onCommentUpdate(index, { sentiment: value as Sentiment | '' })}
                  options={sentimentOptions}
                />
              </CommentReviewControls>
            </CommentPreviewCard>
          )
        })}
      </Preview>
      {type === 'comment' && pageCount > 1 && (
        <ImportActions>
          <Button type="button" size="small" variant="secondary" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft size={15} /> Anterior
          </Button>
          <Button type="button" size="small" variant="secondary" disabled={page >= pageCount - 1} onClick={() => onPageChange(page + 1)}>
            Próxima <ChevronRight size={15} />
          </Button>
        </ImportActions>
      )}
    </>
  )
}
