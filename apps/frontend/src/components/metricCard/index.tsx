import type { MetricCardProps } from './types'
import { Surface } from './styles'

export function MetricCard({
  label,
  value,
  accent = 'gold',
}: MetricCardProps) {
  return <Surface $accent={accent}><span>{label}</span><strong>{value}</strong></Surface>
}
