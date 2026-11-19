import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'
import type { MonitoringPeriod } from '@/types/domain'
import type {
  Channel,
  PeriodItemInput,
  Topic,
  UseAdminMonitoringResult,
} from './types'

export function useAdminMonitoring(organizationId: string | null): UseAdminMonitoringResult {
  const [channels, setChannels] = useState<Channel[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [periods, setPeriods] = useState<MonitoringPeriod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!organizationId) {
      setChannels([])
      setTopics([])
      setPeriods([])
      return
    }

    setIsLoading(true)
    setError(null)
    const query = `?organizationId=${encodeURIComponent(organizationId)}`

    try {
      const [nextChannels, nextTopics, nextPeriods] = await Promise.all([
        apiRequest<Channel[]>(`/api/admin/channels${query}`),
        apiRequest<Topic[]>(`/api/admin/topics${query}`),
        apiRequest<MonitoringPeriod[]>(`/api/admin/periods${query}`),
      ])
      setChannels(nextChannels)
      setTopics(nextTopics)
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

  const createTopic = useCallback(async (name: string, keywords: string[]) => {
    if (!organizationId) throw new Error('Selecione uma organização.')
    await apiRequest('/api/admin/topics', {
      method: 'POST',
      body: JSON.stringify({ organizationId, name, keywords }),
    })
    await refresh()
  }, [organizationId, refresh])

  const setTopicActive = useCallback(async (id: string, active: boolean) => {
    await apiRequest(`/api/admin/topics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
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

  const createItem = useCallback(async (periodId: string, item: PeriodItemInput) => {
    await apiRequest(`/api/admin/periods/${periodId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }, [])

  const publishPeriod = useCallback(async (periodId: string) => {
    await apiRequest(`/api/admin/periods/${periodId}/publish`, { method: 'POST' })
    await refresh()
  }, [refresh])

  return {
    channels,
    topics,
    periods,
    isLoading,
    error,
    refresh,
    createChannel,
    setChannelActive,
    createTopic,
    setTopicActive,
    createPeriod,
    createItem,
    publishPeriod,
  }
}
