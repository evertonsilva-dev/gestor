import { z } from 'zod'
import { requireActor, requireAdmin } from '../../../../_lib/auth'
import type { Environment } from '../../../../_lib/env'
import { getScopedDatabase } from '../../../../_lib/database'
import { apiError, json, readJson } from '../../../../_lib/http'
import { classifyMissingSentiments, getSentimentContext } from '../../../../_lib/sentiment'

const itemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('news'),
    channelId: z.string().uuid(),
    sourcePageId: z.string().uuid().nullable().optional(),
    title: z.string().trim().min(3).max(500),
    sourceUrl: z.string().url().nullable().optional(),
    sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
    notes: z.string().trim().max(4000).nullable().optional(),
  }),
  z.object({
    type: z.literal('comment'),
    content: z.string().trim().min(1).max(4000),
    newsItemId: z.string().uuid(),
    profile: z.enum(['militante', 'simpatizante', 'detrator']).nullable().optional(),
    sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
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
               item.sentiment_source AS "sentimentSource",
               item.sentiment_reason AS "sentimentReason",
               item.sentiment_keywords AS "sentimentKeywords",
               item.source_page_id AS "sourcePageId", page.name AS "sourcePageName",
               item.channel_id AS "channelId", channel.name AS "channelName",
               item.created_at AS "createdAt"
        FROM news_items item
        JOIN channels channel ON channel.id = item.channel_id
        LEFT JOIN source_pages page ON page.id = item.source_page_id
        WHERE item.period_id = ${period.id} ORDER BY item.created_at DESC
      `,
      sql`
        SELECT item.id, 'comment' AS type, item.content, item.commented_at AS "commentedAt",
               item.news_item_id AS "newsItemId", linked.title AS "newsTitle",
               item.profile, item.sentiment, item.channel_id AS "channelId",
               item.sentiment_source AS "sentimentSource",
               item.sentiment_reason AS "sentimentReason",
               item.sentiment_keywords AS "sentimentKeywords",
               item.source_page_id AS "sourcePageId", page.name AS "sourcePageName",
               channel.name AS "channelName", item.created_at AS "createdAt"
        FROM analyzed_comments item
        JOIN channels channel ON channel.id = item.channel_id
        LEFT JOIN source_pages page ON page.id = item.source_page_id
        LEFT JOIN news_items linked ON linked.id = item.news_item_id
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
      SELECT period.id, period.organization_id AS "organizationId",
             organization.name AS "organizationName"
      FROM monitoring_periods period
      JOIN organizations organization ON organization.id = period.organization_id
      WHERE period.id = ${params.periodId} AND period.status = 'processing'
      LIMIT 1
    `

    if (!period) return json({ error: 'Período inexistente ou já publicado.' }, 404)

    let rows: Record<string, unknown>[]
    const item = parsed.data

    if (item.type === 'news') {
      const sentimentContext = await getSentimentContext(sql, period.organizationId, period.organizationName)
      const [classifiedItem] = await classifyMissingSentiments(
        env.AI,
        [item],
        (value) => value.title,
        sentimentContext,
      )
      rows = await sql`
        WITH inserted AS (
          INSERT INTO news_items (
            organization_id, period_id, channel_id, source_page_id, title, source_url,
            published_at, sentiment, sentiment_source, sentiment_reason, sentiment_keywords, notes
          )
          SELECT ${period.organizationId}, ${period.id}, c.id, page.id,
                 ${item.title}, ${item.sourceUrl ?? null}, NULL, ${classifiedItem.sentiment},
                 ${classifiedItem.sentimentSource}, ${classifiedItem.sentimentReason},
                 ${classifiedItem.sentimentKeywords}, ${item.notes ?? null}
          FROM channels c
          LEFT JOIN source_pages page
            ON page.id = ${item.sourcePageId ?? null}
            AND page.channel_id = c.id
            AND page.organization_id = ${period.organizationId}
            AND page.active = true
          WHERE c.id = ${item.channelId}
            AND c.organization_id = ${period.organizationId}
            AND c.active = true
            AND (${item.sourcePageId ?? null}::uuid IS NULL OR page.id IS NOT NULL)
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
      const sentimentContext = await getSentimentContext(sql, period.organizationId, period.organizationName)
      const [classifiedItem] = await classifyMissingSentiments(
        env.AI,
        [item],
        (value) => value.content,
        sentimentContext,
        'comment',
      )
      rows = await sql`
        WITH inserted AS (
          INSERT INTO analyzed_comments (
            organization_id, period_id, channel_id, source_page_id, news_item_id, content,
            commented_at, profile, sentiment, sentiment_source, sentiment_reason, sentiment_keywords
          )
          SELECT ${period.organizationId}, ${period.id}, linked.channel_id,
                 linked.source_page_id, linked.id, ${item.content}, NULL, ${item.profile ?? null},
                 ${classifiedItem.sentiment},
                 ${classifiedItem.sentimentSource}, ${classifiedItem.sentimentReason},
                 ${classifiedItem.sentimentKeywords}
          FROM news_items linked
          WHERE linked.id = ${item.newsItemId}
            AND linked.organization_id = ${period.organizationId}
            AND linked.period_id = ${period.id}
            AND linked.source_page_id IS NOT NULL
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

    if (rows.length === 0) return json({ error: 'Selecione uma publicação vinculada a uma página deste período.' }, 400)
    return json({ saved: true }, 201)
  } catch (error) {
    return apiError(error)
  }
}
