import { z } from 'zod'
import { requireActor, requireAdmin } from '../../_lib/auth'
import type { Environment } from '../../_lib/env'
import { getScopedDatabase } from '../../_lib/database'
import { apiError, json, readJson } from '../../_lib/http'

const userSchema = z.object({
  authUserId: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  name: z.string().trim().max(120).nullable().optional(),
  organizationId: z.string().uuid(),
})

export const onRequestGet: PagesFunction<Environment> = async ({ request, env }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const sql = getScopedDatabase(env, actor.id)
    const organizationId = new URL(request.url).searchParams.get('organizationId')
    if (!organizationId) return json({ error: 'Informe a organização para consultar os acessos.' }, 400)

    const users = await sql`
      SELECT auth_user_id AS "authUserId", email, display_name AS name, role, active
      FROM app_users
      WHERE organization_id = ${organizationId}
      ORDER BY email
    `

    return json(users)
  } catch (error) {
    return apiError(error)
  }
}

export const onRequestPost: PagesFunction<Environment> = async ({ request, env }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const parsed = userSchema.safeParse(await readJson(request))
    if (!parsed.success) {
      return json({ error: 'Informe o usuário existente no Neon Auth, o e-mail e a organização.' }, 400)
    }

    const sql = getScopedDatabase(env, actor.id)
    const [user] = await sql`
      WITH linked AS (
        INSERT INTO app_users (auth_user_id, email, display_name, role, organization_id)
        SELECT ${parsed.data.authUserId}, ${parsed.data.email}, ${parsed.data.name ?? null}, 'client', id
        FROM organizations
        WHERE id = ${parsed.data.organizationId} AND active = true
        RETURNING auth_user_id AS "authUserId", email, display_name AS name, role, organization_id AS "organizationId"
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, linked."organizationId", 'client.access_granted', 'app_user', linked."authUserId"
        FROM linked
        RETURNING id
      )
      SELECT linked.* FROM linked CROSS JOIN audited
    `

    if (!user) {
      return json({ error: 'Organização ativa não encontrada.' }, 404)
    }

    return json(user, 201)
  } catch (error) {
    return apiError(error)
  }
}
