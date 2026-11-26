import { z } from 'zod'
import { requireActor, requireAdmin } from '../../../_lib/auth'
import type { Environment } from '../../../_lib/env'
import { getScopedDatabase } from '../../../_lib/database'
import { apiError, json, readJson } from '../../../_lib/http'

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  url: z.string().trim().url().max(2048).nullable().optional(),
  active: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0)

export const onRequestPatch: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const parsed = updateSchema.safeParse(await readJson(request))
    if (!parsed.success) return json({ error: 'Informe dados válidos para a página.' }, 400)

    const sql = getScopedDatabase(env, actor.id)
    const [page] = await sql`
      WITH updated AS (
        UPDATE source_pages
        SET name = COALESCE(${parsed.data.name ?? null}, name),
            url = CASE WHEN ${Object.hasOwn(parsed.data, 'url')} THEN ${parsed.data.url ?? null} ELSE url END,
            active = COALESCE(${parsed.data.active ?? null}, active)
        WHERE id = ${params.sourcePageId}
        RETURNING id, organization_id AS "organizationId", channel_id AS "channelId",
                  name, url, active, created_at AS "createdAt"
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, "organizationId", 'source_page.updated', 'source_page', id::text
        FROM updated
        RETURNING id
      )
      SELECT updated.* FROM updated CROSS JOIN audited
    `

    if (!page) return json({ error: 'Página não encontrada.' }, 404)
    return json(page)
  } catch (error) {
    return apiError(error)
  }
}
