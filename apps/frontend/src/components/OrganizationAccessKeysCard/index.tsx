import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { FormField } from '@/components/FormField'
import { Notice } from '@/components/Notice'
import { KeyRound } from 'lucide-react'
import type { ClientAccessKey } from '@/hooks/useOrganizationAccessKeys/types'
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

interface OrganizationAccessKeysCardProps {
  organizations: Organization[]
  selectedOrganization: string
  keys: ClientAccessKey[]
  isLoading: boolean
  error: string | null
  actionError: string | null
  actionSuccess: string | null
  onOrganizationChange: (id: string) => void
  onRevoke: (id: string) => void
}

export function OrganizationAccessKeysCard({
  organizations,
  selectedOrganization,
  keys,
  isLoading,
  error,
  actionError,
  actionSuccess,
  onOrganizationChange,
  onRevoke,
}: OrganizationAccessKeysCardProps) {
  const activeKeyCount = keys.filter((key) => !key.revokedAt).length

  return (
    <Card
      title="Chaves da organização"
      subtitle="Revogar uma chave encerra também as sessões ativas associadas a ela."
      action={<AdminCardBadge><KeyRound size={14} /> {activeKeyCount} ativas</AdminCardBadge>}
    >
      <FormField
        as="select"
        label="Organização"
        value={selectedOrganization}
        options={[
          { value: '', label: 'Selecione' },
          ...organizations.map((organization) => ({
            value: organization.id,
            label: organization.name,
          })),
        ]}
        onChange={onOrganizationChange}
      />
      {error && <Notice tone="error">{error}</Notice>}
      {actionError && <Notice tone="error">{actionError}</Notice>}
      {actionSuccess && <Notice tone="success">{actionSuccess}</Notice>}
      {isLoading ? <p>Carregando chaves...</p> : keys.length === 0 ? <p>Nenhuma chave cadastrada.</p> : (
        <List>
          {keys.map((key) => (
            <OrganizationRow key={key.id}>
              <OrganizationIdentity>
                <OrganizationIcon><KeyRound size={18} /></OrganizationIcon>
                <div>
                  <h3>{key.label}</h3>
                  <OrganizationMeta>
                    <OrganizationSlug>{key.keyPrefix}</OrganizationSlug>
                    <OrganizationState $active={!key.revokedAt}>
                      {key.revokedAt ? 'Revogada' : 'Ativa'}
                    </OrganizationState>
                  </OrganizationMeta>
                </div>
              </OrganizationIdentity>
              <Button
                size="small"
                variant="quiet"
                disabled={Boolean(key.revokedAt)}
                onClick={() => onRevoke(key.id)}
              >
                {key.revokedAt ? 'Revogada' : 'Revogar chave'}
              </Button>
            </OrganizationRow>
          ))}
        </List>
      )}
    </Card>
  )
}
