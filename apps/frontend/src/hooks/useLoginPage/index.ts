import { useState, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function useLoginPage(initialError?: string | null) {
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

  return {
    error: error || authError || initialError || null,
    submitting,
    handleSubmit,
  }
}
