import styled from 'styled-components'

export const Frame = styled.div`
  height: 100vh;
  height: 100dvh;
  display: grid;
  grid-template-columns: 252px minmax(0, 1fr);
  overflow: hidden;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }
`

export const Sidebar = styled.aside`
  position: sticky;
  top: 0;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 28px;
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  padding: 24px 16px;
  color: #f7f8fa;
  background: ${({ theme }) => theme.colors.navy};
  border-right: 1px solid #273447;

  @media (max-width: 860px) {
    z-index: 1;
    height: auto;
    min-height: auto;
    gap: 16px;
    padding: 14px 16px;
    border-right: 0;
    border-bottom: 1px solid #273447;
  }
`

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 4px 8px;

  svg { color: ${({ theme }) => theme.colors.gold}; }
  strong { display: block; letter-spacing: 0.16em; font-size: 0.95rem; }
  span { display: block; margin-top: 3px; color: #aab4c2; font-size: 0.65rem; letter-spacing: 0.14em; }
`

export const Navigation = styled.nav`
  display: grid;
  gap: 6px;

  a {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid transparent;
    border-radius: ${({ theme }) => theme.radius.medium};
    color: #bdc6d1;
    font-size: 0.88rem;
    font-weight: 550;
    transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
    &:hover {
      color: #fff;
      background: ${({ theme }) => theme.colors.navyLight};
    }
    &.active {
      color: #fff;
      background: linear-gradient(100deg, rgba(232, 185, 20, 0.16), rgba(27, 38, 53, 0.92) 78%);
      border-color: rgba(232, 185, 20, 0.18);
      box-shadow: inset 3px 0 ${({ theme }) => theme.colors.gold};
    }
    &:focus-visible {
      outline: 3px solid ${({ theme }) => theme.colors.blue};
      outline-offset: 2px;
    }
  }

  @media (max-width: 860px) {
    display: flex;
    overflow-x: auto;

    a { flex-shrink: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    a { transition: none; }
  }
`

export const Account = styled.div`
  display: grid;
  gap: 12px;
  margin-top: auto;
  padding: 14px 9px 0;
  border-top: 1px solid #2e3b4c;

  @media (max-width: 860px) { display: none; }
`

export const AccountName = styled.div`
  overflow: hidden;
  strong, span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  strong { font-size: 0.85rem; }
  span { margin-top: 4px; color: #aab4c2; font-size: 0.75rem; }
`

export const Main = styled.main`
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  padding: clamp(18px, 3vw, 40px);

  @media (max-width: 860px) {
    height: auto;
  }
`

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;

  h1 { margin: 0; font-size: clamp(1.45rem, 3vw, 2rem); letter-spacing: -0.035em; }
  p { margin: 6px 0 0; color: ${({ theme }) => theme.colors.inkSoft}; font-size: 0.9rem; }
`
