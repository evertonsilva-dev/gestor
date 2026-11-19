import { z } from 'zod'
import { requireActor, requireAdmin } from '../../_lib/auth'
import type { Environment } from '../../_lib/env'
import { getScopedDatabase } from '../../_lib/database'
import { apiError, json, readJson } from '../../_lib/http'

const periodSchema = z.object({
  organizationId: z.string().uuid(),
  startDate: z.string().date(),
  endDate: z.string().date(),
})

export const onRequestGet: PagesFunction<Environment> = async ({ request, env }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const organizationId = new URL(request.url).searchParams.get('organizationId')
    if (!organizationId) return json({ error: 'Informe a organização.' }, 400)

    const sql = getScopedDatabase(env, actor.id)
    const periods = await sql`
      SELECT
        id,
        organization_id AS "organizationId",
        to_char(start_date, 'YYYY-MM-DD') AS "startDate",
        to_char(end_date, 'YYYY-MM-DD') AS "endDate",
        status,
        created_at AS "createdAt",
        published_at AS "publishedAt"
      FROM monitoring_periods
      WHERE organization_id = ${organizationId}
      ORDER BY end_date DESC, created_at DESC
    `
    return json(periods)
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

    const parsed = periodSchema.safeParse(await readJson(request))
    if (!parsed.success || parsed.data.endDate < parsed.data.startDate) {
      return json({ error: 'Informe um intervalo de datas válido.' }, 400)
    }

    const sql = getScopedDatabase(env, actor.id)
    const [period] = await sql`
      WITH created AS (
        INSERT INTO monitoring_periods (organization_id, start_date, end_date, created_by)
        SELECT id, ${parsed.data.startDate}, ${parsed.data.endDate}, ${actor.id}
        FROM organizations
        WHERE id = ${parsed.data.organizationId} AND active = true
        RETURNING
          id,
          organization_id AS "organizationId",
          to_char(start_date, 'YYYY-MM-DD') AS "startDate",
          to_char(end_date, 'YYYY-MM-DD') AS "endDate",
          status,
          created_at AS "createdAt",
          published_at AS "publishedAt"
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, "organizationId", 'period.created', 'monitoring_period', id::text
        FROM created
        RETURNING id
      )
      SELECT created.* FROM created CROSS JOIN audited
    `

    if (!period) return json({ error: 'Organização ativa não encontrada.' }, 404)
    return json(period, 201)
  } catch (error) {
    return apiError(error)
  }
}
