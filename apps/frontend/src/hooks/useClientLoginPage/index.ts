import { useState, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function useClientLoginPage() {
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

  return { error, submitting, handleSubmit }
}
