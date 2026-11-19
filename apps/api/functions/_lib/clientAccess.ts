import { getClientAuthDatabase, getScopedDatabase } from './database'
import type { Actor, Environment } from './env'

export const clientSessionCookieName = 'gestor_client_session'
export const clientSessionDurationSeconds = 12 * 60 * 60

const clientKeyPrefix = 'gestor_client_'
const clientSessionPrefix = 'gestor_session_'

function randomHex(bytesLength: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(bytesLength))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function generateClientAccessKey(): string {
  return `${clientKeyPrefix}${randomHex(32)}`
}

function generateClientSessionToken(): string {
  return `${clientSessionPrefix}${randomHex(32)}`
}

export async function hashClientSecret(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function readClientSessionToken(request: Request): string | null {
  const cookies = request.headers.get('Cookie')
  if (!cookies) return null

  const prefix = `${clientSessionCookieName}=`
  const cookie = cookies.split(';').map((value) => value.trim()).find((value) => value.startsWith(prefix))

  return cookie?.slice(prefix.length) || null
}

function sessionCookie(value: string, request: Request, maxAge: number): string {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''

  return `${clientSessionCookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
}

export function createClientSessionCookie(token: string, request: Request): string {
  return sessionCookie(token, request, clientSessionDurationSeconds)
}

export function expireClientSessionCookie(request: Request): string {
  return sessionCookie('', request, 0)
}

async function getClientActor(
  keyId: string,
  label: string,
  organizationId: string,
  env: Environment,
): Promise<Actor | null> {
  const sql = getScopedDatabase(env, `client:${keyId}`)
  const [organization] = await sql`
    SELECT id, name
    FROM organizations
    WHERE id = ${organizationId} AND active = true
    LIMIT 1
  `

  if (!organization) return null

  return {
    id: `client:${keyId}`,
    role: 'client',
    organizationId: organization.id,
    organizationName: organization.name,
    email: '',
    name: label,
  }
}

export async function createClientAccessSession(
  accessKey: string,
  env: Environment,
): Promise<{ actor: Actor; token: string } | null> {
  const keyHash = await hashClientSecret(accessKey)
  const authSql = getClientAuthDatabase(env)
  const [key] = await authSql`
    SELECT id, organization_id AS "organizationId", label
    FROM client_access_keys
    WHERE key_hash = ${keyHash} AND revoked_at IS NULL
    LIMIT 1
  `

  if (!key) return null

  const actor = await getClientActor(key.id, key.label, key.organizationId, env)
  if (!actor) return null

  const token = generateClientSessionToken()
  const tokenHash = await hashClientSecret(token)
  const expiresAt = new Date(Date.now() + clientSessionDurationSeconds * 1000).toISOString()

  await authSql`
    INSERT INTO client_access_sessions (access_key_id, session_token_hash, expires_at)
    VALUES (${key.id}, ${tokenHash}, ${expiresAt})
  `

  return { actor, token }
}

export async function getClientSessionActor(request: Request, env: Environment): Promise<Actor | null> {
  const token = readClientSessionToken(request)
  if (!token) return null

  const tokenHash = await hashClientSecret(token)
  const authSql = getClientAuthDatabase(env)
  const [session] = await authSql`
    SELECT k.id AS "keyId", k.label, k.organization_id AS "organizationId"
    FROM client_access_sessions s
    JOIN client_access_keys k ON k.id = s.access_key_id
    WHERE s.session_token_hash = ${tokenHash}
      AND s.expires_at > now()
      AND k.revoked_at IS NULL
    LIMIT 1
  `

  if (!session) return null

  return getClientActor(session.keyId, session.label, session.organizationId, env)
}

export async function revokeClientSession(request: Request, env: Environment): Promise<void> {
  const token = readClientSessionToken(request)
  if (!token) return

  const tokenHash = await hashClientSecret(token)
  const sql = getClientAuthDatabase(env)
  await sql`DELETE FROM client_access_sessions WHERE session_token_hash = ${tokenHash}`
}
