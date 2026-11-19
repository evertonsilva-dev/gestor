import { z } from 'zod'
import { requireActor, requireAdmin } from '../../../_lib/auth'
import type { Environment } from '../../../_lib/env'
import { getScopedDatabase } from '../../../_lib/database'
import { apiError, json, readJson } from '../../../_lib/http'

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  active: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0)

export const onRequestPatch: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const parsed = updateSchema.safeParse(await readJson(request))
    if (!parsed.success) return json({ error: 'Informe um nome ou situação válidos para o canal.' }, 400)

    const sql = getScopedDatabase(env, actor.id)
    const [channel] = await sql`
      WITH updated AS (
        UPDATE channels
        SET name = COALESCE(${parsed.data.name ?? null}, name),
            active = COALESCE(${parsed.data.active ?? null}, active)
        WHERE id = ${params.channelId}
        RETURNING id, organization_id AS "organizationId", name, active
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, "organizationId", 'channel.updated', 'channel', id::text
        FROM updated
        RETURNING id
      )
      SELECT updated.* FROM updated CROSS JOIN audited
    `

    if (!channel) return json({ error: 'Canal não encontrado.' }, 404)
    return json(channel)
  } catch (error) {
    return apiError(error)
  }
}
