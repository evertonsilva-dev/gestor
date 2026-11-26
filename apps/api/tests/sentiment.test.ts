import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ConfigurationError, ServiceUnavailableError } from '../functions/_lib/http'
import { classifyMissingSentiments, type SentimentAiBinding } from '../functions/_lib/sentiment'

describe('classifyMissingSentiments', () => {
  it('preserves explicit sentiments and sends only missing content to Workers AI', async () => {
    const sentTexts: string[][] = []
    const ai: SentimentAiBinding = {
      async run(_model, input) {
        const { texts } = z.object({ texts: z.array(z.string()) }).parse(JSON.parse(input.messages[1].content))
        sentTexts.push(texts)
        return { response: JSON.stringify({
          analyses: texts.map(() => ({
            sentiment: 'neutral',
            reason: 'O texto não expressa posição clara.',
            matchedKeywords: [],
          })),
        }) }
      },
    }

    const result = await classifyMissingSentiments(ai, [
      { title: 'Notícia rotulada', notes: 'Não enviar', sentiment: 'positive' },
      { title: 'Comentário sem rótulo', notes: 'Também não enviar' },
    ], (item) => item.title)

    expect(result.map((item) => item.sentiment)).toEqual(['positive', 'neutral'])
    expect(sentTexts).toEqual([['Comentário sem rótulo']])
  })

  it('groups missing sentiments into bounded batches', async () => {
    const batchSizes: number[] = []
    const ai: SentimentAiBinding = {
      async run(_model, input) {
        const { texts } = z.object({ texts: z.array(z.string()) }).parse(JSON.parse(input.messages[1].content))
        batchSizes.push(texts.length)
        return { response: JSON.stringify({
          analyses: texts.map(() => ({
            sentiment: 'negative',
            reason: 'O texto critica a entidade.',
            matchedKeywords: [],
          })),
        }) }
      },
    }

    const result = await classifyMissingSentiments(
      ai,
      Array.from({ length: 11 }, (_, index) => ({ text: `Texto ${index}` })),
      (item) => item.text,
    )

    expect(batchSizes.sort((left, right) => left - right)).toEqual([1, 10])
    expect(result.every((item) => item.sentiment === 'negative')).toBe(true)
  })

  it('does not need the binding when every sentiment was entered manually', async () => {
    const result = await classifyMissingSentiments(
      undefined,
      [{ text: 'Notícia', sentiment: 'negative' }],
      (item) => item.text,
    )

    expect(result[0].sentiment).toBe('negative')
  })

  it('returns an actionable error when automatic classification is not configured', async () => {
    await expect(classifyMissingSentiments(
      undefined,
      [{ text: 'Notícia' }],
      (item) => item.text,
    )).rejects.toBeInstanceOf(ConfigurationError)
  })

  it('rejects invalid model output so the caller can request a manual sentiment', async () => {
    const text = 'Texto monitorado que não deve aparecer no log.'
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const ai: SentimentAiBinding = {
      async run() {
        return { response: JSON.stringify({
          analyses: [{ sentiment: 'uncertain', reason: 'Sem rótulo válido.', matchedKeywords: [] }],
        }) }
      },
    }

    await expect(classifyMissingSentiments(
      ai,
      [{ text }],
      (item) => item.text,
    )).rejects.toBeInstanceOf(ServiceUnavailableError)

    expect(errorLog).toHaveBeenCalledWith(
      'Workers AI sentiment response validation failed',
      expect.objectContaining({
        stage: 'schema_mismatch',
        expectedAnalysisCount: 1,
        issues: expect.arrayContaining([
          expect.objectContaining({ path: ['analyses', 0, 'sentiment'] }),
        ]),
      }),
    )
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(text)
    errorLog.mockRestore()
  })

  it('logs AI request failure metadata without logging the submitted text or error message', async () => {
    const text = 'Conteúdo monitorado que não deve aparecer no log.'
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const ai: SentimentAiBinding = {
      async run() {
        throw new Error(`Workers AI rejected: ${text}`)
      },
    }

    await expect(classifyMissingSentiments(
      ai,
      [{ text }],
      (item) => item.text,
    )).rejects.toBeInstanceOf(ServiceUnavailableError)

    expect(errorLog).toHaveBeenCalledWith(
      'Workers AI sentiment request failed',
      expect.objectContaining({
        stage: 'ai_request',
        category: 'other',
        message: 'Workers AI rejected: [redacted]',
        name: 'Error',
      }),
    )
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(text)
    errorLog.mockRestore()
  })

  it('accepts the object response returned by Workers AI JSON mode', async () => {
    const ai: SentimentAiBinding = {
      async run() {
        return {
          response: {
            analyses: [{
              sentiment: 'positive',
              reason: 'O texto elogia a organização.',
              matchedKeywords: [],
            }],
          },
        }
      },
    }

    const result = await classifyMissingSentiments(
      ai,
      [{ text: 'A iniciativa recebeu elogios.' }],
      (item) => item.text,
    )

    expect(result[0]).toMatchObject({
      sentiment: 'positive',
      sentimentSource: 'ai',
      sentimentReason: 'O texto elogia a organização.',
    })
  })

  it('uses organization topics and only keeps matched configured keywords', async () => {
    let requestContext: unknown
    const ai: SentimentAiBinding = {
      async run(_model, input) {
        requestContext = JSON.parse(input.messages[1].content)
        return { response: JSON.stringify({
          analyses: [{
            sentiment: 'positive',
            reason: 'O texto elogia a iniciativa da organização.',
            matchedKeywords: ['mobilidade urbana', 'palavra inventada'],
          }],
        }) }
      },
    }

    const result = await classifyMissingSentiments(
      ai,
      [{ text: 'A iniciativa de mobilidade urbana foi elogiada.' }],
      (item) => item.text,
      {
        organizationName: 'Organização Exemplo',
        topics: [{ name: 'Projetos', keywords: ['mobilidade urbana'] }],
      },
    )

    expect(requestContext).toMatchObject({
      organizationName: 'Organização Exemplo',
      topics: [{ name: 'Projetos', keywords: ['mobilidade urbana'] }],
    })
    expect(result[0]).toMatchObject({
      sentiment: 'positive',
      sentimentSource: 'ai',
      sentimentReason: 'O texto elogia a iniciativa da organização.',
      sentimentKeywords: ['mobilidade urbana'],
    })
  })
})
