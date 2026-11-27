import { Card } from '@/components/Card'
import { ExternalLink } from '@/components/AppLink'
import { formatShortDate } from '@/lib/dateFormat'
import { sentimentNames } from '@/components/DashboardReport/reportLabels'
import { List, Row, Tags } from '@/components/DashboardReport/styles'
import type { ReportEntryCardsProps } from '@/components/DashboardReport/types'

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
