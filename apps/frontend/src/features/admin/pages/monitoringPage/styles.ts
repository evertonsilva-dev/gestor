import styled from 'styled-components'

export const Stack = styled.div`
  display: grid;
  gap: 20px;
`

export const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  @media (max-width: 820px) { grid-template-columns: 1fr; }
`

export const Form = styled.form`
  display: grid;
  gap: 13px;
`

export const PeriodRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: 0; }
  p { margin: 0; }
`
