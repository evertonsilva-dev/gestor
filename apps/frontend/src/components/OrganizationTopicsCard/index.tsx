import type { FormEvent, FormEventHandler } from 'react'
import { Pencil, PlusCircle, Save, Sparkles } from 'lucide-react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { FormField } from '@/components/FormField'
import { Notice } from '@/components/Notice'
import type { Organization } from '@/types/domain'
import type { MonitoredTopic } from '@/hooks/useOrganizationTopics'
import {
  Form,
  KeywordChip,
  KeywordList,
  TopicActions,
  TopicContextBadge,
  TopicEditDisclosure,
  TopicInfo,
  TopicList,
  TopicDisclosure,
  TopicRow,
  TopicStatus,
} from '@/pages/OrganizationsPage/styles'

interface OrganizationTopicsCardProps {
  organizations: Organization[]
  selectedOrganization: string
  topics: MonitoredTopic[]
  isLoading: boolean
  error: string | null
  actionError: string | null
  actionSuccess: string | null
  busy: boolean
  onOrganizationChange: (id: string) => void
  onCreate: FormEventHandler<HTMLFormElement>
  onUpdate: (event: FormEvent<HTMLFormElement>, topicId: string) => void
  onToggle: (topic: MonitoredTopic) => void
}

export function OrganizationTopicsCard({
  organizations,
  selectedOrganization,
  topics,
  isLoading,
  error,
  actionError,
  actionSuccess,
  busy,
  onOrganizationChange,
  onCreate,
  onUpdate,
  onToggle,
}: OrganizationTopicsCardProps) {
  return (
    <Card
      title="Contexto e palavras-chave"
      subtitle="A IA usa os assuntos ativos para interpretar o conteúdo em relação à organização."
      action={<TopicContextBadge><Sparkles size={14} /> Análise contextual</TopicContextBadge>}
    >
      <FormField
        as="select"
        label="Organização"
        value={selectedOrganization}
        onChange={onOrganizationChange}
        options={[
          { value: '', label: 'Selecione uma organização' },
          ...organizations.map((organization) => ({
            value: organization.id,
            label: organization.name,
          })),
        ]}
      />
      {actionError && <Notice tone="error">{actionError}</Notice>}
      {actionSuccess && <Notice tone="success">{actionSuccess}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      <TopicDisclosure>
        <summary><PlusCircle size={15} /> Adicionar assunto e palavras-chave</summary>
        <Form onSubmit={onCreate}>
          <FormField label="Assunto monitorado" name="name" required maxLength={120} disabled={!selectedOrganization || busy} />
          <FormField
            label="Palavras-chave (separadas por vírgula)"
            name="keywords"
            placeholder="Ex.: nome da organização, projeto prioritário"
            disabled={!selectedOrganization || busy}
          />
          <Button type="submit" size="small" disabled={busy || !selectedOrganization}>
            <PlusCircle size={15} /> Salvar assunto
          </Button>
        </Form>
      </TopicDisclosure>
      {isLoading ? <p>Carregando assuntos...</p> : topics.length === 0 ? (
        <p>Nenhum assunto cadastrado para esta organização.</p>
      ) : (
        <TopicList>
          {topics.map((topic) => (
            <TopicRow key={topic.id}>
              <TopicInfo>
                <h3>
                  {topic.name}
                  <TopicStatus $active={topic.active}>{topic.active ? 'Ativo para a IA' : 'Inativo'}</TopicStatus>
                </h3>
                {topic.keywords.length > 0 ? (
                  <KeywordList>
                    {topic.keywords.map((keyword) => <KeywordChip key={keyword}>{keyword}</KeywordChip>)}
                  </KeywordList>
                ) : <small>Sem palavras-chave definidas</small>}
              </TopicInfo>
              <TopicActions>
                <TopicEditDisclosure>
                  <summary><Pencil size={14} /> Editar</summary>
                  <Form onSubmit={(event) => onUpdate(event, topic.id)}>
                    <FormField label="Assunto" name="name" defaultValue={topic.name} required maxLength={120} disabled={busy} />
                    <FormField
                      label="Palavras-chave (separadas por vírgula)"
                      name="keywords"
                      defaultValue={topic.keywords.join(', ')}
                      disabled={busy}
                    />
                    <Button type="submit" size="small" variant="secondary" disabled={busy}>
                      <Save size={14} /> Salvar alterações
                    </Button>
                  </Form>
                </TopicEditDisclosure>
                <Button
                  type="button"
                  size="small"
                  variant={topic.active ? 'quiet' : 'primary'}
                  disabled={busy}
                  onClick={() => onToggle(topic)}
                >
                  {topic.active ? 'Desativar' : 'Ativar'}
                </Button>
              </TopicActions>
            </TopicRow>
          ))}
        </TopicList>
      )}
    </Card>
  )
}
