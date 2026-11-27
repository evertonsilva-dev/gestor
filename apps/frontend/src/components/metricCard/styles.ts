import styled from 'styled-components'
import type { MetricCardAccent } from '@/components/MetricCard/types'

export const Surface = styled.article<{ $accent: MetricCardAccent }>`
  padding: 18px;
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: 3px solid ${({ theme, $accent }) => theme.colors[$accent]};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surface};

  span { display: block; color: ${({ theme }) => theme.colors.inkSoft}; font-size: 0.79rem; overflow-wrap: anywhere; }
  strong { display: block; margin-top: 10px; font-size: 1.8rem; letter-spacing: -0.05em; overflow-wrap: anywhere; }
`
