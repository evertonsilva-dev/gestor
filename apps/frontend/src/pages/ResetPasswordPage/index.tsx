import { ArrowLeft, KeyRound } from 'lucide-react'
import { Button } from '@/components/Button'
import { FormField } from '@/components/FormField'
import { Notice } from '@/components/Notice'
import { useResetPasswordPage } from '@/hooks/useResetPasswordPage'
import { Footnote, Form, FormBrand, Logo, Page, Panel, RecoveryLink, Welcome, WelcomeCopy } from '@/pages/LoginPage/styles'

export function ResetPasswordPage() {
  const { token, email, setEmail, error, success, submitting, handleSubmit } = useResetPasswordPage()

  return (
    <Page>
      <Welcome>
        <Logo><img src="/branding/arquea-horizontal-branco.svg" alt="Arquea Tecnologia" /></Logo>
        <WelcomeCopy>
          <h1>Recupere o <span>acesso.</span></h1>
          <p>Enviaremos um link seguro para redefinir a senha da sua conta.</p>
        </WelcomeCopy>
        <Footnote>PLATAFORMA DE MONITORAMENTO</Footnote>
      </Welcome>
      <Panel>
        <Form onSubmit={(event) => void handleSubmit(event)}>
          <FormBrand src="/branding/arquea-horizontal-cor.svg" alt="Arquea Tecnologia" />
          <KeyRound size={22} />
          <h2>{token ? 'Defina uma nova senha' : 'Recuperar senha'}</h2>
          <p>
            {token
              ? 'Escolha uma senha forte com pelo menos 12 caracteres.'
              : 'Informe o e-mail associado à sua conta para receber o link.'}
          </p>
          {error && <Notice tone="error">{error}</Notice>}
          {success && <Notice tone="success">{success}</Notice>}
          {token ? (
            <>
              <FormField
                label="Nova senha"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
              <FormField
                label="Confirme a nova senha"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </>
          ) : (
            <FormField
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
            />
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Enviando...' : token ? 'Redefinir senha' : 'Enviar link de recuperação'}
          </Button>
          <RecoveryLink to="/login">
            <ArrowLeft size={15} /> Voltar para o login
          </RecoveryLink>
        </Form>
      </Panel>
    </Page>
  )
}
