export type MetricCardAccent = 'gold' | 'blue' | 'red' | 'green'

export interface MetricCardProps {
  label: string
  value: number | string
  accent?: MetricCardAccent
}
