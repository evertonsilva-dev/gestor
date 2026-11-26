import { describe, expect, it } from 'vitest'
import { parseCommentBlock, parseNewsImport } from './bulkImport'

describe('parseNewsImport', () => {
  it('reads quoted delimiters and Portuguese sentiment values', () => {
    const rows = parseNewsImport([
      'title;url;sentimento;anotações',
      '"Ação, hoje";https://example.com/noticia;positivo;"nota; com detalhe"',
    ].join('\n'))

    expect(rows).toEqual([{
      line: 2,
      title: 'Ação, hoje',
      sourceUrl: 'https://example.com/noticia',
      sentiment: 'positive',
      notes: 'nota; com detalhe',
      error: null,
    }])
  })

  it('reports invalid rows without discarding valid rows', () => {
    const rows = parseNewsImport([
      'title,sourceUrl,sentiment,notes',
      'Matéria,not-a-url,positivo,',
      'Outra matéria,https://example.com,desconhecido,',
    ].join('\n'))

    expect(rows.map((row) => row.error)).toEqual([
      'Informe um link http:// ou https:// válido.',
      'Informe o sentimento como positivo, neutro ou negativo.',
    ])
  })

  it('allows an omitted or blank sentiment for automatic classification', () => {
    expect(parseNewsImport([
      'title,sourceUrl,notes',
      'Notícia sem sentimento,,',
    ].join('\n'))[0]).toMatchObject({
      sentiment: '',
      error: null,
    })

    expect(parseNewsImport([
      'title,sentiment',
      'Notícia com sentimento vazio,',
    ].join('\n'))[0]).toMatchObject({
      sentiment: '',
      error: null,
    })
  })
})

describe('parseCommentBlock', () => {
  it('splits lines or blank-line-separated multiline comments and preserves emoji', () => {
    expect(parseCommentBlock('Ótimo trabalho 👏\n\nUma frase\nem duas linhas')).toEqual([
      'Ótimo trabalho 👏',
      'Uma frase\nem duas linhas',
    ])
  })

  it('returns no comments for blank input', () => {
    expect(parseCommentBlock(' \n  ')).toEqual([])
  })
})
