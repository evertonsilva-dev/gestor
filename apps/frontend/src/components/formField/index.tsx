import Select from 'react-select'
import { useFormField } from '@/hooks/useFormField'
import type { FormFieldProps } from '@/components/FormField/types'
import { createSelectStyles, Field, FieldLabel } from '@/components/FormField/styles'

export function FormField(props: FormFieldProps) {
  const { controlId, fieldRef, resetKey, theme } = useFormField({
    id: props.id,
    as: props.as,
  })

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
