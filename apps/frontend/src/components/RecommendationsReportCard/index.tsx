import { Card } from '@/components/Card'
import { categoryNames } from '@/components/DashboardReport/reportLabels'
import { List, Row } from '@/components/DashboardReport/styles'
import type { ReportEntryCardsProps } from '@/components/DashboardReport/types'

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
