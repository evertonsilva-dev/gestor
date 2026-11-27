import { useEffect, useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useOrganizations } from '@/hooks/useOrganizations'

export function useAdminOverviewPage() {
  const organizationsState = useOrganizations()
  const [organizationId, setOrganizationId] = useState('')
  const [periodId, setPeriodId] = useState('')
  const dashboardState = useDashboard(organizationId || null, periodId || null)

  useEffect(() => {
    if (!organizationId && organizationsState.organizations.length > 0) {
      setOrganizationId(
        organizationsState.organizations.find((organization) => organization.active)?.id ?? '',
      )
    }
  }, [organizationId, organizationsState.organizations])

  function selectOrganization(id: string) {
    setOrganizationId(id)
    setPeriodId('')
  }

  return {
    organizationsState,
    organizationId,
    selectOrganization,
    periodId,
    setPeriodId,
    dashboardState,
  }
}
