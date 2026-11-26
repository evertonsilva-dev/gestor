import { ArrowUpRight, Building2, Radio } from 'lucide-react'
import { Card } from '@/components/card'
import { FormField } from '@/components/formField'
import { LoadingScreen } from '@/components/loadingScreen'
import { Notice } from '@/components/notice'
import { DashboardReport } from '@/features/dashboard/components/dashboardReport'
import { useAdminOverviewPage } from './useAdminOverviewPage'
import { ActionCopy, ActionIcon, ActionLink, Links, Stack } from './styles'

export function AdminOverviewPage() {
  const page = useAdminOverviewPage()
  const { organizations, isLoading: organizationsLoading, error: organizationsError } = page.organizationsState
  const { data, isLoading, error } = page.dashboardState

  if (organizationsLoading) return <LoadingScreen label="Carregando organizações" />
  if (organizationsError) return <Notice tone="error">{organizationsError}</Notice>

  return (
    <Stack>
      <Card title="Visão geral" subtitle="Acompanhe os relatórios publicados e acesse as rotinas de gestão.">
        <Links>
          <ActionLink to="/admin/organizations">
            <ActionIcon $tone="gold"><Building2 size={18} /></ActionIcon>
            <ActionCopy>
              <strong>Organizações e acessos</strong>
              <small>Gerencie ambientes, chaves e contexto da IA</small>
            </ActionCopy>
            <ArrowUpRight size={17} />
          </ActionLink>
          <ActionLink to="/admin/monitoring">
            <ActionIcon $tone="blue"><Radio size={18} /></ActionIcon>
            <ActionCopy>
              <strong>Monitoramento</strong>
              <small>Configure canais, páginas e períodos</small>
            </ActionCopy>
            <ArrowUpRight size={17} />
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
              value={page.organizationId}
              onChange={page.selectOrganization}
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
              selectedPeriodId={page.periodId || data.selectedPeriod?.id || ''}
              onPeriodChange={page.setPeriodId}
            />
          )}
        </>
      )}
    </Stack>
  )
}
