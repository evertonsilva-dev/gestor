import { useState, type FormEvent } from 'react'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/button'
import { FormField } from '@/components/formField'
import { Notice } from '@/components/notice'
import { useAuth } from '@/hooks/useAuth'
import { LoginModeLink, RecoveryLink } from './styles'
import type { LoginPageProps } from './types'
import { Footnote, Form, FormBrand, Logo, Page, Panel, Welcome, WelcomeCopy } from './styles'

export function LoginPage({ initialError }: LoginPageProps) {
  const { signIn, authError } = useAuth()
  const [error, setError] = useState(initialError ?? null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    const formData = new FormData(event.currentTarget)

    try {
      await signIn(String(formData.get('email')), String(formData.get('password')))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível iniciar a sessão.')
    } finally {
      setSubmitting(false)
    }
  }

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
          {(error || authError || initialError) && (
            <Notice tone="error">{error || authError || initialError || 'Não foi possível iniciar a sessão.'}</Notice>
          )}
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
