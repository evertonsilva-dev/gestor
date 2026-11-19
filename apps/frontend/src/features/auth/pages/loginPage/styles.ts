import styled from 'styled-components'
import { AppLink } from '@/components/appLink'

export const Page = styled.main`
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.9fr);
  background: ${({ theme }) => theme.colors.navy};

  @media (max-width: 760px) { grid-template-columns: 1fr; }
`

export const Welcome = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  padding: clamp(30px, 6vw, 76px);
  color: #fff;
  background:
    radial-gradient(ellipse at 70% 45%, rgba(232, 185, 20, 0.12), transparent 40%),
    linear-gradient(135deg, #101722, #141f2d);

  @media (max-width: 760px) { display: none; }
`

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.colors.gold};
  font-weight: 800;
  letter-spacing: 0.2em;
`

export const WelcomeCopy = styled.div`
  max-width: 520px;
  h1 { margin: 0; font-size: clamp(2.5rem, 5vw, 4.5rem); line-height: 1.02; letter-spacing: -0.06em; }
  p { max-width: 400px; color: #bdc6d1; font-size: 1.03rem; line-height: 1.7; }
  span { color: ${({ theme }) => theme.colors.gold}; }
`

export const Footnote = styled.span`
  color: #8490a0;
  font-size: 0.76rem;
`

export const Panel = styled.section`
  display: grid;
  place-items: center;
  padding: 28px;
  background: ${({ theme }) => theme.colors.background};
`

export const Form = styled.form`
  display: grid;
  gap: 18px;
  width: min(100%, 410px);
  padding: clamp(24px, 4vw, 38px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow};

  h2 { margin: 0; font-size: 1.55rem; }
  p { margin: -10px 0 2px; color: ${({ theme }) => theme.colors.inkSoft}; font-size: 0.9rem; line-height: 1.5; }
`

export const RecoveryLink = styled(AppLink)`
  justify-self: start;
  margin-top: -10px;
  font-size: 0.88rem;
`

export const LoginModeLink = styled(AppLink)`
  justify-self: center;
  font-size: 0.88rem;
`
