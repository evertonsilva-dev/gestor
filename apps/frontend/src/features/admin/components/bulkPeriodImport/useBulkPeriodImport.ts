import { useState, type ChangeEvent } from 'react'
import type { BulkPeriodItemInput } from '@/hooks/useAdminMonitoring/types'
import type { AudienceProfile } from '@/hooks/usePeriodItems/types'
import { parseCommentBlock, parseNewsImport, type NewsImportRow, type Sentiment } from '../../services/bulkImport'
import { bulkImportPageSize, type BulkImportType, type CommentDraft } from './types'

interface UseBulkPeriodImportProps {
  periodId: string
  bulkImportItems: (
    periodId: string,
    type: 'news' | 'comment',
    items: BulkPeriodItemInput[],
  ) => Promise<{ inserted: number; duplicates: number }>
  onImported: () => Promise<void>
}

export function useBulkPeriodImport({
  periodId,
  bulkImportItems,
  onImported,
}: UseBulkPeriodImportProps) {
  const [type, setType] = useState<BulkImportType>('comment')
  const [text, setText] = useState('')
  const [channelId, setChannelId] = useState('')
  const [sourcePageId, setSourcePageId] = useState('')
  const [newsItemId, setNewsItemId] = useState('')
  const [newsRows, setNewsRows] = useState<NewsImportRow[]>([])
  const [comments, setComments] = useState<CommentDraft[]>([])
  const [page, setPage] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const draftsCount = type === 'news' ? newsRows.length : comments.length
  const pageCount = Math.max(1, Math.ceil(draftsCount / bulkImportPageSize))
  const visibleComments = comments.slice(page * bulkImportPageSize, (page + 1) * bulkImportPageSize)
  const invalidNewsCount = newsRows.filter((row) => row.error).length

  function buildPreview() {
    setError(null)
    setFeedback(null)
    setPage(0)

    try {
      if (type === 'news') {
        setNewsRows(parseNewsImport(text))
        setComments([])
      } else {
        setComments(parseCommentBlock(text).map((content) => ({
          content,
          sentiment: '',
          profile: '',
        })))
        setNewsRows([])
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível interpretar os dados.')
    }
  }

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    try {
      setText(await file.text())
      setError(null)
      setFeedback(`${file.name} carregado. Gere a prévia para validar as linhas.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível ler o arquivo selecionado.')
    } finally {
      input.value = ''
    }
  }

  function downloadTemplate() {
    const template = 'title,sourceUrl,sentiment,notes\n"Exemplo de notícia",https://example.com,,"Anotações opcionais"\n'
    const url = URL.createObjectURL(new Blob([template], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'modelo-noticias-arquea.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function changeType(value: string) {
    if (value !== 'news' && value !== 'comment') return
    setType(value)
    setNewsRows([])
    setComments([])
    setPage(0)
    setError(null)
    setFeedback(null)
  }

  function selectChannel(id: string) {
    setChannelId(id)
    setSourcePageId('')
    setNewsItemId('')
  }

  function updateComment(index: number, changes: Partial<CommentDraft>) {
    setComments((current) => current.map((comment, rowIndex) => (
      rowIndex === index ? { ...comment, ...changes } : comment
    )))
  }

  function updateNewsSentiment(index: number, sentiment: Sentiment | '') {
    setNewsRows((current) => current.map((row, rowIndex) => {
      if (rowIndex !== index) return row

      return {
        ...row,
        sentiment,
        error: row.error === 'Informe o sentimento como positivo, neutro ou negativo.' && sentiment
          ? null
          : row.error,
      }
    }))
  }

  function removeComment(index: number) {
    setComments((current) => current.filter((_, rowIndex) => rowIndex !== index))
    setPage((currentPage) => Math.min(
      currentPage,
      Math.max(0, Math.ceil((comments.length - 1) / bulkImportPageSize) - 1),
    ))
  }

  async function saveBatch() {
    setError(null)
    setFeedback(null)

    if (!channelId) {
      setError('Selecione o canal associado ao conteúdo importado.')
      return
    }

    if (type === 'news' && newsRows.some((row) => row.error)) {
      setError('Corrija todas as linhas inválidas do arquivo antes de importar.')
      return
    }

    if (type === 'comment' && comments.some((comment) => (
      !comment.content || comment.content.length > 4000 || !comment.profile
    ))) {
      setError('Classifique o perfil de cada comentário antes de importar.')
      return
    }

    const items: BulkPeriodItemInput[] = type === 'news'
      ? newsRows.map((row) => ({
        channelId,
        sourcePageId: sourcePageId || null,
        title: row.title,
        sourceUrl: row.sourceUrl,
        ...(row.sentiment ? { sentiment: row.sentiment } : {}),
        notes: row.notes,
      }))
      : comments.map((comment) => ({
        channelId,
        sourcePageId: sourcePageId || null,
        content: comment.content,
        newsItemId: newsItemId || null,
        profile: comment.profile as AudienceProfile,
        ...(comment.sentiment ? { sentiment: comment.sentiment } : {}),
      }))

    if (items.length === 0) {
      setError('Gere uma prévia com pelo menos um registro antes de importar.')
      return
    }

    setBusy(true)
    let inserted = 0
    let duplicates = 0
    try {
      for (let offset = 0; offset < items.length; offset += 500) {
        const result = await bulkImportItems(periodId, type, items.slice(offset, offset + 500))
        inserted += result.inserted
        duplicates += result.duplicates
      }
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Falha ao importar o lote.'
      setError(inserted > 0
        ? `${message} ${inserted} registro(s) já foram salvos; os demais podem ser reenviados com segurança.`
        : message)
      setBusy(false)
      return
    }

    setFeedback(`${inserted} registro(s) importado(s); ${duplicates} duplicado(s) ignorado(s).`)
    setNewsRows([])
    setComments([])
    setText('')
    try {
      await onImported()
    } catch (reason) {
      setError(reason instanceof Error
        ? `Importação concluída, mas a lista não foi atualizada: ${reason.message}`
        : 'Importação concluída, mas a lista não foi atualizada.')
    } finally {
      setBusy(false)
    }
  }

  return {
    type,
    text,
    channelId,
    sourcePageId,
    newsItemId,
    newsRows,
    comments,
    page,
    pageCount,
    draftsCount,
    visibleComments,
    invalidNewsCount,
    error,
    feedback,
    busy,
    setText,
    setChannelId,
    selectChannel,
    setSourcePageId,
    setNewsItemId,
    setPage,
    buildPreview,
    loadFile,
    downloadTemplate,
    changeType,
    updateComment,
    updateNewsSentiment,
    removeComment,
    saveBatch,
  }
}
