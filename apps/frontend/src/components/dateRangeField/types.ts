export type DateRangeValue = [Date | null, Date | null]

export interface DateRangeFieldProps {
  label: string
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  startName: string
  endName: string
}
