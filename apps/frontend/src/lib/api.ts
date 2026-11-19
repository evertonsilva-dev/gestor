import { getAuthToken, hasAuthConfiguration } from '@/features/auth/services/authClient'

interface ApiErrorBody {
  error?: string
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === 'true') {
    const { mockApiRequest } = await import('./mockApi')
    return mockApiRequest<T>(path)
  }

  const headers = new Headers(options.headers)

  if (hasAuthConfiguration()) {
    const token = await getAuthToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(path, { ...options, headers, credentials: 'include' })

  if (!response.ok) {
    const body = await response.json().catch((): ApiErrorBody => ({}))
    throw new ApiError(body.error ?? 'Não foi possível concluir a solicitação.', response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
