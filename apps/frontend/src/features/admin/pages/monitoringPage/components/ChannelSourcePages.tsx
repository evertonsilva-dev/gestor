import type { FormEvent } from 'react'
import { Globe, PlusCircle } from 'lucide-react'
import { Button } from '@/components/button'
import { FormField } from '@/components/formField'
import type { SourcePage } from '@/hooks/useAdminMonitoring/types'
import {
  PageFormDisclosure,
  PageIcon,
  PageIdentity,
  PageItem,
  PageList,
  PageSection,
  PageSectionHeading,
  StatusPill,
  Form,
} from '../styles'

interface ChannelSourcePagesProps {
  channelId: string
  channelActive: boolean
  pages: SourcePage[]
  busy: boolean
  onCreate: (event: FormEvent<HTMLFormElement>, channelId: string) => void
  onToggle: (page: SourcePage) => void
}

export function ChannelSourcePages({
  channelId,
  channelActive,
  pages,
  busy,
  onCreate,
  onToggle,
}: ChannelSourcePagesProps) {
  return (
    <PageSection>
      <PageSectionHeading>
        <span>Páginas / fontes</span>
        <StatusPill $tone="inactive">{pages.length} {pages.length === 1 ? 'página' : 'páginas'}</StatusPill>
      </PageSectionHeading>
      {pages.length === 0 ? (
        <p>Nenhuma página cadastrada neste canal.</p>
      ) : (
        <PageList>
          {pages.map((page) => (
            <PageItem key={page.id}>
              <PageIdentity>
                <PageIcon><Globe size={15} /></PageIcon>
                <div>
                  <strong>{page.name}</strong>
                  <small>{page.url ?? 'Sem URL cadastrada'}</small>
                </div>
              </PageIdentity>
              <div>
                <StatusPill $tone={page.active ? 'active' : 'inactive'}>
                  {page.active ? 'Ativa' : 'Inativa'}
                </StatusPill>
                <Button
                  size="small"
                  variant={page.active ? 'quiet' : 'secondary'}
                  disabled={busy}
                  onClick={() => onToggle(page)}
                >
                  {page.active ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </PageItem>
          ))}
        </PageList>
      )}
      <PageFormDisclosure>
        <summary><PlusCircle size={15} /> Adicionar página neste canal</summary>
        <Form onSubmit={(event) => onCreate(event, channelId)}>
          <FormField label="Nome da página" name="name" placeholder="Ex.: perfil oficial" required maxLength={120} disabled={!channelActive || busy} />
          <FormField label="URL da página (opcional)" name="url" type="url" maxLength={2048} disabled={!channelActive || busy} />
          <Button type="submit" size="small" variant="secondary" disabled={!channelActive || busy}>
            Salvar página
          </Button>
        </Form>
      </PageFormDisclosure>
    </PageSection>
  )
}
