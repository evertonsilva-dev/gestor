import { Activity, Building2, FileBarChart2, LogOut, Radio, ShieldCheck } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '../button'
import { Notice } from '../notice'
import type { AppShellProps } from './types'
import { Account, AccountName, Brand, Frame, Header, Main, Navigation, Sidebar } from './styles'

export function AppShell({ children }: AppShellProps) {
  const { profile, signOut, authError } = useAuth()
  const isAdmin = profile?.role === 'admin'

  return (
    <Frame>
      <Sidebar>
        <Brand>
          <Activity size={26} />
          <div><strong>GESTOR</strong><span>INTELIGÊNCIA DE COMUNICAÇÃO</span></div>
        </Brand>
        <Navigation aria-label="Navegação principal">
          {isAdmin ? (
            <>
              <NavLink to="/admin" end><ShieldCheck size={18} /> Visão geral</NavLink>
              <NavLink to="/admin/organizations" end><Building2 size={18} /> Organizações</NavLink>
              <NavLink to="/admin/monitoring" end><Radio size={18} /> Monitoramento</NavLink>
            </>
          ) : (
            <NavLink to="/dashboard" end><FileBarChart2 size={18} /> Dashboard</NavLink>
          )}
        </Navigation>
        <Account>
          <AccountName>
            <strong>{profile?.name || profile?.email}</strong>
            <span>{isAdmin ? 'Administradora' : profile?.organizationName}</span>
          </AccountName>
          <Button variant="quiet" size="small" onClick={() => { void signOut().catch(() => undefined) }}>
            <LogOut size={15} /> Sair
          </Button>
        </Account>
      </Sidebar>
      <Main>
        {authError && <Notice tone="error">{authError}</Notice>}
        <Header>
          <div>
            <h1>{isAdmin ? 'Painel administrativo' : profile?.organizationName || 'Monitoramento'}</h1>
            <p>Monitoramento diário de inteligência de comunicação</p>
          </div>
        </Header>
        {children}
      </Main>
    </Frame>
  )
}
