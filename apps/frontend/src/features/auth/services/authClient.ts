import { createInternalNeonAuth } from '@neon/auth'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL

const authClient = authUrl ? createInternalNeonAuth(authUrl) : null
export const authConfigurationError = 'Defina VITE_NEON_AUTH_URL no arquivo .env.local e reinicie o Vite.'

async function sendPasswordResetRequest(path: string, payload: Record<string, string>) {
  if (!authUrl) {
    throw new Error(authConfigurationError)
  }

  const response = await fetch(`${authUrl.replace(/\/$/, '')}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const result: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      typeof result === 'object' &&
      result !== null &&
      'message' in result &&
      typeof result.message === 'string'
        ? result.message
        : `Não foi possível concluir a solicitação (${response.status}).`

    throw new Error(message)
  }
}

export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  await sendPasswordResetRequest('request-password-reset', { email, redirectTo })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await sendPasswordResetRequest('reset-password', { token, newPassword })
}

export function getAuthClient() {
  if (!authClient) {
    throw new Error(authConfigurationError)
  }

  return authClient.adapter
}

export async function getAuthToken(): Promise<string | null> {
  if (!authClient) {
    throw new Error(authConfigurationError)
  }

  return authClient.getJWTToken()
}

export function hasAuthConfiguration(): boolean {
  return authClient !== null
}
