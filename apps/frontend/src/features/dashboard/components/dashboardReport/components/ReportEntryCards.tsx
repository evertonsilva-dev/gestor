import { Card } from '@/components/card'
import { ExternalLink } from '@/components/appLink'
import { formatShortDate } from '@/lib/dateFormat'
import type { DashboardData } from '@/types/domain'
import { List, Row, Tags } from '../styles'

const profileNames = {
  militante: 'Apoiadores',
  simpatizante: 'Simpatizantes',
  detrator: 'Opositores',
} as const

const sentimentNames = {
  positive: 'Favorável',
  neutral: 'Neutro',
  negative: 'Crítico',
} as const

const categoryNames = {
  insight: 'Insight',
  action: 'Ação',
  example: 'Exemplo',
} as const

interface ReportEntryCardsProps {
  data: DashboardData
  period: NonNullable<DashboardData['selectedPeriod']>
}

export function NewsReportCard({ data, period }: ReportEntryCardsProps) {
  return (
    <Card title="Notícias monitoradas" subtitle={`${data.news.length} registros entre ${formatShortDate(period.startDate)} e ${formatShortDate(period.endDate)}`}>
      {data.news.length === 0 ? <p>Nenhuma notícia registrada neste período.</p> : (
        <List>
          {data.news.map((news) => (
            <Row key={news.id}>
              <strong>{news.title}</strong>
              <Tags>
                <span>{news.channelName}</span>
                <span>{sentimentNames[news.sentiment]}</span>
                {news.sourceUrl && <span><ExternalLink href={news.sourceUrl} target="_blank" rel="noreferrer">Fonte</ExternalLink></span>}
              </Tags>
            </Row>
          ))}
        </List>
      )}
    </Card>
  )
}

export function CommentsReportCard({ data, period }: ReportEntryCardsProps) {
  return (
    <Card title="Comentários analisados" subtitle={`Comentários coletados entre ${formatShortDate(period.startDate)} e ${formatShortDate(period.endDate)}`}>
      {data.comments.length === 0 ? <p>Nenhum comentário registrado neste período.</p> : (
        <List>
          {data.comments.map((comment) => (
            <Row key={comment.id}>
              <strong>{comment.content}</strong>
              <Tags>
                <span>{comment.channelName}</span>
                <span>{profileNames[comment.profile]}</span>
                <span>{sentimentNames[comment.sentiment]}</span>
                {comment.newsTitle && <span>Notícia: {comment.newsTitle}</span>}
              </Tags>
            </Row>
          ))}
        </List>
      )}
    </Card>
  )
}

export function RecommendationsReportCard({ data }: Pick<ReportEntryCardsProps, 'data'>) {
  return (
    <Card title="Inteligência estratégica" subtitle="Recomendações relacionadas ao período">
      {data.recommendations.length === 0 ? <p>Nenhuma recomendação cadastrada neste período.</p> : (
        <List>
          {data.recommendations.map((recommendation) => (
            <Row key={recommendation.id}>
              <strong>{categoryNames[recommendation.category]}</strong>
              <p>{recommendation.content}</p>
            </Row>
          ))}
        </List>
      )}
    </Card>
  )
}
