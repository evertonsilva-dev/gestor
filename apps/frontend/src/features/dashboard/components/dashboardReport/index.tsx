import { useState } from 'react'
import { FileSpreadsheet, FileText } from 'lucide-react'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { ExternalLink } from '@/components/appLink'
import { FormField } from '@/components/formField'
import { MetricCard } from '@/components/metricCard'
import { Notice } from '@/components/notice'
import { formatDate, formatShortDate } from '@/lib/dateFormat'
import { theme } from '@/theme'
import type { DashboardReportProps } from './types'
import {
  Actions,
  AudienceCard,
  AudienceGrid,
  ChartContainer,
  List,
  Metrics,
  PeriodBar,
  Row,
  Stack,
  Tags,
  TwoColumns,
} from './styles'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const profileNames = {
  militante: 'Militantes',
  simpatizante: 'Simpatizantes',
  detrator: 'Detratores',
} as const

const sentimentNames = {
  positive: 'Positivo',
  neutral: 'Neutro',
  negative: 'Negativo',
} as const

const categoryNames = {
  insight: 'Insight',
  action: 'Ação',
  example: 'Exemplo',
} as const

const profileTones = {
  militante: 'blue',
  simpatizante: 'gold',
  detrator: 'red',
} as const

export function DashboardReport({ data, selectedPeriodId, onPeriodChange }: DashboardReportProps) {
  const [exportError, setExportError] = useState<string | null>(null)
  const selectedPeriod = data.selectedPeriod

  async function exportFile(kind: 'pdf' | 'excel') {
    setExportError(null)
    try {
      const { downloadExcelReport, downloadPdfReport } = await import('../../services/exportReport')
      if (kind === 'pdf') downloadPdfReport(data)
      else await downloadExcelReport(data)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Não foi possível gerar o arquivo.')
    }
  }

  return (
    <Stack>
      {data.updateInProgress && (
        <Notice>
          Atualização em andamento! Enquanto isso, você pode consultar os resultados do último período finalizado.
        </Notice>
      )}
      <PeriodBar>
        <FormField
          as="select"
          label="Período de referência"
          value={selectedPeriodId}
          onChange={onPeriodChange}
          isSearchable={false}
          disabled={data.availablePeriods.length === 0}
          options={data.availablePeriods.length === 0
            ? [{ value: '', label: 'Nenhum relatório publicado' }]
            : data.availablePeriods.map((period) => ({
              value: period.id,
              label: `${formatShortDate(period.startDate)} a ${formatShortDate(period.endDate)}`,
            }))}
        />
        <p>Última publicação: <strong>{formatDate(data.lastPublishedAt)}</strong></p>
        <Actions>
          <Button size="small" variant="secondary" disabled={!selectedPeriod} onClick={() => void exportFile('pdf')}>
            <FileText size={15} /> PDF
          </Button>
          <Button size="small" variant="secondary" disabled={!selectedPeriod} onClick={() => void exportFile('excel')}>
            <FileSpreadsheet size={15} /> Excel
          </Button>
        </Actions>
      </PeriodBar>

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
            <Card title="Sentimento por canal" subtitle={`Dados de ${formatDate(selectedPeriod.startDate)} a ${formatDate(selectedPeriod.endDate)}`}>
              {data.sentimentByChannel.length === 0 ? <p>Nenhum canal cadastrado para este período.</p> : (
                <ChartContainer>
                  <Bar
                    aria-label="Gráfico de sentimento por canal"
                    data={{
                      labels: data.sentimentByChannel.map((channel) => channel.channelName),
                      datasets: [
                        {
                          label: 'Positivo',
                          data: data.sentimentByChannel.map((channel) => channel.positive),
                          backgroundColor: theme.colors.blue,
                          borderRadius: 4,
                        },
                        {
                          label: 'Neutro',
                          data: data.sentimentByChannel.map((channel) => channel.neutral),
                          backgroundColor: theme.colors.gold,
                          borderRadius: 4,
                        },
                        {
                          label: 'Negativo',
                          data: data.sentimentByChannel.map((channel) => channel.negative),
                          backgroundColor: theme.colors.red,
                          borderRadius: 4,
                        },
                      ],
                    } satisfies ChartData<'bar'>}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: theme.colors.inkSoft,
                            boxWidth: 12,
                            boxHeight: 12,
                            useBorderRadius: true,
                            borderRadius: 4,
                          },
                        },
                        tooltip: {
                          backgroundColor: theme.colors.navy,
                          titleColor: theme.colors.surface,
                          bodyColor: theme.colors.surface,
                          padding: 10,
                          cornerRadius: 8,
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: theme.colors.inkSoft },
                        },
                        y: {
                          beginAtZero: true,
                          ticks: { precision: 0, color: theme.colors.inkSoft },
                          grid: { color: theme.colors.border },
                        },
                      },
                    } satisfies ChartOptions<'bar'>}
                  />
                </ChartContainer>
              )}
            </Card>
            <Card title="Categorização do público" subtitle="Distribuição dos comentários analisados">
              <AudienceGrid>
                {(['militante', 'simpatizante', 'detrator'] as const).map((profile) => {
                  const audience = data.audience.find((item) => item.profile === profile)
                  const percentage = audience?.percentage ?? 0
                  return (
                    <AudienceCard key={profile} $tone={profileTones[profile]} $width={percentage}>
                      <span>{profileNames[profile]}</span>
                      <strong>{percentage}%</strong>
                      <div><i /></div>
                      <span>{audience?.count ?? 0} registros</span>
                    </AudienceCard>
                  )
                })}
              </AudienceGrid>
            </Card>
          </TwoColumns>

          <Card title="Notícias monitoradas" subtitle={`${data.news.length} registros no período`}>
            {data.news.length === 0 ? <p>Nenhuma notícia registrada neste período.</p> : (
              <List>
                {data.news.map((news) => (
                  <Row key={news.id}>
                    <strong>{news.title}</strong>
                    <Tags>
                      <span>{news.channelName}</span>
                      <span>{sentimentNames[news.sentiment]}</span>
                      <span>{formatShortDate(news.publishedAt)}</span>
                      {news.sourceUrl && <span><ExternalLink href={news.sourceUrl} target="_blank" rel="noreferrer">Fonte</ExternalLink></span>}
                    </Tags>
                  </Row>
                ))}
              </List>
            )}
          </Card>

          <Card title="Comentários analisados" subtitle={`${data.comments.length} registros no período`}>
            {data.comments.length === 0 ? <p>Nenhum comentário registrado neste período.</p> : (
              <List>
                {data.comments.map((comment) => (
                  <Row key={comment.id}>
                    <strong>{comment.content}</strong>
                    <Tags>
                      <span>{comment.channelName}</span>
                      <span>{profileNames[comment.profile]}</span>
                      <span>{sentimentNames[comment.sentiment]}</span>
                      <span>{formatShortDate(comment.commentedAt)}</span>
                    </Tags>
                  </Row>
                ))}
              </List>
            )}
          </Card>

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
        </>
      )}
    </Stack>
  )
}
