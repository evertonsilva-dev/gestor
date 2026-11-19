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

function dateTimeValue(formData: FormData, field: string): string {
  const value = requiredValue(formData, field)
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error('Informe uma data e hora válidas.')
  }

  return date.toISOString()
}

export function buildPeriodItem(formData: FormData): PeriodItemInput {
  const type = requiredValue(formData, 'type')

  if (type === 'news') {
    const sourceUrl = String(formData.get('sourceUrl') ?? '').trim()
    return {
      type,
      channelId: requiredValue(formData, 'channelId'),
      title: requiredValue(formData, 'title'),
      sourceUrl: sourceUrl || null,
      publishedAt: dateTimeValue(formData, 'publishedAt'),
      sentiment: sentimentSchema.parse(requiredValue(formData, 'sentiment')),
      notes: String(formData.get('notes') ?? '').trim() || null,
    }
  }

  if (type === 'comment') {
    return {
      type,
      channelId: requiredValue(formData, 'channelId'),
      content: requiredValue(formData, 'content'),
      commentedAt: dateTimeValue(formData, 'commentedAt'),
      profile: profileSchema.parse(requiredValue(formData, 'profile')),
      sentiment: sentimentSchema.parse(requiredValue(formData, 'sentiment')),
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
    return { title: requiredValue(formData, 'title') }
  }

  return { content: requiredValue(formData, 'content') }
}
