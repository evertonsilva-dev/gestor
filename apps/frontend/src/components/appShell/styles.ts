import styled from 'styled-components'

export const Frame = styled.div`
  height: 100vh;
  height: 100dvh;
  display: grid;
  grid-template-columns: 252px minmax(0, 1fr);
  overflow: hidden;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr);
  }
`

export const Sidebar = styled.aside<{ $isOpen: boolean }>`
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
  color: ${({ theme }) => theme.colors.onDark};
  background: ${({ theme }) => theme.colors.navy};
  border-right: 1px solid ${({ theme }) => theme.colors.borderOnDark};

  @media (max-width: 860px) {
    position: fixed;
    z-index: 21;
    inset: 0 auto 0 0;
    width: min(300px, calc(100vw - 48px));
    height: 100vh;
    height: 100dvh;
    gap: 24px;
    padding: 18px 16px;
    border-right: 0;
    box-shadow: ${({ theme, $isOpen }) => $isOpen ? theme.shadows.drawer : 'none'};
    transform: translateX(${({ $isOpen }) => $isOpen ? '0' : '-105%'});
    visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
    transition: transform 200ms ease, visibility 200ms ease;
  }
`

export const Overlay = styled.button`
  position: fixed;
  z-index: 20;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: ${({ theme }) => theme.colors.overlay};
  cursor: pointer;
`

export const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export const Brand = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;

  img { display: block; width: min(100%, 204px); height: auto; object-fit: contain; }
`

export const CloseMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex: none;
  border: 1px solid ${({ theme }) => theme.colors.borderOnDarkStrong};
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme }) => theme.colors.onDark};
  background: transparent;

  @media (max-width: 860px) { display: inline-flex; }
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
    color: ${({ theme }) => theme.colors.onDarkMuted};
    font-size: 0.88rem;
    font-weight: 550;
    transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
    &:hover {
      color: ${({ theme }) => theme.colors.onDark};
      background: ${({ theme }) => theme.colors.navyLight};
    }
    &.active {
      color: ${({ theme }) => theme.colors.onDark};
      background: ${({ theme }) => `linear-gradient(100deg, ${theme.colors.accentOnDark}, ${theme.colors.navyLight} 78%)`};
      border-color: ${({ theme }) => theme.colors.accentBorderOnDark};
      box-shadow: inset 3px 0 ${({ theme }) => theme.colors.gold};
    }
    &:focus-visible {
      outline: 3px solid ${({ theme }) => theme.colors.blue};
      outline-offset: 2px;
    }
  }

  @media (max-width: 860px) {
    display: grid;
    overflow: visible;
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
  border-top: 1px solid ${({ theme }) => theme.colors.borderOnDark};

`

export const AccountName = styled.div`
  overflow: hidden;
  strong, span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  strong { font-size: 0.85rem; }
  span { margin-top: 4px; color: ${({ theme }) => theme.colors.onDarkSoft}; font-size: 0.75rem; }
`

export const Main = styled.main`
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  padding: clamp(18px, 3vw, 40px);

  @media (max-width: 860px) {
    height: 100%;
    padding: 18px 16px 28px;
  }
`

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;

  > div { min-width: 0; }
  h1 { margin: 0; font-size: clamp(1.45rem, 3vw, 2rem); letter-spacing: -0.035em; overflow-wrap: anywhere; }
  p { margin: 6px 0 0; color: ${({ theme }) => theme.colors.inkSoft}; font-size: 0.9rem; line-height: 1.5; overflow-wrap: anywhere; }

  @media (max-width: 860px) {
    gap: 12px;
    margin-bottom: 20px;
  }
`

export const MenuButton = styled.button`
  display: none;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-top: 1px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme }) => theme.colors.ink};
  background: ${({ theme }) => theme.colors.surface};

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.blue};
    outline-offset: 2px;
  }

  @media (max-width: 860px) { display: inline-flex; }
`
