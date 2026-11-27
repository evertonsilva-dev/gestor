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
import { Card } from '@/components/Card'
import { formatDate } from '@/lib/dateFormat'
import { theme } from '@/theme'
import type { DashboardData } from '@/types/domain'
import { ChartContainer } from '@/components/DashboardReport/styles'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface SentimentByChannelCardProps {
  period: NonNullable<DashboardData['selectedPeriod']>
  channels: DashboardData['sentimentByChannel']
}

export function SentimentByChannelCard({ period, channels }: SentimentByChannelCardProps) {
  const isHorizontal = channels.length > 4

  return (
    <Card title="Sentimento por canal" subtitle={`Dados de ${formatDate(period.startDate)} a ${formatDate(period.endDate)}`}>
      {channels.length === 0 ? <p>Nenhum canal cadastrado para este período.</p> : (
        <ChartContainer>
          <Bar
            aria-label="Gráfico de sentimento por canal"
            data={{
              labels: channels.map((channel) => channel.channelName),
              datasets: [
                { label: 'Favorável', data: channels.map((channel) => channel.positive), backgroundColor: theme.colors.blue, borderRadius: 4 },
                { label: 'Neutro', data: channels.map((channel) => channel.neutral), backgroundColor: theme.colors.gold, borderRadius: 4 },
                { label: 'Crítico', data: channels.map((channel) => channel.negative), backgroundColor: theme.colors.red, borderRadius: 4 },
              ],
            } satisfies ChartData<'bar'>}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: isHorizontal ? 'y' : 'x',
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
                x: isHorizontal
                  ? {
                      beginAtZero: true,
                      ticks: { precision: 0, color: theme.colors.inkSoft },
                      grid: { color: theme.colors.border },
                    }
                  : { grid: { display: false }, ticks: { color: theme.colors.inkSoft } },
                y: isHorizontal
                  ? { grid: { display: false }, ticks: { color: theme.colors.inkSoft } }
                  : {
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
  )
}
