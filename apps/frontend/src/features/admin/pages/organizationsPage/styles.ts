import styled from 'styled-components'

export const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 0.75fr) minmax(0, 1.25fr);
  gap: 20px;

  > div {
    display: grid;
    align-content: start;
    gap: 20px;
    min-width: 0;
  }

  @media (max-width: 900px) { grid-template-columns: 1fr; }
`

export const Form = styled.form`
  display: grid;
  gap: 14px;
`

export const List = styled.div`
  display: grid;
  gap: 12px;
`

export const OrganizationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.small};
  h3 { margin: 0; font-size: 0.95rem; }
  p { margin: 5px 0 0; color: ${({ theme }) => theme.colors.inkSoft}; font-size: 0.78rem; }
  @media (max-width: 520px) { align-items: flex-start; flex-direction: column; }
`

export const KeySecret = styled.code`
  display: block;
  margin-top: 8px;
  overflow-wrap: anywhere;
  user-select: all;
`
