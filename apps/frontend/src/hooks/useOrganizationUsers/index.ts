import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'
import type { OrganizationUser, UseOrganizationUsersResult } from './types'

export function useOrganizationUsers(organizationId: string): UseOrganizationUsersResult {
  const [users, setUsers] = useState<OrganizationUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!organizationId) {
      setUsers([])
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const query = `?organizationId=${encodeURIComponent(organizationId)}`
      setUsers(await apiRequest<OrganizationUser[]>(`/api/admin/users${query}`))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Falha ao carregar os acessos.')
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  useEffect(() => { void refresh() }, [refresh])

  const setUserActive = useCallback(async (authUserId: string, active: boolean) => {
    await apiRequest(`/api/admin/users/${encodeURIComponent(authUserId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    })
    await refresh()
  }, [refresh])

  return { users, error, isLoading, refresh, setUserActive }
}
