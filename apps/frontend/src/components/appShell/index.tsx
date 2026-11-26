import { Building2, FileBarChart2, LogOut, Menu, Radio, ShieldCheck, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '../button'
import { Notice } from '../notice'
import type { AppShellProps } from './types'
import { useMobileNavigation } from './useMobileNavigation'
import {
  Account,
  AccountName,
  Brand,
  CloseMenuButton,
  DrawerHeader,
  Frame,
  Header,
  Main,
  MenuButton,
  Navigation,
  Overlay,
  Sidebar,
} from './styles'

export function AppShell({ children }: AppShellProps) {
  const { profile, signOut, authError } = useAuth()
  const mobileNavigation = useMobileNavigation()
  const isAdmin = profile?.role === 'admin'

  return (
    <Frame>
      {mobileNavigation.isOpen && (
        <Overlay
          type="button"
          aria-label="Fechar menu de navegação"
          onClick={mobileNavigation.close}
        />
      )}
      <Sidebar $isOpen={mobileNavigation.isOpen}>
        <DrawerHeader>
          <Brand>
            <img src="/branding/arquea-tecnologia-branco.svg" alt="Arquea Tecnologia" />
          </Brand>
          <CloseMenuButton
            type="button"
            aria-label="Fechar menu"
            onClick={mobileNavigation.close}
          >
            <X size={20} />
          </CloseMenuButton>
        </DrawerHeader>
        <Navigation id="primary-navigation" aria-label="Navegação principal">
          {isAdmin ? (
            <>
              <NavLink to="/admin" end onClick={mobileNavigation.close}><ShieldCheck size={18} /> Visão geral</NavLink>
              <NavLink to="/admin/organizations" end onClick={mobileNavigation.close}><Building2 size={18} /> Organizações</NavLink>
              <NavLink to="/admin/monitoring" end onClick={mobileNavigation.close}><Radio size={18} /> Monitoramento</NavLink>
            </>
          ) : (
            <NavLink to="/dashboard" end onClick={mobileNavigation.close}><FileBarChart2 size={18} /> Dashboard</NavLink>
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
          <MenuButton
            type="button"
            aria-label={mobileNavigation.isOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-controls="primary-navigation"
            aria-expanded={mobileNavigation.isOpen}
            onClick={mobileNavigation.toggle}
          >
            <Menu size={19} />
          </MenuButton>
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
