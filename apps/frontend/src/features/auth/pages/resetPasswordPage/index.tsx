import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { Button } from '@/components/button'
import { FormField } from '@/components/formField'
import { Notice } from '@/components/notice'
import { requestPasswordReset, resetPassword } from '@/features/auth/services/authClient'
import { Footnote, Form, FormBrand, Logo, Page, Panel, RecoveryLink, Welcome, WelcomeCopy } from '../loginPage/styles'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(
    searchParams.get('error') ? 'O link expirou ou não é válido. Solicite outro e-mail de recuperação.' : null,
  )
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    const formData = new FormData(event.currentTarget)

    try {
      if (token) {
        const password = String(formData.get('password'))
        const passwordConfirmation = String(formData.get('passwordConfirmation'))

        if (password !== passwordConfirmation) {
          throw new Error('As senhas não coincidem.')
        }

        await resetPassword(token, password)
        setSuccess('Senha redefinida. Você já pode entrar com a nova senha.')
      } else {
        await requestPasswordReset(email, `${window.location.origin}/reset-password`)
        setSuccess('Se o e-mail estiver cadastrado, enviaremos um link de recuperação.')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível concluir a solicitação.')
    } finally {
      setSubmitting(false)
    }
  }

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
