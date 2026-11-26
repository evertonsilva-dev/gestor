import styled from "styled-components";

export const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 0.75fr) minmax(0, 1.25fr);
  gap: 20px;
  min-width: 0;

  > div {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
    gap: 20px;
    min-width: 0;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Form = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  min-width: 0;
`;

export const List = styled.div`
  display: grid;
  gap: 12px;
`;

export const OrganizationRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  min-width: 0;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surface};
  @media (max-width: 620px) {
    flex-direction: column;
  }
`;

export const OrganizationIdentity = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1 1 240px;
  min-width: 0;
  > div {
    display: grid;
    gap: 7px;
    min-width: 0;
  }
  h3 {
    margin: 0;
    font-size: 0.95rem;
    overflow-wrap: anywhere;
  }
  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.inkSoft};
    font-size: 0.78rem;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }
`;

export const OrganizationMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

export const OrganizationIcon = styled.span`
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.goldSoft};
`;

export const OrganizationState = styled.span<{ $active: boolean }>`
  display: inline-flex;
  width: fit-content;
  padding: 4px 9px;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.green : theme.colors.inkSoft};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.greenSoft : theme.colors.surfaceMuted};
  font-size: 0.72rem;
  font-weight: 700;
`;

export const OrganizationSlug = styled.code`
  display: inline-flex;
  max-width: 100%;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.inkSoft};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  font-size: 0.72rem;
  overflow-wrap: anywhere;
`;

export const AdminCardBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.goldSoft};
  font-size: 0.76rem;
  font-weight: 700;
`;

export const KeySecret = styled.code`
  display: block;
  margin-top: 8px;
  overflow-wrap: anywhere;
  user-select: all;
`;

export const TopicList = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
  container-type: inline-size;
`;

export const TopicRow = styled.section`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  min-width: 0;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surface};
  @container (max-width: 500px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const TopicInfo = styled.div`
  display: grid;
  gap: 9px;
  min-width: 0;
  h3 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 0.95rem;
  }
  @container (max-width: 500px) {
    width: 100%;
  }
`;

export const TopicActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 7px;
  flex: 0 0 auto;
  @container (max-width: 500px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    width: 100%;
  }
`;

export const TopicStatus = styled.span<{ $active: boolean }>`
  display: inline-flex;
  padding: 4px 9px;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.green : theme.colors.inkSoft};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.greenSoft : theme.colors.surfaceMuted};
  font-size: 0.72rem;
  font-weight: 700;
`;

export const KeywordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
`;

export const KeywordChip = styled.span`
  display: inline-flex;
  max-width: 100%;
  padding: 4px 9px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.navyLight};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  font-size: 0.75rem;
  overflow-wrap: anywhere;
`;

export const AdminFormDisclosure = styled.details`
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
    margin: 12px 0;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  &[open] summary {
    margin-bottom: 12px;
  }
`;

export const TopicDisclosure = AdminFormDisclosure;

export const TopicEditDisclosure = styled(TopicDisclosure)`
  summary {
    padding: 7px 10px;
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }
  @container (max-width: 500px) {
    width: 100%;
    &[open] {
      grid-column: 1 / -1;
    }
  }
`;

export const TopicContextBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.goldSoft};
  font-size: 0.78rem;
  font-weight: 700;
`;
