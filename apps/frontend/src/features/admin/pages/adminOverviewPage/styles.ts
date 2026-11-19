import styled from 'styled-components'
import { AppLink } from '@/components/appLink'

export const Stack = styled.div`
  display: grid;
  gap: 20px;
`

export const Links = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`

export const ActionLink = styled(AppLink)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  padding: 14px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  color: ${({ theme }) => theme.colors.ink};
  background: ${({ theme }) => theme.colors.surfaceMuted};
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

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`
