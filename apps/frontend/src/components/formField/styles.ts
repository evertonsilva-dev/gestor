import styled from 'styled-components'
import type { StylesConfig } from 'react-select'
import type { DefaultTheme } from 'styled-components'
import type { SelectOption } from './types'

export const Field = styled.div`
  display: grid;
  gap: 7px;
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.86rem;
  font-weight: 650;

  > input:not([type='hidden']),
  > textarea {
    width: 100%;
    min-height: 44px;
    padding: 10px 12px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.small};
    outline: none;
    color: ${({ theme }) => theme.colors.ink};
    background: ${({ theme }) => theme.colors.surface};
    font-weight: 400;
    transition: border-color 160ms ease, box-shadow 160ms ease;

    &:hover {
      border-color: ${({ theme }) => theme.colors.inkSoft};
    }

    &:focus-visible {
      border-color: ${({ theme }) => theme.colors.navy};
      box-shadow: 0 0 0 3px rgba(16, 23, 34, 0.08);
    }
  }

  > textarea { min-height: 100px; resize: vertical; }
`

export const FieldLabel = styled.label`
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.86rem;
  font-weight: 650;
`

export function createSelectStyles(theme: DefaultTheme): StylesConfig<SelectOption, false> {
  return {
    control: (base, state) => ({
      ...base,
      minHeight: 42,
      borderColor: state.isFocused ? theme.colors.navy : theme.colors.border,
      borderRadius: theme.radius.small,
      boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 23, 34, 0.08)' : 'none',
      backgroundColor: theme.colors.surface,
      transition: 'border-color 160ms ease, box-shadow 160ms ease',
      '&:hover': { borderColor: theme.colors.inkSoft },
    }),
    valueContainer: (base) => ({ ...base, padding: '2px 11px' }),
    input: (base) => ({ ...base, color: theme.colors.ink }),
    singleValue: (base) => ({ ...base, color: theme.colors.ink }),
    placeholder: (base) => ({ ...base, color: theme.colors.inkSoft }),
    indicatorsContainer: (base) => ({ ...base, color: theme.colors.inkSoft }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? theme.colors.navy : theme.colors.inkSoft,
      '&:hover': { color: theme.colors.navy },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 20,
      overflow: 'hidden',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.radius.medium,
      backgroundColor: theme.colors.surface,
      boxShadow: theme.shadow,
    }),
    option: (base, state) => ({
      ...base,
      color: theme.colors.ink,
      backgroundColor: state.isSelected
        ? theme.colors.blueSoft
        : state.isFocused
          ? theme.colors.surfaceMuted
          : theme.colors.surface,
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      '&:active': { backgroundColor: theme.colors.blueSoft },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 1000 }),
  }
}
