import { useState } from 'react'
import { LoadingScreen } from '@/components/loadingScreen'
import { Notice } from '@/components/notice'
import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'
import { DashboardReport } from '../../components/dashboardReport'
import { ErrorPanel } from './styles'

export function DashboardPage() {
  const { profile } = useAuth()
  const [periodId, setPeriodId] = useState('')
  const { data, isLoading, error, refresh } = useDashboard(null, periodId || null, true)

  if (isLoading) return <LoadingScreen label="Carregando relatório" />
  if (error) {
    return (
      <ErrorPanel>
        <Notice tone="error">{error}</Notice>
        <button type="button" onClick={refresh}>Tentar novamente</button>
      </ErrorPanel>
    )
  }
  if (!data || !profile) return <Notice tone="error">Não foi possível carregar o ambiente desta organização.</Notice>

  return (
    <DashboardReport
      data={data}
      selectedPeriodId={periodId || data.selectedPeriod?.id || ''}
      onPeriodChange={setPeriodId}
    />
  )
}
