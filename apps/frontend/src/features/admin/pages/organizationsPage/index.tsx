import { useEffect, useState, type FormEvent } from 'react'
import { Building2, KeyRound } from 'lucide-react'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { FormField } from '@/components/formField'
import { LoadingScreen } from '@/components/loadingScreen'
import { Notice } from '@/components/notice'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useOrganizationAccessKeys } from '@/hooks/useOrganizationAccessKeys'
import { Form, Grid, KeySecret, List, OrganizationRow } from './styles'

export function OrganizationsPage() {
  const {
    organizations,
    isLoading,
    error,
    createOrganization,
    updateOrganization,
    refresh,
  } = useOrganizations()
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const accessKeys = useOrganizationAccessKeys(selectedOrganization)

  useEffect(() => {
    if (!selectedOrganization && organizations.length > 0) {
      setSelectedOrganization(organizations.find((organization) => organization.active)?.id ?? '')
    }
  }, [organizations, selectedOrganization])

  async function submitOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setFormError(null)
    setSuccess(null)
    setBusy(true)
    const formData = new FormData(form)

    try {
      await createOrganization(String(formData.get('name')), String(formData.get('slug')))
      form.reset()
      setSuccess('Organização cadastrada.')
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Não foi possível cadastrar a organização.')
    } finally {
      setBusy(false)
    }
  }

  async function submitAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setFormError(null)
    setSuccess(null)
    setBusy(true)
    const formData = new FormData(form)

    try {
      const created = await accessKeys.createAccessKey(String(formData.get('label')))
      setCreatedKey(created.accessKey)
      form.reset()
      setSuccess('Chave criada. Copie e compartilhe com o cliente; ela não será exibida novamente.')
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Não foi possível criar a chave de acesso.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleOrganization(id: string, active: boolean) {
    setFormError(null)
    setSuccess(null)

    try {
      await updateOrganization(id, { active: !active })
      setSuccess('Situação da organização atualizada.')
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Não foi possível atualizar a organização.')
    }
  }

  async function revokeClientAccessKey(id: string) {
    setFormError(null)
    setSuccess(null)

    try {
      await accessKeys.revokeAccessKey(id)
      setSuccess('Chave revogada. As sessões abertas por ela foram invalidadas.')
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Não foi possível revogar a chave.')
    }
  }

  if (isLoading) return <LoadingScreen label="Carregando organizações" />

  return (
    <Grid>
      <div>
        <Card title="Nova organização" subtitle="Cada organização terá um ambiente próprio.">
          <Form onSubmit={(event) => void submitOrganization(event)}>
            <FormField label="Nome" name="name" required maxLength={120} />
            <FormField label="Identificador (slug)" name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
            {formError && <Notice tone="error">{formError}</Notice>}
            {success && <Notice tone="success">{success}</Notice>}
            <Button type="submit" disabled={busy}><Building2 size={16} /> Cadastrar</Button>
          </Form>
        </Card>
        <Card title="Gerar chave de cliente" subtitle="A chave é exibida uma única vez e pode ser revogada a qualquer momento.">
          <Form onSubmit={(event) => void submitAccess(event)}>
            <FormField as="select" label="Organização" value={selectedOrganization} options={[
              { value: '', label: 'Selecione' },
              ...organizations.filter((organization) => organization.active).map((organization) => ({
                value: organization.id,
                label: organization.name,
              })),
            ]} onChange={(value) => {
              setSelectedOrganization(value)
              setCreatedKey(null)
            }} required>
            </FormField>
            <FormField label="Identificação da chave" name="label" placeholder="Ex.: Conta da equipe de comunicação" required maxLength={120} />
            {createdKey && (
              <Notice tone="success">
                Copie esta chave agora e envie ao cliente. Ela não poderá ser recuperada depois:
                <KeySecret>{createdKey}</KeySecret>
              </Notice>
            )}
            {formError && <Notice tone="error">{formError}</Notice>}
            {success && <Notice tone="success">{success}</Notice>}
            <Button type="submit" variant="secondary" disabled={busy || !selectedOrganization}>
              <KeyRound size={16} /> Gerar chave
            </Button>
          </Form>
        </Card>
        <Card title="Chaves da organização" subtitle="Revogar uma chave encerra também todas as sessões ativas associadas a ela.">
          <FormField as="select" label="Organização" value={selectedOrganization} options={[
            { value: '', label: 'Selecione' },
            ...organizations.map((organization) => ({
              value: organization.id,
              label: organization.name,
            })),
          ]} onChange={(value) => {
            setSelectedOrganization(value)
            setCreatedKey(null)
          }} />
          {accessKeys.error && <Notice tone="error">{accessKeys.error}</Notice>}
          {accessKeys.isLoading ? <p>Carregando chaves...</p> : accessKeys.keys.length === 0 ? <p>Nenhuma chave cadastrada.</p> : (
            <List>
              {accessKeys.keys.map((key) => (
                <OrganizationRow key={key.id}>
                  <div>
                    <h3>{key.label}</h3>
                    <p>{key.keyPrefix} · {key.revokedAt ? 'Revogada' : 'Ativa'}</p>
                  </div>
                  <Button size="small" variant="secondary" disabled={Boolean(key.revokedAt)} onClick={() => void revokeClientAccessKey(key.id)}>
                    Revogar
                  </Button>
                </OrganizationRow>
              ))}
            </List>
          )}
        </Card>
      </div>
      <Card title="Organizações cadastradas" subtitle={`${organizations.length} organizações`}>
        {error && <Notice tone="error">{error}</Notice>}
        {formError && <Notice tone="error">{formError}</Notice>}
        {success && <Notice tone="success">{success}</Notice>}
        {organizations.length === 0 ? <p>Nenhuma organização cadastrada.</p> : (
          <List>
            {organizations.map((organization) => (
              <OrganizationRow key={organization.id}>
                <div>
                  <h3>{organization.name}</h3>
                  <p>{organization.slug} · {organization.active ? 'Ativa' : 'Inativa'}</p>
                </div>
                <Button
                  size="small"
                  variant={organization.active ? 'secondary' : 'primary'}
                  onClick={() => void toggleOrganization(organization.id, organization.active)}
                >
                  {organization.active ? 'Desativar' : 'Ativar'}
                </Button>
              </OrganizationRow>
            ))}
          </List>
        )}
        <Button size="small" variant="quiet" onClick={() => void refresh()}>Atualizar lista</Button>
      </Card>
    </Grid>
  )
}
