import type { FormEvent, FormEventHandler } from 'react'
import { PlusCircle, Radio } from 'lucide-react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { FormField } from '@/components/FormField'
import type { Channel, SourcePage } from '@/hooks/useAdminMonitoring/types'
import { ChannelSourcePages } from '@/components/ChannelSourcePages'
import { ChannelCard, ChannelHeader, ChannelIcon, ChannelIdentity, ChannelList, Form, StatusPill } from '@/pages/MonitoringPage/styles'

interface ChannelManagementCardProps {
  channels: Channel[]
  sourcePages: SourcePage[]
  busy: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  onToggle: (channel: Channel) => void
  onCreatePage: (event: FormEvent<HTMLFormElement>, channelId: string) => void
  onTogglePage: (page: SourcePage) => void
}

export function ChannelManagementCard({
  channels,
  sourcePages,
  busy,
  onSubmit,
  onToggle,
  onCreatePage,
  onTogglePage,
}: ChannelManagementCardProps) {
  return (
    <Card
      title="Canais e páginas monitoradas"
      subtitle="Organize cada rede pelo canal e identifique as páginas que publicam conteúdo."
    >
      <Form onSubmit={onSubmit}>
        <FormField label="Nome do canal" name="name" placeholder="Ex.: Instagram" required maxLength={80} />
        <Button type="submit" size="small" disabled={busy}>
          <PlusCircle size={15} /> Adicionar canal
        </Button>
      </Form>
      {channels.length === 0 ? <p>Nenhum canal cadastrado. Adicione um canal para começar a organizar as páginas.</p> : (
        <ChannelList>
          {channels.map((channel) => (
            <ChannelCard key={channel.id}>
              <ChannelHeader>
                <ChannelIdentity>
                  <ChannelIcon><Radio size={18} /></ChannelIcon>
                  <div>
                    <strong>{channel.name}</strong>
                    <small>Canal de comunicação</small>
                  </div>
                </ChannelIdentity>
                <div>
                  <StatusPill $tone={channel.active ? 'active' : 'inactive'}>
                    {channel.active ? 'Ativo' : 'Inativo'}
                  </StatusPill>
                  <Button
                    size="small"
                    variant={channel.active ? 'secondary' : 'primary'}
                    disabled={busy}
                    onClick={() => onToggle(channel)}
                  >
                    {channel.active ? 'Desativar canal' : 'Ativar canal'}
                  </Button>
                </div>
              </ChannelHeader>
              <ChannelSourcePages
                channelId={channel.id}
                channelActive={channel.active}
                pages={sourcePages.filter((page) => page.channelId === channel.id)}
                busy={busy}
                onCreate={onCreatePage}
                onToggle={onTogglePage}
              />
            </ChannelCard>
          ))}
        </ChannelList>
      )}
    </Card>
  )
}
