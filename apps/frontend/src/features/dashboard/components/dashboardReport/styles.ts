import styled from 'styled-components'
import type { DashboardAudienceTone } from './types'

export const Stack = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  min-width: 0;
`

export const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  min-width: 0;
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`

export const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(260px, 0.75fr);
  gap: 20px;
  min-width: 0;
  @media (max-width: 940px) { grid-template-columns: 1fr; }
`

export const List = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
`

export const Row = styled.article`
  padding: 13px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: 0; padding-bottom: 0; }
  strong { display: block; line-height: 1.45; overflow-wrap: anywhere; }
  p { margin: 5px 0 0; color: ${({ theme }) => theme.colors.inkSoft}; font-size: 0.82rem; line-height: 1.5; overflow-wrap: anywhere; }
`

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 8px;
  span {
    min-width: 0;
    padding: 4px 8px;
    border-radius: ${({ theme }) => theme.radius.pill};
    color: ${({ theme }) => theme.colors.inkSoft};
    background: ${({ theme }) => theme.colors.surfaceMuted};
    font-size: 0.72rem;
    overflow-wrap: anywhere;
  }
`

export const AudienceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: 680px) { grid-template-columns: 1fr; }
`

export const AudienceCard = styled.div<{ $tone: DashboardAudienceTone; $width: number }>`
  min-width: 0;
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
  min-width: 0;
  padding: 16px 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surface};

  & > div:first-child { flex: 1 1 220px; min-width: 0; max-width: 360px; }
  p { min-width: 0; margin: 0; color: ${({ theme }) => theme.colors.inkSoft}; font-size: 0.8rem; overflow-wrap: anywhere; }

  @media (max-width: 560px) {
    align-items: stretch;
    flex-direction: column;
    padding: 14px;

    & > div:first-child { flex: none; width: 100%; max-width: none; }
    > p { width: 100%; }
  }
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  @media (max-width: 520px) { width: 100%; button { flex: 1 1 0; } }
`

export const ChartContainer = styled.div`
  width: 100%;
  min-width: 0;
  height: 290px;
`
