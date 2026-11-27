import { ArrowRight, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/Button'
import { FormField } from '@/components/FormField'
import { Notice } from '@/components/Notice'
import { useLoginPage } from '@/hooks/useLoginPage'
import { LoginModeLink, RecoveryLink } from '@/pages/LoginPage/styles'
import type { LoginPageProps } from '@/pages/LoginPage/types'
import { Footnote, Form, FormBrand, Logo, Page, Panel, Welcome, WelcomeCopy } from '@/pages/LoginPage/styles'

export function LoginPage({ initialError }: LoginPageProps) {
  const { error, submitting, handleSubmit } = useLoginPage(initialError)

  return (
    <Page>
      <Welcome>
        <Logo><img src="/branding/arquea-horizontal-branco.svg" alt="Arquea Tecnologia" /></Logo>
        <WelcomeCopy>
          <h1>Inteligência para <span>decidir melhor.</span></h1>
          <p>Dados organizados, contexto e recomendações para acompanhar a comunicação com clareza.</p>
        </WelcomeCopy>
        <Footnote>PLATAFORMA DE MONITORAMENTO</Footnote>
      </Welcome>
      <Panel>
        <Form onSubmit={(event) => void handleSubmit(event)}>
          <FormBrand src="/branding/arquea-horizontal-cor.svg" alt="Arquea Tecnologia" />
          <LockKeyhole size={22} />
          <h2>Acesse sua conta</h2>
          <p>Entre para consultar o ambiente da sua organização.</p>
          {import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === 'true' && (
            <Notice tone="success">
              Demonstração local habilitada. Use as credenciais de teste descritas no README.
            </Notice>
          )}
          {error && <Notice tone="error">{error}</Notice>}
          <FormField label="E-mail" name="email" type="email" autoComplete="username" required />
          <FormField label="Senha" name="password" type="password" autoComplete="current-password" required />
          <RecoveryLink to="/reset-password">Esqueceu a senha?</RecoveryLink>
          <LoginModeLink to="/client-login">Acessar com chave de cliente</LoginModeLink>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'} <ArrowRight size={17} />
          </Button>
        </Form>
      </Panel>
    </Page>
  )
}
