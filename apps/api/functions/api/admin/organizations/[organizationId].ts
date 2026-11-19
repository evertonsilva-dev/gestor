import { z } from 'zod'
import { requireActor, requireAdmin } from '../../../_lib/auth'
import type { Environment } from '../../../_lib/env'
import { getScopedDatabase } from '../../../_lib/database'
import { apiError, json, readJson } from '../../../_lib/http'

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  active: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0)

export const onRequestPatch: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const parsed = updateSchema.safeParse(await readJson(request))
    if (!parsed.success) {
      return json({ error: 'Informe um nome ou estado válido para a organização.' }, 400)
    }

    const sql = getScopedDatabase(env, actor.id)
    const [organization] = await sql`
      WITH updated AS (
        UPDATE organizations
        SET
          name = COALESCE(${parsed.data.name ?? null}, name),
          active = COALESCE(${parsed.data.active ?? null}, active)
        WHERE id = ${params.organizationId}
        RETURNING id, name, slug, active, created_at AS "createdAt"
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, id, 'organization.updated', 'organization', id::text
        FROM updated
        RETURNING id
      )
      SELECT updated.* FROM updated CROSS JOIN audited
    `

    if (!organization) {
      return json({ error: 'Organização não encontrada.' }, 404)
    }

    return json(organization)
  } catch (error) {
    return apiError(error)
  }
}
