import styled, { css } from 'styled-components'
import type { ButtonProps } from '@/components/Button/types'

export const StyledButton = styled.button<{
  $variant: NonNullable<ButtonProps['variant']>
  $size: NonNullable<ButtonProps['size']>
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radius.medium};
  font-weight: 650;
  line-height: 1.25;
  min-width: 0;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
  text-align: center;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    color 160ms ease,
    transform 160ms ease;
  ${({ $size }) => $size === 'small'
    ? css`min-height: 36px; padding: 0 13px; font-size: 0.82rem;`
    : css`min-height: 46px; padding: 0 18px; font-size: 0.92rem;`}
  svg { flex-shrink: 0; }

  &:hover:not(:disabled) { transform: translateY(-1px); }
  &:active:not(:disabled) { transform: translateY(0); }
  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.blue};
    outline-offset: 3px;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'secondary':
        return css`
          color: ${theme.colors.ink};
          background: ${theme.colors.surface};
          border-color: ${theme.colors.border};
          box-shadow: ${theme.shadows.subtle};
          &:hover:not(:disabled) {
            background: ${theme.colors.surfaceMuted};
            border-color: ${theme.colors.border};
            box-shadow: ${theme.shadows.hover};
          }
        `
      case 'quiet':
        return css`
          color: ${theme.colors.inkSoft};
          background: transparent;
          &:hover:not(:disabled) {
            color: ${theme.colors.ink};
            background: ${theme.colors.surfaceMuted};
            border-color: ${theme.colors.border};
          }
        `
      case 'danger':
        return css`
          color: ${theme.colors.onDark};
          background: ${theme.colors.danger};
          box-shadow: ${theme.shadows.danger};
          &:hover:not(:disabled) {
            background: ${theme.colors.dangerHover};
            box-shadow: ${theme.shadows.dangerHover};
          }
        `
      default:
        return css`
          color: ${theme.colors.navy};
          background: ${theme.colors.gold};
          box-shadow: ${theme.shadows.primary};
          &:hover:not(:disabled) {
            background: ${theme.colors.goldHover};
            box-shadow: ${theme.shadows.primaryHover};
          }
        `
    }
  }}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`
