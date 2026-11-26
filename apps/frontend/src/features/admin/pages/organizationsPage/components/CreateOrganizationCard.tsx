import type { FormEventHandler } from 'react'
import { Building2, PlusCircle } from 'lucide-react'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { FormField } from '@/components/formField'
import { Notice } from '@/components/notice'
import { AdminCardBadge, AdminFormDisclosure, Form } from '../styles'

interface CreateOrganizationCardProps {
  busy: boolean
  error: string | null
  success: string | null
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function CreateOrganizationCard({ busy, error, success, onSubmit }: CreateOrganizationCardProps) {
  return (
    <Card
      title="Nova organização"
      subtitle="Cada organização terá um ambiente próprio."
      action={<AdminCardBadge><Building2 size={14} /> Cadastro</AdminCardBadge>}
    >
      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}
      <AdminFormDisclosure>
        <summary><PlusCircle size={15} /> Cadastrar organização</summary>
        <Form onSubmit={onSubmit}>
          <FormField label="Nome" name="name" required maxLength={120} />
          <FormField label="Identificador (slug)" name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
          <Button type="submit" disabled={busy}><Building2 size={16} /> Cadastrar</Button>
        </Form>
      </AdminFormDisclosure>
    </Card>
  )
}
