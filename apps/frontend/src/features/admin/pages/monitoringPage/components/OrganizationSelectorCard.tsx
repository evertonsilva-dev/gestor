import { Card } from '@/components/card'
import { FormField } from '@/components/formField'

interface OrganizationSelectorCardProps {
  organizations: Array<{ id: string; name: string }>
  value: string
  onChange: (id: string) => void
}

export function OrganizationSelectorCard({
  organizations,
  value,
  onChange,
}: OrganizationSelectorCardProps) {
  return (
    <Card title="Organização monitorada" subtitle="A configuração dos canais e relatórios é feita por organização.">
      <FormField
        as="select"
        label="Organização"
        value={value}
        options={organizations.map((organization) => ({
          value: organization.id,
          label: organization.name,
        }))}
        onChange={onChange}
      />
    </Card>
  )
}
