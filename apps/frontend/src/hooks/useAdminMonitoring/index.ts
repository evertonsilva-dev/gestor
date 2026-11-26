import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'
import type { MonitoringPeriod } from '@/types/domain'
import type {
  Channel,
  SourcePage,
  BulkPeriodItemInput,
  PeriodItemInput,
  UseAdminMonitoringResult,
} from './types'

export function useAdminMonitoring(organizationId: string | null): UseAdminMonitoringResult {
  const [channels, setChannels] = useState<Channel[]>([])
  const [sourcePages, setSourcePages] = useState<SourcePage[]>([])
  const [periods, setPeriods] = useState<MonitoringPeriod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!organizationId) {
      setChannels([])
      setSourcePages([])
      setPeriods([])
      return
    }

    setIsLoading(true)
    setError(null)
    const query = `?organizationId=${encodeURIComponent(organizationId)}`

    try {
      const [nextChannels, nextSourcePages, nextPeriods] = await Promise.all([
        apiRequest<Channel[]>(`/api/admin/channels${query}`),
        apiRequest<SourcePage[]>(`/api/admin/source-pages${query}`),
        apiRequest<MonitoringPeriod[]>(`/api/admin/periods${query}`),
      ])
      setChannels(nextChannels)
      setSourcePages(nextSourcePages)
      setPeriods(nextPeriods)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Falha ao carregar os dados de monitoramento.')
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  useEffect(() => { void refresh() }, [refresh])

  const createChannel = useCallback(async (name: string) => {
    if (!organizationId) throw new Error('Selecione uma organização.')
    await apiRequest('/api/admin/channels', {
      method: 'POST',
      body: JSON.stringify({ organizationId, name }),
    })
    await refresh()
  }, [organizationId, refresh])

  const setChannelActive = useCallback(async (id: string, active: boolean) => {
    await apiRequest(`/api/admin/channels/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    })
    await refresh()
  }, [refresh])

  const createSourcePage = useCallback(async (input: { channelId: string; name: string; url: string | null }) => {
    if (!organizationId) throw new Error('Selecione uma organização.')
    await apiRequest('/api/admin/source-pages', {
      method: 'POST',
      body: JSON.stringify({ ...input, organizationId }),
    })
    await refresh()
  }, [organizationId, refresh])

  const updateSourcePage = useCallback(async (
    id: string,
    changes: { name?: string; url?: string | null; active?: boolean },
  ) => {
    await apiRequest(`/api/admin/source-pages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    })
    await refresh()
  }, [refresh])

  const createPeriod = useCallback(async (startDate: string, endDate: string) => {
    if (!organizationId) throw new Error('Selecione uma organização.')
    await apiRequest('/api/admin/periods', {
      method: 'POST',
      body: JSON.stringify({ organizationId, startDate, endDate }),
    })
    await refresh()
  }, [organizationId, refresh])

  const updatePeriod = useCallback(async (id: string, changes: { startDate?: string; endDate?: string }) => {
    await apiRequest(`/api/admin/periods/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    })
    await refresh()
  }, [refresh])

  const createItem = useCallback(async (periodId: string, item: PeriodItemInput) => {
    await apiRequest(`/api/admin/periods/${periodId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }, [])

  const bulkImportItems = useCallback(async (
    periodId: string,
    type: 'news' | 'comment',
    items: BulkPeriodItemInput[],
  ) => {
    return apiRequest<{ inserted: number; duplicates: number }>(`/api/admin/periods/${periodId}/items/bulk`, {
      method: 'POST',
      body: JSON.stringify({ type, items }),
    })
  }, [])

  const publishPeriod = useCallback(async (periodId: string) => {
    await apiRequest(`/api/admin/periods/${periodId}/publish`, { method: 'POST' })
    await refresh()
  }, [refresh])

  return {
    channels,
    sourcePages,
    periods,
    isLoading,
    error,
    refresh,
    createChannel,
    setChannelActive,
    createSourcePage,
    updateSourcePage,
    createPeriod,
    updatePeriod,
    createItem,
    bulkImportItems,
    publishPeriod,
  }
}
