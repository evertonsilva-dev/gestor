import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Card } from '@/components/Card'
import { ChartContainer } from '@/components/DashboardReport/styles'
import type { ChannelSentimentBalance } from '@/services/dashboard/reportAnalytics'
import { theme } from '@/theme'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface ChannelSentimentBalanceCardProps {
  channels: ChannelSentimentBalance[]
}

export function ChannelSentimentBalanceCard({ channels }: ChannelSentimentBalanceCardProps) {
  return (
    <Card title="Saldo de sentimento por canal" subtitle="Favoráveis menos críticos, em relação ao volume total de notícias">
      {channels.length === 0 ? <p>Nenhuma notícia classificada neste período.</p> : (
        <ChartContainer>
          <Bar
            aria-label="Saldo de sentimento das notícias por canal"
            data={{
              labels: channels.map((channel) => channel.channelName),
              datasets: [{
                label: 'Saldo de sentimento',
                data: channels.map((channel) => channel.score),
                backgroundColor: channels.map((channel) => (
                  channel.score >= 0 ? theme.colors.green : theme.colors.red
                )),
                borderRadius: 4,
                barPercentage: 0.72,
              }],
            } satisfies ChartData<'bar'>}
            options={{
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: theme.colors.navy,
                  titleColor: theme.colors.surface,
                  bodyColor: theme.colors.surface,
                  padding: 10,
                  cornerRadius: 8,
                  callbacks: {
                    label: (context) => {
                      const channel = channels[context.dataIndex]
                      const sign = channel.score > 0 ? '+' : ''
                      return `Saldo: ${sign}${channel.score}% · ${channel.total} notícias`
                    },
                  },
                },
              },
              scales: {
                x: {
                  min: -100,
                  max: 100,
                  ticks: {
                    color: theme.colors.inkSoft,
                    callback: (value) => `${value}%`,
                  },
                  grid: { color: theme.colors.border },
                },
                y: {
                  grid: { display: false },
                  ticks: { color: theme.colors.inkSoft },
                },
              },
            } satisfies ChartOptions<'bar'>}
          />
        </ChartContainer>
      )}
    </Card>
  )
}
