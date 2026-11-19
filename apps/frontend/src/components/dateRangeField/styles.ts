import { createGlobalStyle, styled } from 'styled-components'

export const DateRangeControl = styled.div`
  width: 100%;

  .rc-picker {
    width: 100%;
    min-height: 0;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .rc-picker.rc-picker-focused {
    border: 0;
    box-shadow: none;
  }

  .rc-picker-range {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rc-picker-range .rc-picker-input {
    display: flex;
    flex: 1 1 0;
    align-items: center;
    min-width: 0;
    height: 44px;
    padding: 0 11px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.small};
    background: ${({ theme }) => theme.colors.surface};
    transition: border-color 160ms ease, box-shadow 160ms ease;
  }

  .rc-picker-range .rc-picker-input:hover {
    border-color: ${({ theme }) => theme.colors.inkSoft};
  }

  .rc-picker-range .rc-picker-input-active {
    border-color: ${({ theme }) => theme.colors.navy};
    box-shadow: 0 0 0 3px rgba(16, 23, 34, 0.08);
  }

  .rc-picker-input > input {
    min-width: 0;
    height: 100%;
    padding: 0;
    border: 0;
    border-radius: 0;
    outline: none;
    background: transparent;
    box-shadow: none;
    color: ${({ theme }) => theme.colors.ink};
    font: inherit;
    font-size: 0.9rem;
    font-weight: 400;
  }

  .rc-picker-input-active > input {
    background: transparent;
  }

  .rc-picker-input > input:focus-visible {
    border: 0;
    box-shadow: none;
  }

  .rc-picker-input > input::placeholder,
  .rc-picker-range-separator {
    color: ${({ theme }) => theme.colors.inkSoft};
  }

  .rc-picker-range-separator {
    flex: none;
    padding: 0 2px;
    font-size: 0.76rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .rc-picker-active-bar {
    display: none;
  }
`

export const DatePickerPopupStyles = createGlobalStyle`
  .rc-picker-dropdown.gestor-date-picker-popup {
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.medium};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadow};
  }

  .gestor-date-picker-popup .rc-picker-range-arrow {
    display: none;
  }

  .gestor-date-picker-popup .rc-picker-panel-container {
    border: 0;
    background: transparent;
  }

  .gestor-date-picker-popup .rc-picker-panels {
    gap: 12px;
  }

  .gestor-date-picker-popup .rc-picker-panel {
    width: 260px;
    padding: 8px 10px 10px;
    border: 0;
    background: ${({ theme }) => theme.colors.surface};
  }

  .gestor-date-picker-popup .rc-picker-header {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 40px;
    padding: 0 0 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  .gestor-date-picker-popup .rc-picker-header > button {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 0;
    border-radius: ${({ theme }) => theme.radius.small};
    color: ${({ theme }) => theme.colors.inkSoft};
    background: transparent;
    transition: color 140ms ease, background-color 140ms ease;
  }

  .gestor-date-picker-popup .rc-picker-header > button:hover {
    color: ${({ theme }) => theme.colors.ink};
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }

  .gestor-date-picker-popup .rc-picker-header-view {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 0;
  }

  .gestor-date-picker-popup .rc-picker-header-view > button {
    padding: 4px 5px;
    border: 0;
    border-radius: ${({ theme }) => theme.radius.small};
    color: ${({ theme }) => theme.colors.ink};
    background: transparent;
    font-family: inherit;
    font-size: 0.88rem;
    font-weight: 650;
    transition: background-color 140ms ease;
  }

  .gestor-date-picker-popup .rc-picker-header-view > button:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }

  .gestor-date-picker-popup .rc-picker-content th {
    height: 30px;
    color: ${({ theme }) => theme.colors.inkSoft};
    font-size: 0.68rem;
    font-weight: 650;
    text-transform: uppercase;
  }

  .gestor-date-picker-popup .rc-picker-content td {
    height: 34px;
    padding: 1px 0;
  }

  .gestor-date-picker-popup .rc-picker-cell-in-view {
    color: ${({ theme }) => theme.colors.ink};
  }

  .gestor-date-picker-popup .rc-picker-cell-disabled {
    opacity: 0.32;
  }

  .gestor-date-picker-popup .rc-picker-date-panel .rc-picker-cell-inner {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: inherit;
    font-size: 0.82rem;
    line-height: 32px;
    transition: color 140ms ease, background-color 140ms ease;
  }

  .gestor-date-picker-popup .rc-picker-cell-inner:hover,
  .gestor-date-picker-popup .rc-picker-cell-hover > .rc-picker-cell-inner {
    color: ${({ theme }) => theme.colors.ink};
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }

  .gestor-date-picker-popup .rc-picker-cell-in-range > .rc-picker-cell-inner {
    border-radius: 0;
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }

  .gestor-date-picker-popup .rc-picker-cell-today > .rc-picker-cell-inner {
    border: 1px solid ${({ theme }) => theme.colors.gold};
    color: ${({ theme }) => theme.colors.ink};
  }

  .gestor-date-picker-popup .rc-picker-cell-range-hover-start::after,
  .gestor-date-picker-popup .rc-picker-cell-range-hover-end::after,
  .gestor-date-picker-popup .rc-picker-cell-range-hover::after {
    border-color: ${({ theme }) => theme.colors.border};
  }

  .gestor-date-picker-popup .rc-picker-cell-range-start > .rc-picker-cell-inner,
  .gestor-date-picker-popup .rc-picker-cell-range-end > .rc-picker-cell-inner,
  .gestor-date-picker-popup .rc-picker-cell-selected > .rc-picker-cell-inner {
    border-radius: 50%;
    color: ${({ theme }) => theme.colors.surface};
    background: ${({ theme }) => theme.colors.navy};
  }

  @media (max-width: 620px) {
    .rc-picker-dropdown.gestor-date-picker-popup {
      max-width: calc(100vw - 24px);
      max-height: calc(100vh - 120px);
      overflow-x: hidden;
      overflow-y: auto;
    }

    .gestor-date-picker-popup .rc-picker-panels {
      flex-direction: column;
      gap: 0;
    }
  }
`
