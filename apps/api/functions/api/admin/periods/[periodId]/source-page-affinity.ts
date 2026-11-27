import { z } from 'zod'
import { requireActor, requireAdmin } from '../../../../_lib/auth'
import type { Environment } from '../../../../_lib/env'
import { getScopedDatabase } from '../../../../_lib/database'
import { apiError, json, readJson } from '../../../../_lib/http'
import { suggestSourcePageAffinity } from '../../../../_lib/sourcePageAffinity'

const affinitySchema = z.object({
  sourcePageId: z.string().uuid(),
  affinity: z.enum(['allied', 'neutral', 'critical']),
})

export const onRequestGet: PagesFunction<Environment> = async ({ request, env, params }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor
    const denied = requireAdmin(actor)
    if (denied) return denied

    const sql = getScopedDatabase(env, actor.id)
    const [period] = await sql`
      SELECT id, organization_id AS "organizationId"
      FROM monitoring_periods
      WHERE id = ${params.periodId}
      LIMIT 1
    `
    if (!period) return json({ error: 'Período não encontrado.' }, 404)

    const pages = await sql`
      SELECT page.id AS "sourcePageId", page.name AS "sourcePageName",
             page.url AS "sourcePageUrl", channel.name AS "channelName",
             count(item.id)::int AS "postCount",
             count(item.id) FILTER (WHERE item.sentiment = 'positive')::int AS positive,
             count(item.id) FILTER (WHERE item.sentiment = 'neutral')::int AS neutral,
             count(item.id) FILTER (WHERE item.sentiment = 'negative')::int AS negative,
             review.reviewed_affinity AS "reviewedAffinity",
             review.reviewed_at AS "reviewedAt"
      FROM source_pages page
      JOIN channels channel ON channel.id = page.channel_id
      LEFT JOIN news_items item
        ON item.source_page_id = page.id AND item.period_id = ${period.id}
      LEFT JOIN source_page_period_reviews review
        ON review.source_page_id = page.id AND review.period_id = ${period.id}
      WHERE page.organization_id = ${period.organizationId}
      GROUP BY page.id, channel.name, review.reviewed_affinity, review.reviewed_at
      ORDER BY channel.name, page.name
    `

    return json(pages.map((page) => ({
      ...page,
      suggestedAffinity: suggestSourcePageAffinity(page.positive, page.neutral, page.negative),
    })))
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

    const parsed = affinitySchema.safeParse(await readJson(request))
    if (!parsed.success) return json({ error: 'Informe a afinidade que deseja confirmar.' }, 400)

    const sql = getScopedDatabase(env, actor.id)
    const [stats] = await sql`
      SELECT count(item.id)::int AS "postCount",
             count(item.id) FILTER (WHERE item.sentiment = 'positive')::int AS positive,
             count(item.id) FILTER (WHERE item.sentiment = 'neutral')::int AS neutral,
             count(item.id) FILTER (WHERE item.sentiment = 'negative')::int AS negative,
             period.organization_id AS "organizationId"
      FROM monitoring_periods period
      JOIN source_pages page
        ON page.id = ${parsed.data.sourcePageId}
        AND page.organization_id = period.organization_id
      LEFT JOIN news_items item
        ON item.source_page_id = page.id AND item.period_id = period.id
      WHERE period.id = ${params.periodId}
      GROUP BY period.organization_id
    `

    if (!stats) return json({ error: 'Página ou período não encontrado.' }, 404)
    const suggestedAffinity = suggestSourcePageAffinity(stats.positive, stats.neutral, stats.negative)
    if (!suggestedAffinity) {
      return json({ error: 'A página precisa ter pelo menos 3 notícias associadas neste período.' }, 400)
    }

    const [review] = await sql`
      WITH saved AS (
        INSERT INTO source_page_period_reviews (
          organization_id, period_id, source_page_id, suggested_affinity,
          reviewed_affinity, reviewed_by
        )
        VALUES (
          ${stats.organizationId}, ${params.periodId}, ${parsed.data.sourcePageId},
          ${suggestedAffinity}, ${parsed.data.affinity}, ${actor.id}
        )
        ON CONFLICT (source_page_id, period_id)
        DO UPDATE SET
          suggested_affinity = EXCLUDED.suggested_affinity,
          reviewed_affinity = EXCLUDED.reviewed_affinity,
          reviewed_by = EXCLUDED.reviewed_by,
          reviewed_at = now()
        RETURNING source_page_id AS "sourcePageId", suggested_affinity AS "suggestedAffinity",
                  reviewed_affinity AS "reviewedAffinity", reviewed_at AS "reviewedAt"
      ),
      audited AS (
        INSERT INTO audit_events (actor_user_id, organization_id, action, entity_type, entity_id, metadata)
        SELECT ${actor.id}, ${stats.organizationId}, 'source_page.affinity_reviewed',
               'source_page', "sourcePageId"::text,
               jsonb_build_object(
                 'periodId', ${params.periodId}::text,
                 'suggested', ${suggestedAffinity}::text,
                 'reviewed', ${parsed.data.affinity}::text
               )
        FROM saved
        RETURNING id
      )
      SELECT saved.* FROM saved CROSS JOIN audited
    `

    if (!review) return json({ error: 'Não foi possível registrar a revisão de afinidade.' }, 500)
    return json(review)
  } catch (error) {
    return apiError(error)
  }
}
