import { z } from 'zod'
import { requireActor, requireAdmin } from '../../_lib/auth'
import type { Environment } from '../../_lib/env'
import { getScopedDatabase } from '../../_lib/database'
import { apiError, json, readJson } from '../../_lib/http'

const sourcePageSchema = z.object({
  organizationId: z.string().uuid(),
  channelId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  url: z.string().trim().url().max(2048).nullable(),
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
    const pages = await sql`
      SELECT id, organization_id AS "organizationId", channel_id AS "channelId",
             name, url, active, created_at AS "createdAt"
      FROM source_pages
      WHERE organization_id = ${organizationId}
      ORDER BY name
    `
    return json(pages)
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

    const parsed = sourcePageSchema.safeParse(await readJson(request))
    if (!parsed.success) return json({ error: 'Informe dados válidos para a página.' }, 400)

    const sql = getScopedDatabase(env, actor.id)
    const [page] = await sql`
      WITH created AS (
        INSERT INTO source_pages (organization_id, channel_id, name, url)
        SELECT channel.organization_id, channel.id, ${parsed.data.name}, ${parsed.data.url}
        FROM channels channel
        WHERE channel.id = ${parsed.data.channelId}
          AND channel.organization_id = ${parsed.data.organizationId}
          AND channel.active = true
        RETURNING id, organization_id AS "organizationId", channel_id AS "channelId",
                  name, url, active, created_at AS "createdAt"
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, "organizationId", 'source_page.created', 'source_page', id::text
        FROM created
        RETURNING id
      )
      SELECT created.* FROM created CROSS JOIN audited
    `

    if (!page) return json({ error: 'Canal ativo não encontrado nesta organização.' }, 404)
    return json(page, 201)
  } catch (error) {
    return apiError(error)
  }
}
