import styled, { keyframes } from 'styled-components'

const pulse = keyframes`
  50% { opacity: 0.35; }
`

export const Loading = styled.div`
  display: grid;
  min-height: 100vh;
  place-items: center;
  color: ${({ theme }) => theme.colors.inkSoft};
  font-size: 0.92rem;
  animation: ${pulse} 1.2s ease-in-out infinite;
`
