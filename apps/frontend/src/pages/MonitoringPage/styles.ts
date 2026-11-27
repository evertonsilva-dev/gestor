import styled from 'styled-components'

export const Stack = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  min-width: 0;
`

export const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  min-width: 0;
  @media (max-width: 820px) { grid-template-columns: 1fr; }
`

export const Form = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 13px;
  min-width: 0;
`

export const PeriodRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  padding: 13px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: 0; }
  p { min-width: 0; margin: 0; line-height: 1.5; overflow-wrap: anywhere; }
  > div { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 7px; }

  @media (max-width: 620px) {
    flex-direction: column;
    align-items: stretch;
    > div { justify-content: flex-start; }
  }
`

export const PeriodList = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 14px;
`

export const PeriodCard = styled.article<{ $selected: boolean }>`
  display: grid;
  gap: 13px;
  min-width: 0;
  padding: 15px;
  border: 1px solid ${({ theme, $selected }) => $selected ? theme.colors.blue : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme, $selected }) => $selected ? theme.colors.blueSoft : theme.colors.surface};
`

export const PeriodCardHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
`

export const PeriodIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  flex: 1 1 230px;
  min-width: 0;
`

export const PeriodIcon = styled.span`
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.goldSoft};
`

export const PeriodDetails = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
  strong { overflow-wrap: anywhere; }
  > div { display: flex; flex-wrap: wrap; gap: 6px; }
`

export const PeriodActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  @media (max-width: 620px) { justify-content: flex-start; }
`

export const PeriodEditor = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
  padding-top: 13px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

export const PeriodFormDisclosure = styled.details`
  min-width: 0;
  summary {
    display: flex;
    align-items: center;
    gap: 7px;
    width: fit-content;
    max-width: 100%;
    padding: 8px 11px;
    border-radius: ${({ theme }) => theme.radius.small};
    color: ${({ theme }) => theme.colors.navy};
    background: ${({ theme }) => theme.colors.goldSoft};
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 700;
    list-style: none;
    overflow-wrap: anywhere;
  }
  summary::-webkit-details-marker { display: none; }
  &[open] summary { margin-bottom: 12px; }
`

export const ChannelList = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 18px;
`

export const ChannelCard = styled.section`
  display: grid;
  gap: 14px;
  min-width: 0;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surfaceMuted};
`

export const ChannelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  min-width: 0;
  > div:last-child {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
  @media (max-width: 620px) {
    align-items: flex-start;
    > div:last-child { justify-content: flex-start; }
  }
`

export const ChannelIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  > div { min-width: 0; }
  strong { display: block; overflow-wrap: anywhere; }
  small { display: block; margin-top: 3px; color: ${({ theme }) => theme.colors.inkSoft}; }
`

export const ChannelIcon = styled.span`
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.goldSoft};
`

export const StatusPill = styled.span<{ $tone: 'active' | 'inactive' | 'positive' | 'neutral' | 'negative' | 'pending' }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  width: fit-content;
  padding: 4px 9px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1.3;
  color: ${({ theme, $tone }) => (
    $tone === 'active' || $tone === 'positive'
      ? theme.colors.green
      : $tone === 'negative'
        ? theme.colors.danger
        : $tone === 'pending'
          ? theme.colors.navy
          : theme.colors.inkSoft
  )};
  background: ${({ theme, $tone }) => (
    $tone === 'active' || $tone === 'positive'
      ? theme.colors.greenSoft
      : $tone === 'negative'
        ? theme.colors.redSoft
        : $tone === 'pending'
          ? theme.colors.goldSoft
          : theme.colors.surface
  )};
`

export const PageSection = styled.div`
  display: grid;
  gap: 10px;
  padding-left: 14px;
  border-left: 2px solid ${({ theme }) => theme.colors.gold};
  min-width: 0;
`

export const PageSectionHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: ${({ theme }) => theme.colors.inkSoft};
  font-size: 0.8rem;
  font-weight: 700;
`

export const PageList = styled.div`
  display: grid;
  gap: 8px;
`

export const PageItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.small};
  background: ${({ theme }) => theme.colors.surface};
  > div:last-child {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
  @media (max-width: 620px) {
    align-items: flex-start;
    > div:last-child { justify-content: flex-start; }
  }
`

export const PageIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1 1 220px;
  min-width: 0;
  > div { min-width: 0; }
  strong, small { display: block; overflow-wrap: anywhere; }
  small { margin-top: 2px; color: ${({ theme }) => theme.colors.inkSoft}; }
`

export const PageIcon = styled.span`
  display: grid;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.navyLight};
  background: ${({ theme }) => theme.colors.blueSoft};
`

export const PageFormDisclosure = PeriodFormDisclosure

export const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: 12px;
  min-width: 0;
`

export const ReviewCard = styled.article`
  display: grid;
  align-content: start;
  gap: 14px;
  min-width: 0;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surface};
`

export const ReviewCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
`

export const ReviewEvidence = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`

export const SentimentLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const SentimentTrack = styled.div`
  display: flex;
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.surfaceMuted};
`

export const SentimentSegment = styled.span<{ $tone: 'positive' | 'neutral' | 'negative'; $width: number }>`
  display: block;
  flex: 0 0 ${({ $width }) => `${$width}%`};
  background: ${({ theme, $tone }) => (
    $tone === 'positive'
      ? theme.colors.green
      : $tone === 'negative'
        ? theme.colors.red
        : theme.colors.gold
  )};
`

export const ReviewControls = styled.div`
  display: grid;
  gap: 9px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

export const ReviewStatus = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
`
