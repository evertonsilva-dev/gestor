import { useState, type FormEvent } from 'react'
import { Activity, ArrowRight, KeyRound } from 'lucide-react'
import { Button } from '@/components/button'
import { FormField } from '@/components/formField'
import { Notice } from '@/components/notice'
import { useAuth } from '@/hooks/useAuth'
import {
  Footnote,
  Form,
  LoginModeLink,
  Logo,
  Page,
  Panel,
  Welcome,
  WelcomeCopy,
} from '../loginPage/styles'

export function ClientLoginPage() {
  const { signInWithKey } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    const formData = new FormData(event.currentTarget)

    try {
      await signInWithKey(String(formData.get('accessKey')))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível validar a chave.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Page>
      <Welcome>
        <Logo><Activity size={26} /> GESTOR</Logo>
        <WelcomeCopy>
          <h1>Inteligência para <span>decidir melhor.</span></h1>
          <p>Dados organizados, contexto e recomendações para acompanhar a comunicação com clareza.</p>
        </WelcomeCopy>
        <Footnote>PLATAFORMA DE MONITORAMENTO</Footnote>
      </Welcome>
      <Panel>
        <Form onSubmit={(event) => void handleSubmit(event)}>
          <KeyRound size={22} />
          <h2>Acesso do cliente</h2>
          <p>Informe a chave de acesso recebida do administrador da plataforma.</p>
          {error && <Notice tone="error">{error}</Notice>}
          <FormField label="Chave de acesso" name="accessKey" type="password" autoComplete="off" required />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Validando...' : 'Entrar'} <ArrowRight size={17} />
          </Button>
          <LoginModeLink to="/login">Entrar como administrador</LoginModeLink>
        </Form>
      </Panel>
    </Page>
  )
}
