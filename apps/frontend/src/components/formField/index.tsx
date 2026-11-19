import { useEffect, useId, useRef, useState } from 'react'
import Select from 'react-select'
import { useTheme } from 'styled-components'
import type { FormFieldProps } from './types'
import { createSelectStyles, Field, FieldLabel } from './styles'

export function FormField(props: FormFieldProps) {
  const generatedId = useId()
  const controlId = props.id ?? generatedId
  const fieldRef = useRef<HTMLDivElement>(null)
  const [resetKey, setResetKey] = useState(0)
  const theme = useTheme()

  useEffect(() => {
    if (props.as !== 'select') return

    const form = fieldRef.current?.closest('form')
    if (!form) return

    function resetSelect() {
      setResetKey((current) => current + 1)
    }

    form.addEventListener('reset', resetSelect)
    return () => form.removeEventListener('reset', resetSelect)
  }, [props.as])

  if (props.as === 'select') {
    const {
      label,
      as,
      options,
      value,
      defaultValue,
      onChange,
      name,
      required,
      disabled,
      placeholder,
      isSearchable,
    } = props
    const selectedOption = (selectedValue: string | undefined) =>
      options.find((option) => option.value === selectedValue) ?? null

    return (
      <Field ref={fieldRef} data-control={as}>
        <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
        <Select
          key={`${controlId}-${resetKey}`}
          inputId={controlId}
          instanceId={controlId}
          aria-label={label}
          name={name}
          options={options}
          value={value === undefined ? undefined : selectedOption(value)}
          defaultValue={value === undefined
            ? selectedOption(defaultValue ?? options[0]?.value)
            : undefined}
          onChange={(option) => onChange?.(option?.value ?? '')}
          required={required}
          isDisabled={disabled}
          isSearchable={isSearchable ?? true}
          placeholder={placeholder ?? 'Selecione'}
          styles={createSelectStyles(theme)}
        />
      </Field>
    )
  }

  if (props.as === 'textarea') {
    const { label, id, as, ...textareaProps } = props
    return (
      <Field data-control={as}>
        <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
        <textarea id={id ?? controlId} {...textareaProps} />
      </Field>
    )
  }

  const { label, id, as, ...inputProps } = props
  return (
    <Field data-control={as ?? 'input'}>
      <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
      <input id={id ?? controlId} {...inputProps} />
    </Field>
  )
}
