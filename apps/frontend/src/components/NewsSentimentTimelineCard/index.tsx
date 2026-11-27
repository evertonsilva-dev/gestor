import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card } from '@/components/Card'
import { ChartContainer } from '@/components/DashboardReport/styles'
import type { NewsSentimentDay } from '@/services/dashboard/reportAnalytics'
import { theme } from '@/theme'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface NewsSentimentTimelineCardProps {
  days: NewsSentimentDay[]
}

export function NewsSentimentTimelineCard({ days }: NewsSentimentTimelineCardProps) {
  const total = days.reduce((count, day) => count + day.positive + day.neutral + day.negative, 0)

  return (
    <Card title="Evolução do sentimento das notícias" subtitle="Publicações por dia, separadas por classificação">
      {total === 0 ? <p>Nenhuma notícia classificada neste período.</p> : (
        <ChartContainer>
          <Line
            aria-label="Evolução diária do sentimento nas notícias"
            data={{
              labels: days.map((day) => day.label),
              datasets: [
                {
                  label: 'Favorável',
                  data: days.map((day) => day.positive),
                  borderColor: theme.colors.blue,
                  backgroundColor: theme.colors.blue,
                  tension: 0.3,
                  pointRadius: 2,
                  pointHoverRadius: 4,
                },
                {
                  label: 'Neutro',
                  data: days.map((day) => day.neutral),
                  borderColor: theme.colors.gold,
                  backgroundColor: theme.colors.gold,
                  tension: 0.3,
                  pointRadius: 2,
                  pointHoverRadius: 4,
                },
                {
                  label: 'Crítico',
                  data: days.map((day) => day.negative),
                  borderColor: theme.colors.red,
                  backgroundColor: theme.colors.red,
                  tension: 0.3,
                  pointRadius: 2,
                  pointHoverRadius: 4,
                },
              ],
            } satisfies ChartData<'line'>}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { intersect: false, mode: 'index' },
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
                  ticks: { color: theme.colors.inkSoft, maxRotation: 0 },
                },
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0, color: theme.colors.inkSoft },
                  grid: { color: theme.colors.border },
                },
              },
            } satisfies ChartOptions<'line'>}
          />
        </ChartContainer>
      )}
    </Card>
  )
}
