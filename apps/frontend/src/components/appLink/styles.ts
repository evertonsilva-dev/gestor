import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

const linkStyles = css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.blue};
  font-size: 0.9rem;
  font-weight: 650;
  line-height: 1.4;
  text-decoration: none;
  text-underline-offset: 3px;
  transition: color 160ms ease, text-decoration-color 160ms ease;

  svg { flex-shrink: 0; }

  &:hover {
    color: ${({ theme }) => theme.colors.navy};
    text-decoration: underline;
  }

  &:focus-visible {
    border-radius: 4px;
    outline: 3px solid ${({ theme }) => theme.colors.blue};
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

export const AppLink = styled(Link)`
  ${linkStyles}
`

export const ExternalLink = styled.a`
  ${linkStyles}
`
