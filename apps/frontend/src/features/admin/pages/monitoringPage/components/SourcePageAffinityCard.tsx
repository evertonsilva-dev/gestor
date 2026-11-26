import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { FormField } from '@/components/formField'
import { Notice } from '@/components/notice'
import type { MonitoringPeriod } from '@/types/domain'
import type { SourcePageAffinity, useSourcePageAffinity } from '../useSourcePageAffinity'
import {
  ReviewCard,
  ReviewCardHeader,
  ReviewControls,
  ReviewEvidence,
  ReviewGrid,
  ReviewStatus,
  SentimentLegend,
  SentimentSegment,
  SentimentTrack,
  StatusPill,
} from '../styles'

type AffinityState = ReturnType<typeof useSourcePageAffinity>

const affinityOptions = [
  { value: 'allied', label: 'Aliada' },
  { value: 'neutral', label: 'Neutra' },
  { value: 'critical', label: 'Crítica' },
]

const affinityLabels: Record<SourcePageAffinity, string> = {
  allied: 'Aliada',
  neutral: 'Neutra',
  critical: 'Crítica',
}

const affinityTone: Record<SourcePageAffinity, 'positive' | 'neutral' | 'negative'> = {
  allied: 'positive',
  neutral: 'neutral',
  critical: 'negative',
}

interface SourcePageAffinityCardProps {
  period: MonitoringPeriod
  state: AffinityState
}

export function SourcePageAffinityCard({ period, state }: SourcePageAffinityCardProps) {
  return (
    <Card
      title="Revisão de afinidade das páginas"
      subtitle={`Compare as publicações e confirme ou corrija a sugestão da IA para ${period.startDate} a ${period.endDate}. São necessárias pelo menos 3 notícias associadas.`}
    >
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.feedback && <Notice tone="success">{state.feedback}</Notice>}
      {state.isLoading ? <p>Calculando afinidades...</p> : state.reviews.length === 0 ? (
        <p>Nenhuma página cadastrada para este período.</p>
      ) : (
        <ReviewGrid>
          {state.reviews.map((review) => {
            const total = review.postCount
            const reviewedAffinity = review.reviewedAffinity
            const selectedAffinity = state.selectedAffinities[review.sourcePageId]
              ?? review.suggestedAffinity
              ?? 'neutral'

            return (
              <ReviewCard key={review.sourcePageId}>
                <ReviewCardHeader>
                  <ReviewEvidence>
                    <strong>{review.sourcePageName}</strong>
                    <small>Canal: {review.channelName}</small>
                    {review.sourcePageUrl && <small>{review.sourcePageUrl}</small>}
                  </ReviewEvidence>
                  {review.suggestedAffinity ? (
                    <StatusPill $tone={affinityTone[review.suggestedAffinity]}>
                      {review.reviewedAffinity ? 'Revisada' : 'Sugestão da IA'}
                    </StatusPill>
                  ) : <StatusPill $tone="pending">Aguardando dados</StatusPill>}
                </ReviewCardHeader>
                <ReviewEvidence>
                  <strong>{review.postCount} {review.postCount === 1 ? 'publicação analisada' : 'publicações analisadas'}</strong>
                  <SentimentLegend>
                    <StatusPill $tone="positive">Favoráveis · {review.positive}</StatusPill>
                    <StatusPill $tone="neutral">Neutras · {review.neutral}</StatusPill>
                    <StatusPill $tone="negative">Críticas · {review.negative}</StatusPill>
                  </SentimentLegend>
                  <SentimentTrack aria-label="Distribuição de sentimentos nas publicações">
                    <SentimentSegment $tone="positive" $width={total > 0 ? (review.positive / total) * 100 : 0} />
                    <SentimentSegment $tone="neutral" $width={total > 0 ? (review.neutral / total) * 100 : 0} />
                    <SentimentSegment $tone="negative" $width={total > 0 ? (review.negative / total) * 100 : 0} />
                  </SentimentTrack>
                </ReviewEvidence>
                <ReviewControls>
                  <ReviewStatus>
                    {review.suggestedAffinity ? (
                      <>
                        <span>Sugestão:</span>
                        <StatusPill $tone={affinityTone[review.suggestedAffinity]}>
                          {affinityLabels[review.suggestedAffinity]}
                        </StatusPill>
                        {reviewedAffinity && (
                          <>
                            <span>Decisão administrativa:</span>
                            <StatusPill $tone={affinityTone[reviewedAffinity]}>
                              {affinityLabels[reviewedAffinity]}
                            </StatusPill>
                          </>
                        )}
                      </>
                    ) : <span>A sugestão será calculada após 3 notícias associadas neste período.</span>}
                  </ReviewStatus>
                  <FormField
                    as="select"
                    label={`Afinidade de ${review.sourcePageName}`}
                    value={selectedAffinity}
                    onChange={(value) => state.selectAffinity(review.sourcePageId, value as SourcePageAffinity)}
                    options={affinityOptions}
                    disabled={!review.suggestedAffinity || state.busyPageId !== null}
                  />
                  <Button
                    size="small"
                    disabled={!review.suggestedAffinity || state.busyPageId !== null}
                    onClick={() => void state.review(review.sourcePageId)}
                  >
                    <CheckCircle2 size={14} />
                    {state.busyPageId === review.sourcePageId ? 'Salvando...' : 'Confirmar ou corrigir'}
                  </Button>
                </ReviewControls>
              </ReviewCard>
            )
          })}
        </ReviewGrid>
      )}
    </Card>
  )
}
