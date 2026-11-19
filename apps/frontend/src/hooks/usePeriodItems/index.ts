import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'
import type {
  PeriodItem,
  PeriodItemUpdate,
  PeriodItemsResponse,
  UsePeriodItemsResult,
} from './types'

export function usePeriodItems(periodId: string | null): UsePeriodItemsResult {
  const [items, setItems] = useState<PeriodItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!periodId) {
      setItems([])
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiRequest<PeriodItemsResponse>(`/api/admin/periods/${periodId}/items`)
      setItems([...response.news, ...response.comments, ...response.recommendations])
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Falha ao carregar os registros do período.')
    } finally {
      setIsLoading(false)
    }
  }, [periodId])

  useEffect(() => { void refresh() }, [refresh])

  const updateItem = useCallback(async (item: PeriodItem, changes: PeriodItemUpdate) => {
    if (!periodId) throw new Error('Selecione um período em processamento.')
    await apiRequest(`/api/admin/periods/${periodId}/items/${item.type}/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    })
    await refresh()
  }, [periodId, refresh])

  const deleteItem = useCallback(async (item: PeriodItem) => {
    if (!periodId) throw new Error('Selecione um período em processamento.')
    await apiRequest(`/api/admin/periods/${periodId}/items/${item.type}/${item.id}`, {
      method: 'DELETE',
    })
    await refresh()
  }, [periodId, refresh])

  return { items, isLoading, error, refresh, updateItem, deleteItem }
}
