export type SourcePageAffinity = 'allied' | 'neutral' | 'critical'

export function suggestSourcePageAffinity(
  positive: number,
  neutral: number,
  negative: number,
): SourcePageAffinity | null {
  if (positive + neutral + negative < 3) return null

  if (positive > neutral && positive > negative) return 'allied'
  if (negative > positive && negative > neutral) return 'critical'
  return 'neutral'
}
