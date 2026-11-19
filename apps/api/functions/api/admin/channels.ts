import { z } from 'zod'
import { requireActor, requireAdmin } from '../../_lib/auth'
import type { Environment } from '../../_lib/env'
import { getScopedDatabase } from '../../_lib/database'
import { apiError, json, readJson } from '../../_lib/http'

const channelSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
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
    const channels = await sql`
      SELECT id, name, active, organization_id AS "organizationId"
      FROM channels WHERE organization_id = ${organizationId}
      ORDER BY name
    `
    return json(channels)
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

    const parsed = channelSchema.safeParse(await readJson(request))
    if (!parsed.success) return json({ error: 'Informe a organização e o nome do canal.' }, 400)

    const sql = getScopedDatabase(env, actor.id)
    const [channel] = await sql`
      WITH created AS (
        INSERT INTO channels (organization_id, name)
        SELECT id, ${parsed.data.name}
        FROM organizations
        WHERE id = ${parsed.data.organizationId} AND active = true
        RETURNING id, organization_id AS "organizationId", name, active
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, "organizationId", 'channel.created', 'channel', id::text
        FROM created
        RETURNING id
      )
      SELECT created.* FROM created CROSS JOIN audited
    `

    if (!channel) return json({ error: 'Organização ativa não encontrada.' }, 404)
    return json(channel, 201)
  } catch (error) {
    return apiError(error)
  }
}
