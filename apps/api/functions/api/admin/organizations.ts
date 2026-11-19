import { z } from 'zod'
import { requireActor, requireAdmin } from '../../_lib/auth'
import type { Environment } from '../../_lib/env'
import { getScopedDatabase } from '../../_lib/database'
import { apiError, json, readJson } from '../../_lib/http'

const organizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})

export const onRequestGet: PagesFunction<Environment> = async ({ request, env }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const sql = getScopedDatabase(env, actor.id)
    const organizations = await sql`
      SELECT id, name, slug, active, created_at AS "createdAt"
      FROM organizations
      ORDER BY name
    `

    return json(organizations)
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

    const parsed = organizationSchema.safeParse(await readJson(request))
    if (!parsed.success) {
      return json({ error: 'Informe um nome e um identificador válido para a organização.' }, 400)
    }

    const sql = getScopedDatabase(env, actor.id)
    const [organization] = await sql`
      WITH created AS (
        INSERT INTO organizations (name, slug)
        VALUES (${parsed.data.name}, ${parsed.data.slug})
        RETURNING id, name, slug, active, created_at AS "createdAt"
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, id, 'organization.created', 'organization', id::text
        FROM created
        RETURNING id
      )
      SELECT created.* FROM created CROSS JOIN audited
    `

    return json(organization, 201)
  } catch (error) {
    return apiError(error)
  }
}
