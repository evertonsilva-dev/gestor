import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'
import type { DashboardData } from '@/types/domain'
import type { UseDashboardResult } from './types'

export function useDashboard(
  organizationId: string | null,
  periodId: string | null,
  useSignedInOrganization = false,
): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((current) => current + 1), [])

  useEffect(() => {
    let active = true
    if (!organizationId && !useSignedInOrganization) {
      setData(null)
      setError(null)
      setIsLoading(false)
      return () => { active = false }
    }

    const parameters = new URLSearchParams()
    if (organizationId) parameters.set('organizationId', organizationId)
    if (periodId) parameters.set('periodId', periodId)

    setIsLoading(true)
    setError(null)
    void apiRequest<DashboardData>(`/api/dashboard?${parameters.toString()}`)
      .then((result) => {
        if (active) setData(result)
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Falha ao carregar o relatório.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [organizationId, periodId, refreshKey, useSignedInOrganization])

  return { data, isLoading, error, refresh }
}
