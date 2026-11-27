import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'

export function useDashboardPage() {
  const { profile } = useAuth()
  const [periodId, setPeriodId] = useState('')
  const dashboardState = useDashboard(null, periodId || null, true)

  return {
    profile,
    periodId,
    setPeriodId,
    dashboardState,
  }
}
