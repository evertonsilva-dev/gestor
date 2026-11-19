import styled from 'styled-components'
import type { DashboardAudienceTone } from './types'

export const Stack = styled.div`
  display: grid;
  gap: 20px;
`

export const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`

export const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(260px, 0.75fr);
  gap: 20px;
  @media (max-width: 940px) { grid-template-columns: 1fr; }
`

export const List = styled.div`
  display: grid;
  gap: 12px;
`

export const Row = styled.article`
  padding: 13px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: 0; padding-bottom: 0; }
  strong { display: block; line-height: 1.45; }
  p { margin: 5px 0 0; color: ${({ theme }) => theme.colors.inkSoft}; font-size: 0.82rem; line-height: 1.5; }
`

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 8px;
  span {
    padding: 4px 8px;
    border-radius: ${({ theme }) => theme.radius.pill};
    color: ${({ theme }) => theme.colors.inkSoft};
    background: ${({ theme }) => theme.colors.surfaceMuted};
    font-size: 0.72rem;
  }
`

export const AudienceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: 680px) { grid-template-columns: 1fr; }
`

export const AudienceCard = styled.div<{ $tone: DashboardAudienceTone; $width: number }>`
  padding: 16px;
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme, $tone }) => $tone === 'blue'
    ? theme.colors.blueSoft
    : $tone === 'gold'
      ? theme.colors.goldSoft
      : theme.colors.redSoft};
  span { color: ${({ theme }) => theme.colors.inkSoft}; font-size: 0.8rem; }
  strong { display: block; margin: 9px 0; font-size: 1.5rem; }
  div { height: 6px; overflow: hidden; border-radius: 999px; background: rgba(31, 41, 55, 0.1); }
  i {
    display: block;
    width: ${({ $width }) => $width}%;
    height: 100%;
    border-radius: inherit;
    background: ${({ theme, $tone }) => $tone === 'blue' ? theme.colors.blue : $tone === 'gold' ? theme.colors.gold : theme.colors.red};
  }
`

export const PeriodBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surface};

  & > div:first-child { flex: 1; min-width: min(220px, 100%); max-width: 360px; }
  p { margin: 0; color: ${({ theme }) => theme.colors.inkSoft}; font-size: 0.8rem; }
`

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  @media (max-width: 520px) { width: 100%; button { flex: 1; } }
`

export const ChartContainer = styled.div`
  width: 100%;
  height: 290px;
`
