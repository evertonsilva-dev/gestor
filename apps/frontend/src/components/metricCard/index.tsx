import type { MetricCardProps } from '@/components/MetricCard/types'
import { Surface } from '@/components/MetricCard/styles'

export function MetricCard({
  label,
  value,
  accent = 'gold',
}: MetricCardProps) {
  return <Surface $accent={accent}><span>{label}</span><strong>{value}</strong></Surface>
}
