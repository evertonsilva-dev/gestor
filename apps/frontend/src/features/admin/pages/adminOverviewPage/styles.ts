import styled from 'styled-components'
import { AppLink } from '@/components/appLink'

type ActionTone = 'gold' | 'blue'

export const Stack = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  min-width: 0;
`

export const Links = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  min-width: 0;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`

export const ActionLink = styled(AppLink)`
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 18px;
  align-items: center;
  min-height: 60px;
  min-width: 0;
  gap: 12px;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  color: ${({ theme }) => theme.colors.ink};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  overflow-wrap: anywhere;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.navy};
    text-decoration: none;
    background: ${({ theme }) => theme.colors.blueSoft};
    border-color: ${({ theme }) => theme.colors.blue};
    transform: translateY(-2px);
  }

  &:active { transform: translateY(0); }
  > svg:last-child { color: ${({ theme }) => theme.colors.navyLight}; }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

export const ActionIcon = styled.span<{ $tone: ActionTone }>`
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme, $tone }) => $tone === 'gold' ? theme.colors.navy : theme.colors.navyLight};
  background: ${({ theme, $tone }) => $tone === 'gold' ? theme.colors.goldSoft : theme.colors.blueSoft};
`

export const ActionCopy = styled.span`
  display: grid;
  gap: 4px;
  min-width: 0;
  strong, small { overflow-wrap: anywhere; }
  strong { font-size: 0.9rem; }
  small { color: ${({ theme }) => theme.colors.inkSoft}; font-size: 0.76rem; line-height: 1.4; }
`
