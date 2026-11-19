import styled from 'styled-components'

export const List = styled.div`
  display: grid;
  gap: 12px;
`

export const Row = styled.article`
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.small};
`

export const RowHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  p { margin: 0; line-height: 1.5; overflow-wrap: anywhere; }
  small { display: block; margin-top: 5px; color: ${({ theme }) => theme.colors.inkSoft}; }
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
`

export const EditForm = styled.form`
  display: grid;
  gap: 10px;
`
