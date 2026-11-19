import { requireActor, requireAdmin } from '../../../../../_lib/auth'
import type { Environment } from '../../../../../_lib/env'
import { getScopedDatabase } from '../../../../../_lib/database'
import { apiError, json } from '../../../../../_lib/http'

export const onRequestDelete: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const sql = getScopedDatabase(env, actor.id)
    const [key] = await sql`
      WITH revoked AS (
        UPDATE client_access_keys
        SET revoked_at = now()
        WHERE id = ${params.accessKeyId}
          AND organization_id = ${params.organizationId}
          AND revoked_at IS NULL
        RETURNING id, organization_id AS "organizationId"
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, "organizationId", 'client.access_key_revoked',
          'client_access_key', id::text
        FROM revoked
        RETURNING id
      )
      SELECT revoked.* FROM revoked CROSS JOIN audited
    `

    if (!key) {
      return json({ error: 'Chave ativa não encontrada.' }, 404)
    }

    return json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
