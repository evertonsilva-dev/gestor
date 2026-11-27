import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'

export interface MonitoredTopic {
  id: string
  organizationId: string
  name: string
  keywords: string[]
  active: boolean
}

export function useOrganizationTopics(organizationId: string) {
  const [topics, setTopics] = useState<MonitoredTopic[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!organizationId) {
      setTopics([])
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const query = `?organizationId=${encodeURIComponent(organizationId)}`
      setTopics(await apiRequest<MonitoredTopic[]>(`/api/admin/topics${query}`))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Falha ao carregar os assuntos monitorados.')
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  useEffect(() => { void refresh() }, [refresh])

  const createTopic = useCallback(async (name: string, keywords: string[]) => {
    if (!organizationId) throw new Error('Selecione uma organização.')
    await apiRequest('/api/admin/topics', {
      method: 'POST',
      body: JSON.stringify({ organizationId, name, keywords }),
    })
    await refresh()
  }, [organizationId, refresh])

  const updateTopic = useCallback(async (
    id: string,
    changes: { name?: string; keywords?: string[]; active?: boolean },
  ) => {
    await apiRequest(`/api/admin/topics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    })
    await refresh()
  }, [refresh])

  return { topics, isLoading, error, refresh, createTopic, updateTopic }
}
