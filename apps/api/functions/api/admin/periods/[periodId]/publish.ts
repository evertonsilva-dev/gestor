import { requireActor, requireAdmin } from '../../../../_lib/auth'
import type { Environment } from '../../../../_lib/env'
import { getScopedDatabase } from '../../../../_lib/database'
import { apiError, json } from '../../../../_lib/http'

export const onRequestPost: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const sql = getScopedDatabase(env, actor.id)
    const [period] = await sql`
      WITH published AS (
        UPDATE monitoring_periods
        SET status = 'published', published_at = now()
        WHERE id = ${params.periodId} AND status = 'processing'
        RETURNING id, organization_id AS "organizationId", published_at AS "publishedAt"
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, "organizationId", 'period.published', 'monitoring_period', id::text
        FROM published
        RETURNING id
      )
      SELECT published.* FROM published CROSS JOIN audited
    `

    if (!period) return json({ error: 'O período não existe ou já foi publicado.' }, 409)
    return json(period)
  } catch (error) {
    return apiError(error)
  }
}
