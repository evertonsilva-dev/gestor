import { LoadingScreen } from '@/components/loadingScreen'
import { Notice } from '@/components/notice'
import { DashboardReport } from '../../components/dashboardReport'
import { useDashboardPage } from './useDashboardPage'
import { ErrorPanel } from './styles'

export function DashboardPage() {
  const page = useDashboardPage()
  const { data, isLoading, error, refresh } = page.dashboardState

  if (isLoading) return <LoadingScreen label="Carregando relatório" />
  if (error) {
    return (
      <ErrorPanel>
        <Notice tone="error">{error}</Notice>
        <button type="button" onClick={refresh}>Tentar novamente</button>
      </ErrorPanel>
    )
  }
  if (!data || !page.profile) return <Notice tone="error">Não foi possível carregar o ambiente desta organização.</Notice>

  return (
    <DashboardReport
      data={data}
      selectedPeriodId={page.periodId || data.selectedPeriod?.id || ''}
      onPeriodChange={page.setPeriodId}
    />
  )
}
