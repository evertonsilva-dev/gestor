import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ConfigurationError, ServiceUnavailableError } from '../functions/_lib/http'
import { classifyMissingSentiments, type SentimentAiBinding } from '../functions/_lib/sentiment'

describe('classifyMissingSentiments', () => {
  it('classifies every comment without a selected sentiment and preserves manual choices', async () => {
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
      { content: 'Comentário com sentimento manual', sentiment: 'positive' },
      { content: 'Comentário sem sentimento 1' },
      { content: 'Comentário sem sentimento 2' },
    ], (item) => item.content)

    expect(result.map((item) => item.sentiment)).toEqual(['positive', 'neutral', 'neutral'])
    expect(result.map((item) => item.sentimentSource)).toEqual(['manual', 'ai', 'ai'])
    expect(sentTexts).toEqual([['Comentário sem sentimento 1', 'Comentário sem sentimento 2']])
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

  it('retries incomplete analysis batches in smaller chunks', async () => {
    const calls: string[][] = []
    const warningLog = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const ai: SentimentAiBinding = {
      async run(_model, input) {
        const { texts } = z.object({ texts: z.array(z.string()) }).parse(JSON.parse(input.messages[1].content))
        calls.push(texts)
        const items = texts.length > 2 ? texts.slice(0, -1) : texts
        return { response: {
          analyses: items.map((text) => ({
            sentiment: text.toLocaleLowerCase('pt-BR').includes('crítica') ? 'negative' : 'positive',
            reason: 'Classificação do comentário.',
            matchedKeywords: [],
          })),
        } }
      },
    }

    const result = await classifyMissingSentiments(
      ai,
      ['Elogio A', 'Crítica B', 'Elogio C', 'Crítica D'].map((text) => ({ text })),
      (item) => item.text,
    )

    expect(result.map((item) => item.sentiment)).toEqual(['positive', 'negative', 'positive', 'negative'])
    expect(calls).toEqual([
      ['Elogio A', 'Crítica B', 'Elogio C', 'Crítica D'],
      ['Elogio A', 'Crítica B'],
      ['Elogio C', 'Crítica D'],
    ])
    expect(warningLog).toHaveBeenCalledWith(
      'Workers AI returned an incomplete sentiment batch; retrying with smaller batches',
      expect.objectContaining({
        stage: 'analysis_count_mismatch',
        expectedAnalysisCount: 4,
        receivedAnalysisCount: 3,
        retryingWithSmallerBatches: true,
      }),
    )
    expect(JSON.stringify(warningLog.mock.calls)).not.toContain('Elogio')
    warningLog.mockRestore()
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

  it('keeps comments about their source page separate from organization sentiment', async () => {
    const prompts: string[] = []
    const ai: SentimentAiBinding = {
      async run(_model, input) {
        prompts.push(input.messages[0].content)
        const { texts } = z.object({ texts: z.array(z.string()) }).parse(JSON.parse(input.messages[1].content))
        return { response: {
          analyses: texts.map(() => ({
            sentiment: 'neutral',
            reason: 'O comentário fala apenas da página de origem.',
            matchedKeywords: [],
          })),
        } }
      },
    }

    await classifyMissingSentiments(
      ai,
      [{ text: 'Essa página é ótima.' }],
      (item) => item.text,
      { organizationName: 'Organização Exemplo', topics: [] },
      'comment',
    )
    await classifyMissingSentiments(
      ai,
      [{ text: 'Essa notícia é ótima.' }],
      (item) => item.text,
      { organizationName: 'Organização Exemplo', topics: [] },
      'news',
    )

    expect(prompts[0]).toContain('a página de origem é apenas a fonte e não representa a organização')
    expect(prompts[0]).toContain('devem ser neutral')
    expect(prompts[1]).not.toContain('a página de origem é apenas a fonte')
  })
})
