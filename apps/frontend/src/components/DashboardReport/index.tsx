import { Card } from '@/components/Card'
import { MetricCard } from '@/components/MetricCard'
import { Notice } from '@/components/Notice'
import type { DashboardReportProps } from '@/components/DashboardReport/types'
import { CommentsReportCard } from '@/components/CommentsReportCard'
import { NewsReportCard } from '@/components/NewsReportCard'
import { RecommendationsReportCard } from '@/components/RecommendationsReportCard'
import { ReportPeriodToolbar } from '@/components/ReportPeriodToolbar'
import { AudienceBreakdownCard as AudienceSummaryCard } from '@/components/AudienceBreakdownCard'
import { ChannelSentimentBalanceCard } from '@/components/ChannelSentimentBalanceCard'
import { NewsSentimentDistributionCard } from '@/components/NewsSentimentDistributionCard'
import { NewsSentimentTimelineCard } from '@/components/NewsSentimentTimelineCard'
import { SentimentByChannelCard as SentimentChartCard } from '@/components/SentimentByChannelCard'
import { ChartsGrid, Metrics, Stack, TwoColumns, WideChart } from '@/components/DashboardReport/styles'
import { useDashboardReport } from '@/hooks/useDashboardReport'

export function DashboardReport({ data, selectedPeriodId, onPeriodChange }: DashboardReportProps) {
  const {
    exportError,
    exportFile,
    newsSentiment,
    newsSentimentTimeline,
    channelSentimentBalance,
  } = useDashboardReport(data)
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
          <ChartsGrid>
            <NewsSentimentDistributionCard sentiments={newsSentiment} />
            <ChannelSentimentBalanceCard channels={channelSentimentBalance} />
            <WideChart>
              <NewsSentimentTimelineCard days={newsSentimentTimeline} />
            </WideChart>
          </ChartsGrid>
          <NewsReportCard data={data} period={selectedPeriod} />
          <CommentsReportCard data={data} period={selectedPeriod} />
          <RecommendationsReportCard data={data} />
        </>
      )}
    </Stack>
  )
}
