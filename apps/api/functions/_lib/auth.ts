import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import { getClientSessionActor } from './clientAccess'
import { getScopedDatabase } from './database'
import type { Actor, Environment } from './env'
import { ConfigurationError, isInvalidTokenError, json } from './http'

const jwksByUrl = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

function getJwks(url: string) {
  let jwks = jwksByUrl.get(url)

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url))
    jwksByUrl.set(url, jwks)
  }

  return jwks
}

function bearerToken(request: Request): string | null {
  const [scheme, token] = (request.headers.get('Authorization') ?? '').split(' ')

  return scheme?.toLowerCase() === 'bearer' && token ? token : null
}

export async function requireActor(
  request: Request,
  env: Environment,
): Promise<Actor | Response> {
  if (!env.DATABASE_URL) {
    throw new ConfigurationError('A API requer DATABASE_URL configurado.')
  }

  const token = bearerToken(request)

  if (!token) {
    const clientActor = await getClientSessionActor(request, env)

    return clientActor ?? json({ error: 'Autenticação necessária.' }, 401)
  }

  if (!env.NEON_AUTH_JWKS_URL) {
    throw new ConfigurationError('A API requer NEON_AUTH_JWKS_URL para autenticar administradores.')
  }

  let payload: JWTPayload

  try {
    const verified = await jwtVerify(token, getJwks(env.NEON_AUTH_JWKS_URL), {
      algorithms: ['EdDSA'],
    })
    payload = verified.payload
  } catch (error) {
    if (isInvalidTokenError(error)) {
      return json({ error: 'Sessão inválida ou expirada.' }, 401)
    }

    throw error
  }

  if (typeof payload.sub !== 'string') {
    return json({ error: 'Token sem identificador de usuário.' }, 401)
  }

  const sql = getScopedDatabase(env, payload.sub)
  const [user] = await sql`
    SELECT
      u.auth_user_id AS id,
      u.role,
      u.organization_id AS "organizationId",
      o.name AS "organizationName",
      u.email,
      u.display_name AS name
    FROM app_users u
    LEFT JOIN organizations o ON o.id = u.organization_id
    WHERE u.auth_user_id = ${payload.sub}
      AND u.active = true
      AND (o.id IS NULL OR o.active = true)
    LIMIT 1
  `

  if (!user) {
    return json({ error: 'Este usuário não possui acesso ativo à plataforma.' }, 403)
  }

  if (user.role !== 'admin') {
    return json({ error: 'Clientes devem entrar usando uma chave de acesso.' }, 403)
  }

  return {
    id: user.id,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: user.organizationName,
    email: user.email,
    name: user.name,
  }
}

export function requireAdmin(actor: Actor): Response | null {
  return actor.role === 'admin'
    ? null
    : json({ error: 'Esta operação exige perfil administrativo.' }, 403)
}

export function requireClientOrganization(actor: Actor): string | Response {
  if (actor.role !== 'client' || !actor.organizationId) {
    return json({ error: 'Este usuário não está vinculado a uma organização cliente.' }, 403)
  }

  return actor.organizationId
}
