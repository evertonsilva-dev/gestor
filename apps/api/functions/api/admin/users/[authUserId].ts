import { z } from 'zod'
import { requireActor, requireAdmin } from '../../../_lib/auth'
import type { Environment } from '../../../_lib/env'
import { getScopedDatabase } from '../../../_lib/database'
import { apiError, json, readJson } from '../../../_lib/http'

const updateSchema = z.object({ active: z.boolean() })

export const onRequestPatch: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const parsed = updateSchema.safeParse(await readJson(request))
    if (!parsed.success) return json({ error: 'Informe a situação válida do acesso.' }, 400)

    const sql = getScopedDatabase(env, actor.id)
    const [user] = await sql`
      WITH updated AS (
        UPDATE app_users
        SET active = ${parsed.data.active}
        WHERE auth_user_id = ${params.authUserId} AND role = 'client'
        RETURNING auth_user_id AS "authUserId", organization_id AS "organizationId", active
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, "organizationId", 'client.access_updated', 'app_user', "authUserId"
        FROM updated
        RETURNING id
      )
      SELECT updated.* FROM updated CROSS JOIN audited
    `

    if (!user) return json({ error: 'Acesso de cliente não encontrado.' }, 404)
    return json(user)
  } catch (error) {
    return apiError(error)
  }
}
