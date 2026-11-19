import { z } from 'zod'
import { requireActor, requireAdmin } from '../../../_lib/auth'
import type { Environment } from '../../../_lib/env'
import { getScopedDatabase } from '../../../_lib/database'
import { apiError, json, readJson } from '../../../_lib/http'

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  keywords: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
  active: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0)

export const onRequestPatch: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const parsed = updateSchema.safeParse(await readJson(request))
    if (!parsed.success) return json({ error: 'Informe dados válidos para o assunto monitorado.' }, 400)

    const sql = getScopedDatabase(env, actor.id)
    const [topic] = await sql`
      WITH updated AS (
        UPDATE monitored_topics
        SET name = COALESCE(${parsed.data.name ?? null}, name),
            keywords = COALESCE(${parsed.data.keywords ?? null}, keywords),
            active = COALESCE(${parsed.data.active ?? null}, active)
        WHERE id = ${params.topicId}
        RETURNING id, organization_id AS "organizationId", name, keywords, active
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, "organizationId", 'topic.updated', 'monitored_topic', id::text
        FROM updated
        RETURNING id
      )
      SELECT updated.* FROM updated CROSS JOIN audited
    `

    if (!topic) return json({ error: 'Assunto monitorado não encontrado.' }, 404)
    return json(topic)
  } catch (error) {
    return apiError(error)
  }
}
