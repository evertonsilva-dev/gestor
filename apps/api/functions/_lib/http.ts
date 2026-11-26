import { errors as joseErrors } from 'jose'

export class ConfigurationError extends Error {}
export class ServiceUnavailableError extends Error {}

export function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  const responseHeaders = new Headers(headers)
  responseHeaders.set('Cache-Control', 'no-store')

  return Response.json(data, {
    status,
    headers: responseHeaders,
  })
}

export function apiError(error: unknown): Response {
  console.error('API request failed', error)

  if (error instanceof ConfigurationError || error instanceof ServiceUnavailableError) {
    return json({ error: error.message }, 503)
  }

  return json({ error: 'Ocorreu um erro interno ao processar a solicitação.' }, 500)
}

export function isInvalidTokenError(error: unknown): boolean {
  return error instanceof joseErrors.JOSEError || error instanceof TypeError
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return await request.json() as T
  } catch {
    throw new Error('O corpo da solicitação não contém JSON válido.')
  }
}
