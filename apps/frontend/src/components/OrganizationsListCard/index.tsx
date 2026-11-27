import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Notice } from '@/components/Notice'
import { Building2, RefreshCw } from 'lucide-react'
import type { Organization } from '@/types/domain'
import {
  AdminCardBadge,
  List,
  OrganizationIcon,
  OrganizationIdentity,
  OrganizationMeta,
  OrganizationRow,
  OrganizationSlug,
  OrganizationState,
} from '@/pages/OrganizationsPage/styles'

interface OrganizationsListCardProps {
  organizations: Organization[]
  error: string | null
  actionError: string | null
  actionSuccess: string | null
  onToggle: (id: string, active: boolean) => void
  onRefresh: () => void
}

export function OrganizationsListCard({
  organizations,
  error,
  actionError,
  actionSuccess,
  onToggle,
  onRefresh,
}: OrganizationsListCardProps) {
  const activeCount = organizations.filter((organization) => organization.active).length

  return (
    <Card
      title="Organizações cadastradas"
      subtitle={`${organizations.length} ${organizations.length === 1 ? 'organização' : 'organizações'} no ambiente`}
      action={<AdminCardBadge><Building2 size={14} /> {activeCount} ativas</AdminCardBadge>}
    >
      {error && <Notice tone="error">{error}</Notice>}
      {actionError && <Notice tone="error">{actionError}</Notice>}
      {actionSuccess && <Notice tone="success">{actionSuccess}</Notice>}
      {organizations.length === 0 ? <p>Nenhuma organização cadastrada.</p> : (
        <List>
          {organizations.map((organization) => (
            <OrganizationRow key={organization.id}>
              <OrganizationIdentity>
                <OrganizationIcon><Building2 size={18} /></OrganizationIcon>
                <div>
                  <h3>{organization.name}</h3>
                  <OrganizationMeta>
                    <OrganizationSlug>{organization.slug}</OrganizationSlug>
                    <OrganizationState $active={organization.active}>
                      {organization.active ? 'Ativa' : 'Inativa'}
                    </OrganizationState>
                  </OrganizationMeta>
                </div>
              </OrganizationIdentity>
              <Button
                size="small"
                variant={organization.active ? 'secondary' : 'primary'}
                onClick={() => onToggle(organization.id, organization.active)}
              >
                {organization.active ? 'Desativar' : 'Ativar'}
              </Button>
            </OrganizationRow>
          ))}
        </List>
      )}
      <Button size="small" variant="quiet" onClick={onRefresh}>
        <RefreshCw size={14} /> Atualizar lista
      </Button>
    </Card>
  )
}
