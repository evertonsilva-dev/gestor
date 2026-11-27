import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'

export type SourcePageAffinity = 'allied' | 'neutral' | 'critical'

export interface SourcePageAffinityReview {
  sourcePageId: string
  sourcePageName: string
  sourcePageUrl: string | null
  channelName: string
  postCount: number
  positive: number
  neutral: number
  negative: number
  suggestedAffinity: SourcePageAffinity | null
  reviewedAffinity: SourcePageAffinity | null
  reviewedAt: string | null
}

export function useSourcePageAffinity(periodId: string | null) {
  const [reviews, setReviews] = useState<SourcePageAffinityReview[]>([])
  const [selectedAffinities, setSelectedAffinities] = useState<Record<string, SourcePageAffinity>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [busyPageId, setBusyPageId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!periodId) {
      setReviews([])
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const nextReviews = await apiRequest<SourcePageAffinityReview[]>(
        `/api/admin/periods/${periodId}/source-page-affinity`,
      )
      setReviews(nextReviews)
      setSelectedAffinities((current) => Object.fromEntries(
        nextReviews.flatMap((review) => {
          const value = current[review.sourcePageId]
            ?? review.reviewedAffinity
            ?? review.suggestedAffinity
          return value ? [[review.sourcePageId, value]] : []
        }),
      ))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Falha ao carregar as afinidades das páginas.')
    } finally {
      setIsLoading(false)
    }
  }, [periodId])

  useEffect(() => { void refresh() }, [refresh])

  const selectAffinity = useCallback((sourcePageId: string, affinity: SourcePageAffinity) => {
    setSelectedAffinities((current) => ({ ...current, [sourcePageId]: affinity }))
  }, [])

  const review = useCallback(async (sourcePageId: string) => {
    if (!periodId) throw new Error('Selecione um período.')
    const affinity = selectedAffinities[sourcePageId]
    if (!affinity) throw new Error('Selecione uma afinidade.')

    setBusyPageId(sourcePageId)
    setError(null)
    setFeedback(null)
    try {
      await apiRequest(`/api/admin/periods/${periodId}/source-page-affinity`, {
        method: 'POST',
        body: JSON.stringify({ sourcePageId, affinity }),
      })
      setFeedback('Revisão de afinidade salva.')
      await refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar a revisão.')
    } finally {
      setBusyPageId(null)
    }
  }, [periodId, refresh, selectedAffinities])

  return {
    reviews,
    selectedAffinities,
    isLoading,
    busyPageId,
    error,
    feedback,
    selectAffinity,
    review,
  }
}
