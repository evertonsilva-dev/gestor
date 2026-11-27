import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { requestPasswordReset, resetPassword } from '@/services/auth/authClient'

export function useResetPasswordPage() {
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

  return {
    token,
    email,
    setEmail,
    error,
    success,
    submitting,
    handleSubmit,
  }
}
