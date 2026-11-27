import { useEffect, useId, useRef, useState } from 'react'
import { useTheme } from 'styled-components'

interface UseFormFieldOptions {
  id?: string
  as?: 'input' | 'select' | 'textarea'
}

export function useFormField({ id, as }: UseFormFieldOptions) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const fieldRef = useRef<HTMLDivElement>(null)
  const [resetKey, setResetKey] = useState(0)
  const theme = useTheme()

  useEffect(() => {
    if (as !== 'select') return

    const form = fieldRef.current?.closest('form')
    if (!form) return

    function resetSelect() {
      setResetKey((current) => current + 1)
    }

    form.addEventListener('reset', resetSelect)
    return () => form.removeEventListener('reset', resetSelect)
  }, [as])

  return { controlId, fieldRef, resetKey, theme }
}
