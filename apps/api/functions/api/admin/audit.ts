import { requireActor, requireAdmin } from '../../_lib/auth'
import type { Environment } from '../../_lib/env'
import { getScopedDatabase } from '../../_lib/database'
import { apiError, json } from '../../_lib/http'

export const onRequestGet: PagesFunction<Environment> = async ({ request, env }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const organizationId = new URL(request.url).searchParams.get('organizationId')
    const sql = getScopedDatabase(env, actor.id)
    const events = organizationId
      ? await sql`
          SELECT
            id,
            organization_id AS "organizationId",
            action,
            entity_type AS "entityType",
            entity_id AS "entityId",
            metadata,
            created_at AS "createdAt"
          FROM audit_events
          WHERE organization_id = ${organizationId}
          ORDER BY created_at DESC
          LIMIT 100
        `
      : await sql`
          SELECT
            id,
            organization_id AS "organizationId",
            action,
            entity_type AS "entityType",
            entity_id AS "entityId",
            metadata,
            created_at AS "createdAt"
          FROM audit_events
          ORDER BY created_at DESC
          LIMIT 100
        `

    return json(events)
  } catch (error) {
    return apiError(error)
  }
}
