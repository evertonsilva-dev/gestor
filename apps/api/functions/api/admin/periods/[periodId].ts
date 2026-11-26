import { z } from 'zod'
import { requireActor, requireAdmin } from '../../../_lib/auth'
import type { Environment } from '../../../_lib/env'
import { getScopedDatabase } from '../../../_lib/database'
import { apiError, json, readJson } from '../../../_lib/http'

const periodUpdateSchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
}).refine((value) => Object.keys(value).length > 0)

export const onRequestPatch: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const parsed = periodUpdateSchema.safeParse(await readJson(request))
    if (!parsed.success) return json({ error: 'Informe pelo menos uma data válida do período.' }, 400)

    const sql = getScopedDatabase(env, actor.id)
    const [current] = await sql`
      SELECT to_char(start_date, 'YYYY-MM-DD') AS "startDate",
             to_char(end_date, 'YYYY-MM-DD') AS "endDate"
      FROM monitoring_periods
      WHERE id = ${params.periodId}
      LIMIT 1
    `
    if (!current) return json({ error: 'Período não encontrado.' }, 404)

    const startDate = parsed.data.startDate ?? current.startDate
    const endDate = parsed.data.endDate ?? current.endDate
    if (endDate < startDate) return json({ error: 'A data final deve ser igual ou posterior à inicial.' }, 400)

    const [period] = await sql`
      WITH updated AS (
        UPDATE monitoring_periods
        SET start_date = ${startDate}, end_date = ${endDate}
        WHERE id = ${params.periodId}
        RETURNING id, organization_id AS "organizationId",
                  to_char(start_date, 'YYYY-MM-DD') AS "startDate",
                  to_char(end_date, 'YYYY-MM-DD') AS "endDate",
                  status, created_at AS "createdAt", published_at AS "publishedAt"
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id, metadata)
        SELECT ${actor.id}, "organizationId", 'period.updated', 'monitoring_period', id::text,
               jsonb_build_object('startDate', "startDate", 'endDate', "endDate")
        FROM updated
        RETURNING id
      )
      SELECT updated.* FROM updated CROSS JOIN audited
    `
    if (!period) return json({ error: 'O período não pôde ser atualizado.' }, 404)
    return json(period)
  } catch (error) {
    return apiError(error)
  }
}
