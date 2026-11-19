import { requireActor, requireClientOrganization } from '../_lib/auth'
import type { Environment } from '../_lib/env'
import { getScopedDatabase } from '../_lib/database'
import { apiError, json } from '../_lib/http'

export const onRequestGet: PagesFunction<Environment> = async ({ request, env }) => {
  try {
    const actor = await requireActor(request, env)
    if (actor instanceof Response) return actor

    const url = new URL(request.url)
    const requestedOrganization = url.searchParams.get('organizationId')
    let organizationId: string

    if (actor.role === 'admin') {
      if (!requestedOrganization) return json({ error: 'Selecione uma organização para visualizar.' }, 400)
      organizationId = requestedOrganization
    } else {
      const clientOrganization = requireClientOrganization(actor)
      if (clientOrganization instanceof Response) return clientOrganization
      organizationId = clientOrganization
    }

    const sql = getScopedDatabase(env, actor.id)
    const [organization] = await sql`
      SELECT id, name FROM organizations
      WHERE id = ${organizationId} AND active = true
      LIMIT 1
    `
    if (!organization) return json({ error: 'Organização não encontrada.' }, 404)

    const [processingPeriod] = await sql`
      SELECT id FROM monitoring_periods
      WHERE organization_id = ${organizationId} AND status = 'processing'
      ORDER BY end_date DESC LIMIT 1
    `

    const availablePeriods = await sql`
      SELECT
        id,
        to_char(start_date, 'YYYY-MM-DD') AS "startDate",
        to_char(end_date, 'YYYY-MM-DD') AS "endDate",
        published_at AS "publishedAt"
      FROM monitoring_periods
      WHERE organization_id = ${organizationId} AND status = 'published'
      ORDER BY end_date DESC
    `

    const requestedPeriodId = url.searchParams.get('periodId')
    const selectedPeriod = requestedPeriodId
      ? availablePeriods.find((period) => period.id === requestedPeriodId)
      : availablePeriods[0]

    if (requestedPeriodId && !selectedPeriod) {
      return json({ error: 'O relatório solicitado não está publicado ou não pertence à organização.' }, 404)
    }

    const base = {
      organization,
      selectedPeriod: selectedPeriod ?? null,
      updateInProgress: Boolean(processingPeriod),
      lastPublishedAt: availablePeriods[0]?.publishedAt ?? null,
      availablePeriods,
    }

    if (!selectedPeriod) {
      return json({
        ...base,
        metrics: { newsCount: 0, commentCount: 0 },
        sentimentByChannel: [],
        audience: [],
        news: [],
        comments: [],
        recommendations: [],
      })
    }

    const [counts, sentimentByChannel, audience, news, comments, recommendations] = await Promise.all([
      sql`
        SELECT
          (SELECT count(*) FROM news_items WHERE period_id = ${selectedPeriod.id})::int AS "newsCount",
          (SELECT count(*) FROM analyzed_comments WHERE period_id = ${selectedPeriod.id})::int AS "commentCount"
      `,
      sql`
        SELECT
          c.name AS "channelName",
          count(*) FILTER (WHERE n.sentiment = 'positive')::int AS positive,
          count(*) FILTER (WHERE n.sentiment = 'neutral')::int AS neutral,
          count(*) FILTER (WHERE n.sentiment = 'negative')::int AS negative
        FROM channels c
        LEFT JOIN news_items n ON n.channel_id = c.id AND n.period_id = ${selectedPeriod.id}
        WHERE c.organization_id = ${organizationId}
        GROUP BY c.id, c.name
        ORDER BY c.name
      `,
      sql`
        SELECT
          profile,
          count(*)::int AS count,
          CASE WHEN sum(count(*)) OVER () = 0 THEN 0
            ELSE round(count(*) * 100.0 / sum(count(*)) OVER ())::int
          END AS percentage
        FROM analyzed_comments
        WHERE period_id = ${selectedPeriod.id}
        GROUP BY profile
        ORDER BY CASE profile WHEN 'militante' THEN 1 WHEN 'simpatizante' THEN 2 ELSE 3 END
      `,
      sql`
        SELECT
          n.id,
          n.title,
          n.source_url AS "sourceUrl",
          c.name AS "channelName",
          n.sentiment,
          n.published_at AS "publishedAt"
        FROM news_items n
        JOIN channels c ON c.id = n.channel_id
        WHERE n.period_id = ${selectedPeriod.id}
        ORDER BY n.published_at DESC
      `,
      sql`
        SELECT
          cmt.id,
          cmt.content,
          c.name AS "channelName",
          cmt.profile,
          cmt.sentiment,
          cmt.commented_at AS "commentedAt"
        FROM analyzed_comments cmt
        JOIN channels c ON c.id = cmt.channel_id
        WHERE cmt.period_id = ${selectedPeriod.id}
        ORDER BY cmt.commented_at DESC
      `,
      sql`
        SELECT id, category, content
        FROM recommendations
        WHERE period_id = ${selectedPeriod.id}
        ORDER BY sort_order, created_at
      `,
    ])

    return json({
      ...base,
      metrics: counts[0] ?? { newsCount: 0, commentCount: 0 },
      sentimentByChannel,
      audience,
      news,
      comments,
      recommendations,
    })
  } catch (error) {
    return apiError(error)
  }
}
