export interface Environment {
  DATABASE_URL?: string
  NEON_AUTH_JWKS_URL?: string
  AI: Ai
}

export interface Actor {
  id: string
  role: 'admin' | 'client'
  organizationId: string | null
  organizationName: string | null
  email: string
  name: string | null
}
