import { z } from 'zod'
import type { PeriodItemInput } from '@/hooks/useAdminMonitoring/types'
import type { PeriodItem, PeriodItemUpdate } from '@/hooks/usePeriodItems/types'

const sentimentSchema = z.enum(['positive', 'neutral', 'negative'])
const profileSchema = z.enum(['militante', 'simpatizante', 'detrator'])
const recommendationSchema = z.enum(['insight', 'action', 'example'])

function requiredValue(formData: FormData, field: string): string {
  const value = formData.get(field)

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('Preencha todos os campos obrigatórios.')
  }

  return value.trim()
}

function optionalSentiment(formData: FormData) {
  const value = String(formData.get('sentiment') ?? '').trim()
  return value ? sentimentSchema.parse(value) : undefined
}

export function buildPeriodItem(formData: FormData): PeriodItemInput {
  const type = requiredValue(formData, 'type')

  if (type === 'news') {
    const sourceUrl = String(formData.get('sourceUrl') ?? '').trim()
    const sentiment = optionalSentiment(formData)
    return {
      type,
      channelId: requiredValue(formData, 'channelId'),
      sourcePageId: String(formData.get('sourcePageId') ?? '').trim() || null,
      title: requiredValue(formData, 'title'),
      sourceUrl: sourceUrl || null,
      ...(sentiment ? { sentiment } : {}),
      notes: String(formData.get('notes') ?? '').trim() || null,
    }
  }

  if (type === 'comment') {
    const sentiment = optionalSentiment(formData)
    return {
      type,
      channelId: requiredValue(formData, 'channelId'),
      sourcePageId: String(formData.get('sourcePageId') ?? '').trim() || null,
      content: requiredValue(formData, 'content'),
      newsItemId: String(formData.get('newsItemId') ?? '').trim() || null,
      profile: profileSchema.parse(requiredValue(formData, 'profile')),
      ...(sentiment ? { sentiment } : {}),
    }
  }

  if (type === 'recommendation') {
    return {
      type,
      category: recommendationSchema.parse(requiredValue(formData, 'category')),
      content: requiredValue(formData, 'content'),
    }
  }

  throw new Error('Selecione um tipo de conteúdo válido.')
}

export function parseKeywords(value: string): string[] {
  return [...new Set(value.split(',').map((keyword) => keyword.trim()).filter(Boolean))]
}

export function buildPeriodItemUpdate(item: PeriodItem, formData: FormData): PeriodItemUpdate {
  if (item.type === 'news') {
    return {
      title: requiredValue(formData, 'title'),
      sourceUrl: String(formData.get('sourceUrl') ?? '').trim() || null,
      sourcePageId: String(formData.get('sourcePageId') ?? '').trim() || null,
      sentiment: sentimentSchema.parse(requiredValue(formData, 'sentiment')),
      notes: String(formData.get('notes') ?? '').trim() || null,
    }
  }

  if (item.type === 'comment') {
    return {
      content: requiredValue(formData, 'content'),
      sourcePageId: String(formData.get('sourcePageId') ?? '').trim() || null,
      newsItemId: String(formData.get('newsItemId') ?? '').trim() || null,
      profile: profileSchema.parse(requiredValue(formData, 'profile')),
      sentiment: sentimentSchema.parse(requiredValue(formData, 'sentiment')),
    }
  }

  return { content: requiredValue(formData, 'content') }
}
