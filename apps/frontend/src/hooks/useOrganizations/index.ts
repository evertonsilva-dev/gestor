import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'
import type { Organization } from '@/types/domain'
import type { UseOrganizationsResult } from './types'

export function useOrganizations(): UseOrganizationsResult {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      setOrganizations(await apiRequest<Organization[]>('/api/admin/organizations'))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Falha ao carregar as organizações.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const createOrganization = useCallback(async (name: string, slug: string) => {
    await apiRequest('/api/admin/organizations', {
      method: 'POST',
      body: JSON.stringify({ name, slug }),
    })
    await refresh()
  }, [refresh])

  const updateOrganization = useCallback(async (id: string, update: { name?: string; active?: boolean }) => {
    await apiRequest(`/api/admin/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    })
    await refresh()
  }, [refresh])

  return { organizations, isLoading, error, createOrganization, updateOrganization, refresh }
}
