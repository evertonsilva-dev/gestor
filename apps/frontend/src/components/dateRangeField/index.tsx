import { useId } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { RangePicker } from 'rc-picker'
import dateFnsGenerateConfig from 'rc-picker/es/generate/dateFns'
import ptBrLocale from 'rc-picker/es/locale/pt_BR'
import { Field, FieldLabel } from '@/components/formField/styles'
import type { DateRangeFieldProps } from './types'
import { DatePickerPopupStyles, DateRangeControl } from './styles'
import 'rc-picker/assets/index.css'

export function DateRangeField({
  label,
  value,
  onChange,
  startName,
  endName,
}: DateRangeFieldProps) {
  const controlId = useId()
  const [startDate, endDate] = value

  return (
    <Field>
      <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
      <DateRangeControl>
        <RangePicker<Date>
          id={controlId}
          aria-label={label}
          generateConfig={dateFnsGenerateConfig}
          locale={ptBrLocale}
          superPrevIcon={<ChevronsLeft size={16} />}
          prevIcon={<ChevronLeft size={16} />}
          nextIcon={<ChevronRight size={16} />}
          superNextIcon={<ChevronsRight size={16} />}
          value={value}
          onChange={(dates) => onChange(dates ?? [null, null])}
          format="DD/MM/YYYY"
          placeholder={['Data inicial', 'Data final']}
          separator="até"
          allowClear
          inputReadOnly
          classNames={{ popup: 'gestor-date-picker-popup' }}
        />
      </DateRangeControl>
      <input type="hidden" name={startName} value={startDate ? format(startDate, 'yyyy-MM-dd') : ''} />
      <input type="hidden" name={endName} value={endDate ? format(endDate, 'yyyy-MM-dd') : ''} />
      <DatePickerPopupStyles />
    </Field>
  )
}
