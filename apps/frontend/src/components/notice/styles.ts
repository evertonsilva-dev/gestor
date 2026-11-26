import styled from 'styled-components'
import type { NoticeTone } from './types'

export const Box = styled.div<{ $tone: NoticeTone }>`
  padding: 13px 15px;
  min-width: 0;
  border: 1px solid ${({ theme, $tone }) => $tone === 'error'
    ? theme.colors.red
    : $tone === 'success'
      ? theme.colors.green
      : theme.colors.blue};
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme, $tone }) => $tone === 'error'
    ? theme.colors.danger
    : $tone === 'success'
      ? theme.colors.green
      : theme.colors.ink};
  background: ${({ theme, $tone }) => $tone === 'error'
    ? theme.colors.redSoft
    : $tone === 'success'
      ? theme.colors.greenSoft
      : theme.colors.blueSoft};
  font-size: 0.9rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
`
