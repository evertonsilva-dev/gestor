import { z } from 'zod'
import { generateClientAccessKey, hashClientSecret } from '../../../../_lib/clientAccess'
import { requireActor, requireAdmin } from '../../../../_lib/auth'
import type { Environment } from '../../../../_lib/env'
import { getScopedDatabase } from '../../../../_lib/database'
import { apiError, json, readJson } from '../../../../_lib/http'

const createSchema = z.object({
  label: z.string().trim().min(2).max(120),
})

export const onRequestGet: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const sql = getScopedDatabase(env, actor.id)
    const keys = await sql`
      SELECT id, label, key_prefix AS "keyPrefix", created_at AS "createdAt",
        revoked_at AS "revokedAt"
      FROM client_access_keys
      WHERE organization_id = ${params.organizationId}
      ORDER BY created_at DESC
    `

    return json(keys)
  } catch (error) {
    return apiError(error)
  }
}

export const onRequestPost: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const parsed = createSchema.safeParse(await readJson(request))
    if (!parsed.success) {
      return json({ error: 'O nome da chave deve ter entre 2 e 120 caracteres.' }, 400)
    }

    const accessKey = generateClientAccessKey()
    const keyHash = await hashClientSecret(accessKey)
    const keyMaterial = accessKey.slice(accessKey.lastIndexOf('_') + 1)
    const keyPrefix = `client_${keyMaterial.slice(0, 6)}...`
    const sql = getScopedDatabase(env, actor.id)
    const [key] = await sql`
      WITH created AS (
        INSERT INTO client_access_keys (
          organization_id, label, key_hash, key_prefix, created_by
        )
        SELECT id, ${parsed.data.label}, ${keyHash}, ${keyPrefix}, ${actor.id}
        FROM organizations
        WHERE id = ${params.organizationId} AND active = true
        RETURNING id, label, key_prefix AS "keyPrefix", created_at AS "createdAt"
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
        SELECT ${actor.id}, ${params.organizationId}, 'client.access_key_created',
          'client_access_key', id::text
        FROM created
        RETURNING id
      )
      SELECT created.* FROM created CROSS JOIN audited
    `

    if (!key) {
      return json({ error: 'Organização ativa não encontrada.' }, 404)
    }

    return json({ ...key, accessKey }, 201)
  } catch (error) {
    return apiError(error)
  }
}
