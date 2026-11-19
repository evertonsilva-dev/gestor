import { z } from 'zod'
import { requireActor, requireAdmin } from '../../../../_lib/auth'
import type { Environment } from '../../../../_lib/env'
import { getScopedDatabase } from '../../../../_lib/database'
import { apiError, json, readJson } from '../../../../_lib/http'

const itemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('news'),
    channelId: z.string().uuid(),
    title: z.string().trim().min(3).max(500),
    sourceUrl: z.string().url().nullable().optional(),
    publishedAt: z.string().datetime(),
    sentiment: z.enum(['positive', 'neutral', 'negative']),
    notes: z.string().trim().max(4000).nullable().optional(),
  }),
  z.object({
    type: z.literal('comment'),
    channelId: z.string().uuid(),
    content: z.string().trim().min(1).max(4000),
    commentedAt: z.string().datetime(),
    profile: z.enum(['militante', 'simpatizante', 'detrator']),
    sentiment: z.enum(['positive', 'neutral', 'negative']),
  }),
  z.object({
    type: z.literal('recommendation'),
    category: z.enum(['insight', 'action', 'example']),
    content: z.string().trim().min(1).max(4000),
  }),
])

export const onRequestGet: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const sql = getScopedDatabase(env, actor.id)
    const [period] = await sql`
      SELECT id FROM monitoring_periods WHERE id = ${params.periodId} LIMIT 1
    `
    if (!period) return json({ error: 'Período não encontrado.' }, 404)

    const [news, comments, recommendations] = await Promise.all([
      sql`
        SELECT item.id, 'news' AS type, item.title, item.source_url AS "sourceUrl",
               item.published_at AS "publishedAt", item.sentiment, item.notes,
               item.channel_id AS "channelId", channel.name AS "channelName",
               item.created_at AS "createdAt"
        FROM news_items item
        JOIN channels channel ON channel.id = item.channel_id
        WHERE item.period_id = ${period.id} ORDER BY item.created_at DESC
      `,
      sql`
        SELECT item.id, 'comment' AS type, item.content, item.commented_at AS "commentedAt",
               item.profile, item.sentiment, item.channel_id AS "channelId",
               channel.name AS "channelName", item.created_at AS "createdAt"
        FROM analyzed_comments item
        JOIN channels channel ON channel.id = item.channel_id
        WHERE item.period_id = ${period.id} ORDER BY item.created_at DESC
      `,
      sql`
        SELECT id, 'recommendation' AS type, content, category, created_at AS "createdAt"
        FROM recommendations WHERE period_id = ${period.id} ORDER BY sort_order, created_at
      `,
    ])

    return json({ news, comments, recommendations })
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

    const parsed = itemSchema.safeParse(await readJson(request))
    if (!parsed.success) return json({ error: 'Confira os campos obrigatórios do registro.' }, 400)

    const sql = getScopedDatabase(env, actor.id)
    const [period] = await sql`
      SELECT id, organization_id AS "organizationId"
      FROM monitoring_periods
      WHERE id = ${params.periodId} AND status = 'processing'
      LIMIT 1
    `

    if (!period) return json({ error: 'Período inexistente ou já publicado.' }, 404)

    let rows: Record<string, unknown>[]
    const item = parsed.data

    if (item.type === 'news') {
      rows = await sql`
        WITH inserted AS (
          INSERT INTO news_items (organization_id, period_id, channel_id, title, source_url, published_at, sentiment, notes)
          SELECT ${period.organizationId}, ${period.id}, c.id, ${item.title}, ${item.sourceUrl ?? null}, ${item.publishedAt}, ${item.sentiment}, ${item.notes ?? null}
          FROM channels c
          WHERE c.id = ${item.channelId}
            AND c.organization_id = ${period.organizationId}
            AND c.active = true
          RETURNING id
        ),
        audited AS (
          INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
          SELECT ${actor.id}, ${period.organizationId}, 'news.created', 'news_item', id::text
          FROM inserted
          RETURNING id
        )
        SELECT id FROM audited
      `
    } else if (item.type === 'comment') {
      rows = await sql`
        WITH inserted AS (
          INSERT INTO analyzed_comments (organization_id, period_id, channel_id, content, commented_at, profile, sentiment)
          SELECT ${period.organizationId}, ${period.id}, c.id, ${item.content}, ${item.commentedAt}, ${item.profile}, ${item.sentiment}
          FROM channels c
          WHERE c.id = ${item.channelId}
            AND c.organization_id = ${period.organizationId}
            AND c.active = true
          RETURNING id
        ),
        audited AS (
          INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
          SELECT ${actor.id}, ${period.organizationId}, 'comment.created', 'analyzed_comment', id::text
          FROM inserted
          RETURNING id
        )
        SELECT id FROM audited
      `
    } else {
      rows = await sql`
        WITH inserted AS (
          INSERT INTO recommendations (organization_id, period_id, category, content)
          VALUES (${period.organizationId}, ${period.id}, ${item.category}, ${item.content})
          RETURNING id
        ),
        audited AS (
          INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
          SELECT ${actor.id}, ${period.organizationId}, 'recommendation.created', 'recommendation', id::text
          FROM inserted
          RETURNING id
        )
        SELECT id FROM audited
      `
    }

    if (rows.length === 0) return json({ error: 'Canal não encontrado nesta organização.' }, 400)
    return json({ saved: true }, 201)
  } catch (error) {
    return apiError(error)
  }
}
