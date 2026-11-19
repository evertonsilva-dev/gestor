import styled from 'styled-components'

export const Surface = styled.section`
  padding: clamp(18px, 2vw, 26px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow};
`

export const CardHeading = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  h2, h3 { margin: 0; color: ${({ theme }) => theme.colors.ink}; }
  h2 { font-size: 1.08rem; }
  h3 { font-size: 0.96rem; }
  p { margin: 5px 0 0; color: ${({ theme }) => theme.colors.inkSoft}; font-size: 0.84rem; }
`
