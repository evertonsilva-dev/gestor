import { Card } from '@/components/card'
import { MetricCard } from '@/components/metricCard'
import { Notice } from '@/components/notice'
import type { DashboardReportProps } from './types'
import {
  CommentsReportCard,
  NewsReportCard,
  RecommendationsReportCard,
} from './components/ReportEntryCards'
import { ReportPeriodToolbar } from './components/ReportPeriodToolbar'
import { AudienceBreakdownCard as AudienceSummaryCard } from './components/AudienceBreakdownCard'
import { SentimentByChannelCard as SentimentChartCard } from './components/SentimentByChannelCard'
import { Metrics, Stack, TwoColumns } from './styles'
import { useDashboardReport } from './useDashboardReport'

export function DashboardReport({ data, selectedPeriodId, onPeriodChange }: DashboardReportProps) {
  const { exportError, exportFile } = useDashboardReport(data)
  const selectedPeriod = data.selectedPeriod

  return (
    <Stack>
      {data.updateInProgress && (
        <Notice>
          Atualização em andamento! Enquanto isso, você pode consultar os resultados do último período finalizado.
        </Notice>
      )}
      <ReportPeriodToolbar
        data={data}
        selectedPeriodId={selectedPeriodId}
        onPeriodChange={onPeriodChange}
        onExport={(kind) => void exportFile(kind)}
      />
      {exportError && <Notice tone="error">{exportError}</Notice>}
      {!selectedPeriod ? (
        <Card title="Nenhum relatório disponível" subtitle="Os resultados aparecerão aqui após a primeira publicação.">
          <p>Os dados anteriores serão preservados enquanto um novo período estiver sendo preparado.</p>
        </Card>
      ) : (
        <>
          <Metrics>
            <MetricCard label="Notícias monitoradas" value={data.metrics.newsCount} accent="blue" />
            <MetricCard label="Comentários analisados" value={data.metrics.commentCount} accent="gold" />
          </Metrics>
          <TwoColumns>
            <SentimentChartCard period={selectedPeriod} channels={data.sentimentByChannel} />
            <AudienceSummaryCard audience={data.audience} />
          </TwoColumns>
          <NewsReportCard data={data} period={selectedPeriod} />
          <CommentsReportCard data={data} period={selectedPeriod} />
          <RecommendationsReportCard data={data} />
        </>
      )}
    </Stack>
  )
}
