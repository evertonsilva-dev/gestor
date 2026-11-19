import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/card'
import { FormField } from '@/components/formField'
import { LoadingScreen } from '@/components/loadingScreen'
import { Notice } from '@/components/notice'
import { useDashboard } from '@/hooks/useDashboard'
import { useOrganizations } from '@/hooks/useOrganizations'
import { DashboardReport } from '@/features/dashboard/components/dashboardReport'
import { ActionLink, Links, Stack } from './styles'

export function AdminOverviewPage() {
  const { organizations, isLoading: organizationsLoading, error: organizationsError } = useOrganizations()
  const [organizationId, setOrganizationId] = useState('')
  const [periodId, setPeriodId] = useState('')
  const { data, isLoading, error } = useDashboard(organizationId || null, periodId || null)

  useEffect(() => {
    if (!organizationId && organizations.length > 0) {
      setOrganizationId(organizations.find((organization) => organization.active)?.id ?? '')
    }
  }, [organizationId, organizations])

  if (organizationsLoading) return <LoadingScreen label="Carregando organizações" />
  if (organizationsError) return <Notice tone="error">{organizationsError}</Notice>

  return (
    <Stack>
      <Card title="Visão geral" subtitle="Acompanhe os relatórios publicados e acesse as rotinas de gestão.">
        <Links>
          <ActionLink to="/admin/organizations">
            Gerenciar organizações e acessos <ArrowUpRight size={17} />
          </ActionLink>
          <ActionLink to="/admin/monitoring">
            Cadastrar monitoramento diário <ArrowUpRight size={17} />
          </ActionLink>
        </Links>
      </Card>
      {organizations.length === 0 ? (
        <Notice>Cadastre uma organização para iniciar a plataforma.</Notice>
      ) : (
        <>
          <Card title="Visualizar ambiente" subtitle="A administradora pode consultar os relatórios de todas as organizações.">
            <FormField
              as="select"
              label="Organização"
              value={organizationId}
              onChange={(value) => {
                setOrganizationId(value)
                setPeriodId('')
              }}
              options={organizations.filter((organization) => organization.active).map((organization) => ({
                value: organization.id,
                label: organization.name,
              }))}
            />
          </Card>
          {isLoading && <LoadingScreen label="Carregando relatório" />}
          {error && <Notice tone="error">{error}</Notice>}
          {data && (
            <DashboardReport
              data={data}
              selectedPeriodId={periodId || data.selectedPeriod?.id || ''}
              onPeriodChange={setPeriodId}
            />
          )}
        </>
      )}
    </Stack>
  )
}
