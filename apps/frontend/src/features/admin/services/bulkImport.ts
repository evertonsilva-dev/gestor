export type Sentiment = 'positive' | 'neutral' | 'negative'

export interface NewsImportRow {
  line: number
  title: string
  sourceUrl: string | null
  sentiment: Sentiment | ''
  notes: string | null
  error: string | null
}

function parseRecords(input: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]

    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        field += character
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true
    } else if (character === delimiter) {
      row.push(field)
      field = ''
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && input[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some((value) => value.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  if (quoted) throw new Error('O CSV contém aspas sem fechamento.')
  row.push(field)
  if (row.some((value) => value.trim() !== '')) rows.push(row)
  return rows
}

function delimiterFor(header: string): string {
  if (header.includes('\t')) return '\t'
  const semicolons = (header.match(/;/g) ?? []).length
  const commas = (header.match(/,/g) ?? []).length
  return semicolons > commas ? ';' : ','
}

function sentimentValue(value: string): Sentiment | '' {
  const normalized = value.trim().toLocaleLowerCase('pt-BR')
  if (['positive', 'positivo', 'favorável', 'favoravel'].includes(normalized)) return 'positive'
  if (['negative', 'negativo', 'crítico', 'critico'].includes(normalized)) return 'negative'
  if (['neutral', 'neutro'].includes(normalized)) return 'neutral'
  return ''
}

export function parseNewsImport(input: string): NewsImportRow[] {
  const firstLine = input.split(/\r?\n/, 1)[0] ?? ''
  const records = parseRecords(input.replace(/^\uFEFF/, ''), delimiterFor(firstLine))
  if (records.length < 2) throw new Error('Inclua um cabeçalho e pelo menos uma notícia.')

  const headers = records[0].map((value) => value.trim().toLocaleLowerCase('pt-BR'))
  const titleIndex = headers.findIndex((value) => ['title', 'titulo', 'título'].includes(value))
  const sourceIndex = headers.findIndex((value) => ['sourceurl', 'url', 'link'].includes(value))
  const sentimentIndex = headers.findIndex((value) => ['sentiment', 'sentimento'].includes(value))
  const notesIndex = headers.findIndex((value) => ['notes', 'anotacoes', 'anotações'].includes(value))

  if (titleIndex < 0) {
    throw new Error('O cabeçalho deve incluir a coluna title/título.')
  }

  return records.slice(1).map((record, index) => {
    const title = record[titleIndex]?.trim() ?? ''
    const sourceValue = sourceIndex >= 0 ? record[sourceIndex]?.trim() ?? '' : ''
    const rawSentiment = sentimentIndex >= 0 ? record[sentimentIndex]?.trim() ?? '' : ''
    const sentiment = sentimentValue(rawSentiment)
    const notes = notesIndex >= 0 ? record[notesIndex]?.trim() ?? '' : ''
    let error: string | null = null

    if (record.length !== headers.length) error = 'Número de colunas diferente do cabeçalho.'
    else if (title.length < 3 || title.length > 500) error = 'O título deve ter entre 3 e 500 caracteres.'
    else if (rawSentiment && !sentiment) error = 'Informe o sentimento como positivo, neutro ou negativo.'
    else if (sourceValue && !isHttpUrl(sourceValue)) error = 'Informe um link http:// ou https:// válido.'
    else if (notes.length > 4000) error = 'As anotações excedem 4.000 caracteres.'

    return {
      line: index + 2,
      title,
      sourceUrl: sourceValue || null,
      sentiment,
      notes: notes || null,
      error,
    }
  })
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function parseCommentBlock(input: string): string[] {
  const normalized = input.replace(/\r\n?/g, '\n').trim()
  if (!normalized) return []

  const separator = /\n[ \t]*\n/.test(normalized) ? /\n[ \t]*\n+/ : /\n/
  return normalized
    .split(separator)
    .map((comment) => comment.trim())
    .filter(Boolean)
}
