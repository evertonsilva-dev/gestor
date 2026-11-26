import { z } from 'zod'
import { requireActor, requireAdmin } from '../../../../../_lib/auth'
import type { Environment } from '../../../../../_lib/env'
import { getScopedDatabase } from '../../../../../_lib/database'
import { apiError, json, readJson } from '../../../../../_lib/http'
import { classifyMissingSentiments, getSentimentContext } from '../../../../../_lib/sentiment'

const newsItemSchema = z.object({
  channelId: z.string().uuid(),
  sourcePageId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(3).max(500),
  sourceUrl: z.string().url().nullable(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  notes: z.string().trim().max(4000).nullable(),
})

const commentItemSchema = z.object({
  channelId: z.string().uuid(),
  sourcePageId: z.string().uuid().nullable().optional(),
  content: z.string().trim().min(1).max(4000),
  newsItemId: z.string().uuid().nullable(),
  profile: z.enum(['militante', 'simpatizante', 'detrator']),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
})

const batchSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('news'), items: z.array(newsItemSchema).min(1).max(500) }),
  z.object({ type: z.literal('comment'), items: z.array(commentItemSchema).min(1).max(500) }),
])

export const onRequestPost: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const body = await readJson(request)
    const parsed = batchSchema.safeParse(body)
    if (!parsed.success) {
      return json({
        error: 'Revise os itens antes de importar.',
        issues: parsed.error.issues.map((issue) => ({
          row: typeof issue.path[1] === 'number' ? issue.path[1] + 1 : null,
          field: issue.path.slice(2).join('.'),
          message: issue.message,
        })),
      }, 400)
    }

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

    const classifiedItems = parsed.data.type === 'news'
      ? await classifyMissingSentiments(
        env.AI,
        parsed.data.items,
        (item) => item.title,
        await getSentimentContext(sql, period.organizationId, period.organizationName),
      )
      : await classifyMissingSentiments(
        env.AI,
        parsed.data.items,
        (item) => item.content,
        await getSentimentContext(sql, period.organizationId, period.organizationName),
      )
    const payload = JSON.stringify(classifiedItems)
    const result = parsed.data.type === 'news'
      ? await sql`
          WITH source AS (
            SELECT e.ordinality AS row_number, item.*
            FROM jsonb_array_elements(${payload}::jsonb) WITH ORDINALITY AS e(value, ordinality)
            CROSS JOIN LATERAL jsonb_to_record(e.value) AS item(
              "channelId" uuid, "sourcePageId" uuid, title text, "sourceUrl" text,
              sentiment text, "sentimentSource" text, "sentimentReason" text,
              "sentimentKeywords" text[], notes text
            )
          ),
          invalid AS (
            SELECT source.row_number
            FROM source
            LEFT JOIN channels channel
              ON channel.id = source."channelId"
              AND channel.organization_id = ${period.organizationId}
              AND channel.active = true
            LEFT JOIN source_pages page
              ON page.id = source."sourcePageId"
              AND page.channel_id = source."channelId"
              AND page.organization_id = ${period.organizationId}
              AND page.active = true
            WHERE channel.id IS NULL
              OR (source."sourcePageId" IS NOT NULL AND page.id IS NULL)
          ),
          ranked AS (
            SELECT source.*,
                   row_number() OVER (
                     PARTITION BY source."channelId",
                       CASE WHEN source."sourceUrl" IS NOT NULL
                         THEN 'url:' || source."sourceUrl"
                         ELSE 'title:' || lower(source.title)
                       END
                     ORDER BY source.row_number
                   ) AS occurrence
            FROM source
          ),
          candidates AS (
            SELECT ranked.*
            FROM ranked
            JOIN channels channel
              ON channel.id = ranked."channelId"
              AND channel.organization_id = ${period.organizationId}
              AND channel.active = true
            WHERE ranked.occurrence = 1
              AND NOT EXISTS (SELECT 1 FROM invalid)
              AND NOT EXISTS (
                SELECT 1 FROM news_items existing
                WHERE existing.period_id = ${period.id}
                  AND existing.channel_id = ranked."channelId"
                  AND (
                    (ranked."sourceUrl" IS NOT NULL AND existing.source_url = ranked."sourceUrl")
                    OR (ranked."sourceUrl" IS NULL AND lower(existing.title) = lower(ranked.title))
                  )
              )
          ),
          inserted AS (
            INSERT INTO news_items (
              organization_id, period_id, channel_id, source_page_id, title, source_url,
              published_at, sentiment, sentiment_source, sentiment_reason,
              sentiment_keywords, notes
            )
            SELECT ${period.organizationId}, ${period.id}, candidate."channelId",
                   candidate."sourcePageId", candidate.title, candidate."sourceUrl", NULL,
                   candidate.sentiment, candidate."sentimentSource", candidate."sentimentReason",
                   candidate."sentimentKeywords", candidate.notes
            FROM candidates candidate
            RETURNING id, organization_id AS "organizationId"
          ),
          audited AS (
            INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
            SELECT ${actor.id}, "organizationId", 'news.created', 'news_item', id::text
            FROM inserted
            RETURNING id
          )
          SELECT
            (SELECT count(*)::int FROM inserted) AS inserted,
            (SELECT count(*)::int FROM invalid) AS invalid,
            (SELECT count(*)::int FROM source) AS total
        `
      : await sql`
          WITH source AS (
            SELECT e.ordinality AS row_number, item.*
            FROM jsonb_array_elements(${payload}::jsonb) WITH ORDINALITY AS e(value, ordinality)
            CROSS JOIN LATERAL jsonb_to_record(e.value) AS item(
              "channelId" uuid, "sourcePageId" uuid, content text, "newsItemId" uuid,
              profile text, sentiment text, "sentimentSource" text,
              "sentimentReason" text, "sentimentKeywords" text[]
            )
          ),
          invalid AS (
            SELECT source.row_number
            FROM source
            LEFT JOIN channels channel
              ON channel.id = source."channelId"
              AND channel.organization_id = ${period.organizationId}
              AND channel.active = true
            LEFT JOIN source_pages page
              ON page.id = source."sourcePageId"
              AND page.channel_id = source."channelId"
              AND page.organization_id = ${period.organizationId}
              AND page.active = true
            LEFT JOIN news_items linked
              ON linked.id = source."newsItemId"
              AND linked.organization_id = ${period.organizationId}
              AND linked.period_id = ${period.id}
              AND linked.channel_id = source."channelId"
            WHERE channel.id IS NULL
              OR (source."sourcePageId" IS NOT NULL AND page.id IS NULL)
              OR (source."newsItemId" IS NOT NULL AND linked.id IS NULL)
          ),
          ranked AS (
            SELECT source.*,
                   row_number() OVER (
                     PARTITION BY source."channelId", source."newsItemId",
                       lower(regexp_replace(btrim(source.content), '[[:space:]]+', ' ', 'g'))
                     ORDER BY source.row_number
                   ) AS occurrence
            FROM source
          ),
          candidates AS (
            SELECT ranked.*
            FROM ranked
            JOIN channels channel
              ON channel.id = ranked."channelId"
              AND channel.organization_id = ${period.organizationId}
              AND channel.active = true
            WHERE ranked.occurrence = 1
              AND NOT EXISTS (SELECT 1 FROM invalid)
              AND NOT EXISTS (
                SELECT 1 FROM analyzed_comments existing
                WHERE existing.period_id = ${period.id}
                  AND existing.channel_id = ranked."channelId"
                  AND existing.news_item_id IS NOT DISTINCT FROM ranked."newsItemId"
                  AND lower(regexp_replace(btrim(existing.content), '[[:space:]]+', ' ', 'g'))
                    = lower(regexp_replace(btrim(ranked.content), '[[:space:]]+', ' ', 'g'))
              )
          ),
          inserted AS (
            INSERT INTO analyzed_comments (
              organization_id, period_id, channel_id, source_page_id, news_item_id,
              content, commented_at, profile, sentiment, sentiment_source,
              sentiment_reason, sentiment_keywords
            )
            SELECT ${period.organizationId}, ${period.id}, candidate."channelId",
                   candidate."sourcePageId", candidate."newsItemId", candidate.content, NULL,
                   candidate.profile, candidate.sentiment, candidate."sentimentSource",
                   candidate."sentimentReason", candidate."sentimentKeywords"
            FROM candidates candidate
            RETURNING id, organization_id AS "organizationId"
          ),
          audited AS (
            INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id)
            SELECT ${actor.id}, "organizationId", 'comment.created', 'analyzed_comment', id::text
            FROM inserted
            RETURNING id
          )
          SELECT
            (SELECT count(*)::int FROM inserted) AS inserted,
            (SELECT count(*)::int FROM invalid) AS invalid,
            (SELECT count(*)::int FROM source) AS total
        `

    const summary = result[0]
    if (summary.invalid > 0) {
      return json({
        error: 'Há linhas com canal, página ou notícia incompatível. Nenhum registro foi importado.',
        invalid: summary.invalid,
      }, 400)
    }

    return json({
      inserted: summary.inserted,
      duplicates: summary.total - summary.inserted,
    }, 201)
  } catch (error) {
    return apiError(error)
  }
}
