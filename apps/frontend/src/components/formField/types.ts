import type {
  ChangeEventHandler,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

interface FormFieldBaseProps {
  label: string
  id?: string
}

type InputFieldProps = FormFieldBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'id'> & {
    as?: 'input'
    onChange?: ChangeEventHandler<HTMLInputElement>
  }

export interface SelectOption {
  value: string
  label: string
  isDisabled?: boolean
}

interface SelectFieldProps extends FormFieldBaseProps {
  as: 'select'
  name?: string
  options: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  isSearchable?: boolean
  onChange?: (value: string) => void
}

type TextareaFieldProps = FormFieldBaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'id'> & {
    as: 'textarea'
    onChange?: ChangeEventHandler<HTMLTextAreaElement>
  }

export type FormFieldProps = InputFieldProps | SelectFieldProps | TextareaFieldProps
