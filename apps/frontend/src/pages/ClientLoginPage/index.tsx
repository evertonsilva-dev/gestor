import { ArrowRight, KeyRound } from 'lucide-react'
import { Button } from '@/components/Button'
import { FormField } from '@/components/FormField'
import { Notice } from '@/components/Notice'
import { useClientLoginPage } from '@/hooks/useClientLoginPage'
import {
  Footnote,
  Form,
  FormBrand,
  LoginModeLink,
  Logo,
  Page,
  Panel,
  Welcome,
  WelcomeCopy,
} from '@/pages/LoginPage/styles'

export function ClientLoginPage() {
  const { error, submitting, handleSubmit } = useClientLoginPage()

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
