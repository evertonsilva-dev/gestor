import styled from 'styled-components'

export const ImportForm = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  min-width: 0;
`

export const ImportDisclosure = styled.details`
  min-width: 0;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  summary {
    display: flex;
    align-items: center;
    gap: 8px;
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

export const ImportHelp = styled.p`
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.inkSoft};
  font-size: 0.82rem;
  line-height: 1.5;
`

export const ImportStatus = styled.span<{ $tone: 'ready' | 'pending' | 'warning' }>`
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme, $tone }) => (
    $tone === 'ready' ? theme.colors.green
      : $tone === 'warning' ? theme.colors.navy
        : theme.colors.inkSoft
  )};
  background: ${({ theme, $tone }) => (
    $tone === 'ready' ? theme.colors.greenSoft
      : $tone === 'warning' ? theme.colors.goldSoft
        : theme.colors.surfaceMuted
  )};
  font-size: 0.74rem;
  font-weight: 700;
  overflow-wrap: anywhere;
`

export const ImportPreviewHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surface};
  strong { display: block; }
  small { display: block; margin-top: 3px; color: ${({ theme }) => theme.colors.inkSoft}; }
`

export const ImportActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;

  @media (max-width: 520px) {
    width: 100%;
    > button { flex: 1 1 100%; }
    > label { justify-content: center; }
  }
`

export const FilePicker = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme }) => theme.colors.ink};
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;

  &:hover { background: ${({ theme }) => theme.colors.surfaceMuted}; }
  input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    clip-path: inset(50%);
  }
`

export const Preview = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
  max-height: 560px;
  overflow: auto;
`

export const PreviewRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  min-width: 0;
  gap: 12px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surface};

  p { min-width: 0; margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
  small { display: block; margin-top: 5px; color: ${({ theme }) => theme.colors.inkSoft}; overflow-wrap: anywhere; }
  small[data-error='true'] { color: ${({ theme }) => theme.colors.danger}; }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`

export const ClassificationFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(145px, 1fr));
  gap: 8px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`
