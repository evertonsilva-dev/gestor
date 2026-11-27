import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Card } from '@/components/Card'
import { ChartContainer } from '@/components/DashboardReport/styles'
import type { NewsSentimentCounts } from '@/services/dashboard/reportAnalytics'
import { theme } from '@/theme'

ChartJS.register(ArcElement, Tooltip, Legend)

interface NewsSentimentDistributionCardProps {
  sentiments: NewsSentimentCounts
}

export function NewsSentimentDistributionCard({ sentiments }: NewsSentimentDistributionCardProps) {
  const total = sentiments.positive + sentiments.neutral + sentiments.negative

  return (
    <Card title="Distribuição de sentimento nas notícias" subtitle={`${total} notícias classificadas`}>
      {total === 0 ? <p>Nenhuma notícia classificada neste período.</p> : (
        <ChartContainer>
          <Doughnut
            aria-label="Distribuição de sentimento das notícias"
            data={{
              labels: ['Favorável', 'Neutro', 'Crítico'],
              datasets: [{
                data: [sentiments.positive, sentiments.neutral, sentiments.negative],
                backgroundColor: [theme.colors.blue, theme.colors.gold, theme.colors.red],
                borderColor: theme.colors.surface,
                borderWidth: 3,
                hoverOffset: 5,
              }],
            } satisfies ChartData<'doughnut'>}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '62%',
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
            } satisfies ChartOptions<'doughnut'>}
          />
        </ChartContainer>
      )}
    </Card>
  )
}
