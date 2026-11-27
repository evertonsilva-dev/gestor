import { Card } from '@/components/Card'
import { formatShortDate } from '@/lib/dateFormat'
import { profileNames, sentimentNames } from '@/components/DashboardReport/reportLabels'
import { List, Row, Tags } from '@/components/DashboardReport/styles'
import type { ReportEntryCardsProps } from '@/components/DashboardReport/types'

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
                {comment.profile && <span>{profileNames[comment.profile]}</span>}
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
