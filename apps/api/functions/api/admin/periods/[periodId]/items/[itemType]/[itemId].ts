import { z } from 'zod'
import { requireActor, requireAdmin } from '../../../../../../_lib/auth'
import type { Environment } from '../../../../../../_lib/env'
import { getScopedDatabase } from '../../../../../../_lib/database'
import { apiError, json, readJson } from '../../../../../../_lib/http'

const newsUpdate = z.object({
  title: z.string().trim().min(3).max(500).optional(),
  sourceUrl: z.string().url().nullable().optional(),
  sourcePageId: z.string().uuid().nullable().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0)
  .refine((value) => !value.title || value.sentiment !== undefined, {
    message: 'Informe o sentimento ao alterar o título.',
    path: ['sentiment'],
  })

const commentUpdate = z.object({
  content: z.string().trim().min(1).max(4000).optional(),
  sourcePageId: z.string().uuid().nullable().optional(),
  newsItemId: z.string().uuid().nullable().optional(),
  profile: z.enum(['militante', 'simpatizante', 'detrator']).optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
}).refine((value) => Object.keys(value).length > 0)
  .refine((value) => !value.content || value.sentiment !== undefined, {
    message: 'Informe o sentimento ao alterar o comentário.',
    path: ['sentiment'],
  })

const recommendationUpdate = z.object({
  category: z.enum(['insight', 'action', 'example']).optional(),
  content: z.string().trim().min(1).max(4000).optional(),
}).refine((value) => Object.keys(value).length > 0)

export const onRequestPatch: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const body = await readJson<Record<string, unknown>>(request)
    const sql = getScopedDatabase(env, actor.id)
    let rows: Record<string, unknown>[]

    if (params.itemType === 'news') {
      const parsed = newsUpdate.safeParse(body)
      if (!parsed.success) return json({ error: 'Informe os campos válidos da notícia.' }, 400)
      rows = await sql`
        WITH updated AS (
          UPDATE news_items
          SET title = COALESCE(${parsed.data.title ?? null}, title),
              source_url = CASE WHEN ${Object.hasOwn(parsed.data, 'sourceUrl')} THEN ${parsed.data.sourceUrl ?? null} ELSE source_url END,
              source_page_id = CASE WHEN ${Object.hasOwn(parsed.data, 'sourcePageId')} THEN ${parsed.data.sourcePageId ?? null} ELSE source_page_id END,
              sentiment = COALESCE(${parsed.data.sentiment ?? null}, sentiment),
              sentiment_source = CASE WHEN ${Object.hasOwn(parsed.data, 'sentiment')} THEN 'manual' ELSE sentiment_source END,
              sentiment_reason = CASE WHEN ${Object.hasOwn(parsed.data, 'sentiment')} THEN NULL ELSE sentiment_reason END,
              sentiment_keywords = CASE WHEN ${Object.hasOwn(parsed.data, 'sentiment')} THEN '{}' ELSE sentiment_keywords END,
              notes = CASE WHEN ${Object.hasOwn(parsed.data, 'notes')} THEN ${parsed.data.notes ?? null} ELSE notes END
          WHERE id = ${params.itemId}
            AND period_id = ${params.periodId}
            AND (
              NOT ${Object.hasOwn(parsed.data, 'sourcePageId')}
              OR ${parsed.data.sourcePageId ?? null}::uuid IS NULL
              OR EXISTS (
                SELECT 1 FROM source_pages page
                WHERE page.id = ${parsed.data.sourcePageId ?? null}
                  AND page.organization_id = news_items.organization_id
                  AND page.channel_id = news_items.channel_id
                  AND page.active = true
              )
            )
          RETURNING id, organization_id AS "organizationId"
        ),
        audited AS (
          INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
          SELECT ${actor.id}, "organizationId", 'news.updated', 'news_item', id::text FROM updated
          RETURNING id
        )
        SELECT updated.id FROM updated CROSS JOIN audited
      `
    } else if (params.itemType === 'comment') {
      const parsed = commentUpdate.safeParse(body)
      if (!parsed.success) return json({ error: 'Informe os campos válidos do comentário.' }, 400)
      rows = await sql`
        WITH updated AS (
          UPDATE analyzed_comments item
          SET content = COALESCE(${parsed.data.content ?? null}, item.content),
              source_page_id = CASE WHEN ${Object.hasOwn(parsed.data, 'sourcePageId')} THEN ${parsed.data.sourcePageId ?? null} ELSE item.source_page_id END,
              profile = COALESCE(${parsed.data.profile ?? null}, item.profile),
              sentiment = COALESCE(${parsed.data.sentiment ?? null}, item.sentiment),
              sentiment_source = CASE WHEN ${Object.hasOwn(parsed.data, 'sentiment')} THEN 'manual' ELSE item.sentiment_source END,
              sentiment_reason = CASE WHEN ${Object.hasOwn(parsed.data, 'sentiment')} THEN NULL ELSE item.sentiment_reason END,
              sentiment_keywords = CASE WHEN ${Object.hasOwn(parsed.data, 'sentiment')} THEN '{}' ELSE item.sentiment_keywords END,
              news_item_id = CASE WHEN ${Object.hasOwn(parsed.data, 'newsItemId')} THEN ${parsed.data.newsItemId ?? null} ELSE item.news_item_id END
          WHERE item.id = ${params.itemId}
            AND item.period_id = ${params.periodId}
            AND (
              NOT ${Object.hasOwn(parsed.data, 'newsItemId')}
              OR ${parsed.data.newsItemId ?? null}::uuid IS NULL
              OR EXISTS (
                SELECT 1 FROM news_items linked
                WHERE linked.id = ${parsed.data.newsItemId ?? null}
                  AND linked.organization_id = item.organization_id
                  AND linked.period_id = item.period_id
                  AND linked.channel_id = item.channel_id
              )
            )
            AND (
              NOT ${Object.hasOwn(parsed.data, 'sourcePageId')}
              OR ${parsed.data.sourcePageId ?? null}::uuid IS NULL
              OR EXISTS (
                SELECT 1 FROM source_pages page
                WHERE page.id = ${parsed.data.sourcePageId ?? null}
                  AND page.organization_id = item.organization_id
                  AND page.channel_id = item.channel_id
                  AND page.active = true
              )
            )
          RETURNING id, organization_id AS "organizationId"
        ),
        audited AS (
          INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
          SELECT ${actor.id}, "organizationId", 'comment.updated', 'analyzed_comment', id::text FROM updated
          RETURNING id
        )
        SELECT updated.id FROM updated CROSS JOIN audited
      `
    } else if (params.itemType === 'recommendation') {
      const parsed = recommendationUpdate.safeParse(body)
      if (!parsed.success) return json({ error: 'Informe os campos válidos da recomendação.' }, 400)
      rows = await sql`
        WITH updated AS (
          UPDATE recommendations
          SET category = COALESCE(${parsed.data.category ?? null}, category),
              content = COALESCE(${parsed.data.content ?? null}, content)
          WHERE id = ${params.itemId} AND period_id = ${params.periodId}
          RETURNING id, organization_id AS "organizationId"
        ),
        audited AS (
          INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
          SELECT ${actor.id}, "organizationId", 'recommendation.updated', 'recommendation', id::text FROM updated
          RETURNING id
        )
        SELECT updated.id FROM updated CROSS JOIN audited
      `
    } else {
      return json({ error: 'Tipo de registro inválido.' }, 404)
    }

    if (rows.length === 0) return json({ error: 'Registro não encontrado ou período já publicado.' }, 404)
    return json({ updated: true })
  } catch (error) {
    return apiError(error)
  }
}

export const onRequestDelete: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const sql = getScopedDatabase(env, actor.id)
    const table = params.itemType === 'news'
      ? 'news_items'
      : params.itemType === 'comment'
        ? 'analyzed_comments'
        : params.itemType === 'recommendation'
          ? 'recommendations'
          : null
    if (!table) return json({ error: 'Tipo de registro inválido.' }, 404)

    const rows = table === 'news_items'
      ? await sql`
          WITH removed AS (
            DELETE FROM news_items WHERE id = ${params.itemId} AND period_id = ${params.periodId}
            RETURNING id, organization_id AS "organizationId"
          ),
          audited AS (
            INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
            SELECT ${actor.id}, "organizationId", 'news.deleted', 'news_item', id::text FROM removed
            RETURNING id
          )
          SELECT removed.id FROM removed CROSS JOIN audited
        `
      : table === 'analyzed_comments'
        ? await sql`
            WITH removed AS (
              DELETE FROM analyzed_comments WHERE id = ${params.itemId} AND period_id = ${params.periodId}
              RETURNING id, organization_id AS "organizationId"
            ),
            audited AS (
              INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
              SELECT ${actor.id}, "organizationId", 'comment.deleted', 'analyzed_comment', id::text FROM removed
              RETURNING id
            )
            SELECT removed.id FROM removed CROSS JOIN audited
          `
        : await sql`
            WITH removed AS (
              DELETE FROM recommendations WHERE id = ${params.itemId} AND period_id = ${params.periodId}
              RETURNING id, organization_id AS "organizationId"
            ),
            audited AS (
              INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
              SELECT ${actor.id}, "organizationId", 'recommendation.deleted', 'recommendation', id::text FROM removed
              RETURNING id
            )
            SELECT removed.id FROM removed CROSS JOIN audited
          `

    if (rows.length === 0) return json({ error: 'Registro não encontrado ou período já publicado.' }, 404)
    return new Response(null, { status: 204 })
  } catch (error) {
    return apiError(error)
  }
}
