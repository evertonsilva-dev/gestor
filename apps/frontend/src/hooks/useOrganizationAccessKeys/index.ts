import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'
import type {
  ClientAccessKey,
  CreatedClientAccessKey,
  UseOrganizationAccessKeysResult,
} from './types'

export function useOrganizationAccessKeys(organizationId: string): UseOrganizationAccessKeysResult {
  const [keys, setKeys] = useState<ClientAccessKey[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!organizationId) {
      setKeys([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      setKeys(await apiRequest<ClientAccessKey[]>(
        `/api/admin/organizations/${organizationId}/access-keys`,
      ))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Falha ao carregar as chaves de acesso.')
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  useEffect(() => { void refresh() }, [refresh])

  const createAccessKey = useCallback(async (label: string) => {
    const created = await apiRequest<CreatedClientAccessKey>(
      `/api/admin/organizations/${organizationId}/access-keys`,
      { method: 'POST', body: JSON.stringify({ label }) },
    )
    await refresh()
    return created
  }, [organizationId, refresh])

  const revokeAccessKey = useCallback(async (id: string) => {
    await apiRequest(
      `/api/admin/organizations/${organizationId}/access-keys/${id}`,
      { method: 'DELETE' },
    )
    await refresh()
  }, [organizationId, refresh])

  return { keys, isLoading, error, refresh, createAccessKey, revokeAccessKey }
}
