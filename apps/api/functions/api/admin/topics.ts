import { z } from 'zod'
import { requireActor, requireAdmin } from '../../_lib/auth'
import type { Environment } from '../../_lib/env'
import { getScopedDatabase } from '../../_lib/database'
import { apiError, json, readJson } from '../../_lib/http'

const topicSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  keywords: z.array(z.string().trim().min(1).max(100)).max(30),
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
    const topics = await sql`
      SELECT id, name, keywords, active, organization_id AS "organizationId"
      FROM monitored_topics WHERE organization_id = ${organizationId}
      ORDER BY name
    `
    return json(topics)
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

    const parsed = topicSchema.safeParse(await readJson(request))
    if (!parsed.success) return json({ error: 'Informe o nome do assunto e palavras-chave válidas.' }, 400)

    const sql = getScopedDatabase(env, actor.id)
    const [topic] = await sql`
      WITH created AS (
        INSERT INTO monitored_topics (organization_id, name, keywords)
        SELECT id, ${parsed.data.name}, ${parsed.data.keywords}
        FROM organizations
        WHERE id = ${parsed.data.organizationId} AND active = true
        RETURNING id, organization_id AS "organizationId", name, keywords, active
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, "organizationId", 'topic.created', 'monitored_topic', id::text
        FROM created
        RETURNING id
      )
      SELECT created.* FROM created CROSS JOIN audited
    `

    if (!topic) return json({ error: 'Organização ativa não encontrada.' }, 404)
    return json(topic, 201)
  } catch (error) {
    return apiError(error)
  }
}
