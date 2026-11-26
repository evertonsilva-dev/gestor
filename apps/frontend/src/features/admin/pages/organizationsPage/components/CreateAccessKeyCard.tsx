import type { FormEventHandler } from 'react'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { FormField } from '@/components/formField'
import { Notice } from '@/components/notice'
import type { Organization } from '@/types/domain'
import { AdminCardBadge, AdminFormDisclosure, Form, KeySecret } from '../styles'

interface CreateAccessKeyCardProps {
  organizations: Organization[]
  selectedOrganization: string
  createdKey: string | null
  busy: boolean
  error: string | null
  success: string | null
  onOrganizationChange: (id: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function CreateAccessKeyCard({
  organizations,
  selectedOrganization,
  createdKey,
  busy,
  error,
  success,
  onOrganizationChange,
  onSubmit,
}: CreateAccessKeyCardProps) {
  const activeOrganizations = organizations.filter((organization) => organization.active)

  return (
    <Card
      title="Chaves de acesso"
      subtitle="Cada chave é exibida uma única vez e pode ser revogada a qualquer momento."
      action={<AdminCardBadge><KeyRound size={14} /> Acesso de cliente</AdminCardBadge>}
    >
      {createdKey && (
        <Notice tone="success">
          Copie esta chave agora e envie ao cliente. Ela não poderá ser recuperada depois:
          <KeySecret>{createdKey}</KeySecret>
        </Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {success && !createdKey && <Notice tone="success">{success}</Notice>}
      <AdminFormDisclosure>
        <summary><KeyRound size={15} /> Gerar nova chave</summary>
        <Form onSubmit={onSubmit}>
          <FormField
            as="select"
            label="Organização"
            value={selectedOrganization}
            options={[
              { value: '', label: 'Selecione' },
              ...activeOrganizations.map((organization) => ({
                value: organization.id,
                label: organization.name,
              })),
            ]}
            onChange={onOrganizationChange}
            required
          />
          <FormField label="Identificação da chave" name="label" placeholder="Ex.: Conta da equipe de comunicação" required maxLength={120} />
          <Button type="submit" variant="secondary" disabled={busy || !selectedOrganization}>
            <KeyRound size={16} /> Gerar chave
          </Button>
        </Form>
      </AdminFormDisclosure>
    </Card>
  )
}
