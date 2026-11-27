import styled from 'styled-components'

export const List = styled.div`
  display: grid;
  gap: 12px;
`

export const Row = styled.article`
  display: grid;
  gap: 14px;
  min-width: 0;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surface};
`

export const RowHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  @media (max-width: 620px) { width: 100%; }
`

export const RecordIdentity = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1 1 320px;
  min-width: 0;
  > div { display: grid; gap: 7px; min-width: 0; }
`

export const RecordIcon = styled.span<{ $type: 'news' | 'comment' | 'recommendation' }>`
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme, $type }) => (
    $type === 'news' ? theme.colors.navyLight
      : $type === 'comment' ? theme.colors.navy
        : theme.colors.green
  )};
  background: ${({ theme, $type }) => (
    $type === 'news' ? theme.colors.blueSoft
      : $type === 'comment' ? theme.colors.goldSoft
        : theme.colors.greenSoft
  )};
`

export const RecordLabels = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
`

export const RecordTypePill = styled.span`
  display: inline-flex;
  padding: 4px 9px;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  font-size: 0.73rem;
  font-weight: 700;
`

export const RecordSentimentPill = styled.span<{ $tone: 'positive' | 'neutral' | 'negative' }>`
  display: inline-flex;
  padding: 4px 9px;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme, $tone }) => (
    $tone === 'positive' ? theme.colors.green
      : $tone === 'negative' ? theme.colors.danger
        : theme.colors.inkSoft
  )};
  background: ${({ theme, $tone }) => (
    $tone === 'positive' ? theme.colors.greenSoft
      : $tone === 'negative' ? theme.colors.redSoft
        : theme.colors.surfaceMuted
  )};
  font-size: 0.73rem;
  font-weight: 700;
`

export const RecordSourcePill = styled.span`
  display: inline-flex;
  padding: 4px 9px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.inkSoft};
  background: ${({ theme }) => theme.colors.surface};
  font-size: 0.72rem;
  font-weight: 600;
`

export const RecordContent = styled.p`
  min-width: 0;
  margin: 0;
  line-height: 1.5;
  overflow-wrap: anywhere;
  small {
    display: block;
    margin-top: 5px;
    color: ${({ theme }) => theme.colors.inkSoft};
    overflow-wrap: anywhere;
  }
`

export const EditForm = styled.form`
  display: grid;
  gap: 10px;
  min-width: 0;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.small};
  background: ${({ theme }) => theme.colors.surfaceMuted};
`

export const AnalysisDetails = styled.aside`
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 10px 12px;
  border-left: 3px solid ${({ theme }) => theme.colors.gold};
  border-radius: ${({ theme }) => theme.radius.small};
  background: ${({ theme }) => theme.colors.goldSoft};
  overflow-wrap: anywhere;
  p, small { margin: 0; line-height: 1.5; }
  small { color: ${({ theme }) => theme.colors.inkSoft}; }
  strong { display: flex; align-items: center; gap: 6px; }
`
