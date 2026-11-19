import { useState, type FormEvent } from 'react'
import { Pencil, Save, Trash2, X } from 'lucide-react'
import { Button } from '@/components/button'
import { FormField } from '@/components/formField'
import { Notice } from '@/components/notice'
import { formatDate } from '@/lib/dateFormat'
import { buildPeriodItemUpdate } from '../../services/periodEntry'
import type { PeriodItem } from '@/hooks/usePeriodItems/types'
import type { PeriodItemListProps } from './types'
import { Actions, EditForm, List, Row, RowHeader } from './styles'

const itemLabels = {
  news: 'Notícia',
  comment: 'Comentário',
  recommendation: 'Recomendação',
} as const

function itemContent(item: PeriodItem): string {
  return item.type === 'news' ? item.title : item.content
}

function itemDescription(item: PeriodItem): string {
  const date = formatDate(item.type === 'news'
    ? item.publishedAt
    : item.type === 'comment'
      ? item.commentedAt
      : item.createdAt)

  return item.type === 'recommendation'
    ? `${itemLabels[item.type]} · ${date}`
    : `${itemLabels[item.type]} · ${item.channelName} · ${date}`
}

export function PeriodItemList({ items, isLoading, error, onUpdate, onDelete }: PeriodItemListProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submitEdit(event: FormEvent<HTMLFormElement>, item: PeriodItem) {
    event.preventDefault()
    setActionError(null)
    setBusy(true)

    try {
      const changes = buildPeriodItemUpdate(item, new FormData(event.currentTarget))
      await onUpdate(item, changes)
      setEditingItemId(null)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível atualizar o registro.')
    } finally {
      setBusy(false)
    }
  }

  async function removeItem(item: PeriodItem) {
    if (!window.confirm('Remover este registro do período em processamento?')) return
    setActionError(null)
    setBusy(true)

    try {
      await onDelete(item)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Não foi possível remover o registro.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <List>
      {error && <Notice tone="error">{error}</Notice>}
      {actionError && <Notice tone="error">{actionError}</Notice>}
      {isLoading ? <p>Carregando registros...</p> : items.length === 0 ? (
        <p>Nenhum registro adicionado ao período.</p>
      ) : items.map((item) => (
        <Row key={`${item.type}-${item.id}`}>
          <RowHeader>
            <p>{itemContent(item)}<small>{itemDescription(item)}</small></p>
            <Actions>
              <Button size="small" variant="secondary" disabled={busy} onClick={() => {
                setActionError(null)
                setEditingItemId(editingItemId === item.id ? null : item.id)
              }}>
                {editingItemId === item.id ? <X size={14} /> : <Pencil size={14} />}
                {editingItemId === item.id ? 'Cancelar' : 'Editar'}
              </Button>
              <Button size="small" variant="quiet" disabled={busy} onClick={() => void removeItem(item)}>
                <Trash2 size={14} /> Remover
              </Button>
            </Actions>
          </RowHeader>
          {editingItemId === item.id && (
            <EditForm onSubmit={(event) => void submitEdit(event, item)}>
              {item.type === 'news' ? (
                <FormField label="Título" name="title" defaultValue={item.title} required maxLength={500} />
              ) : (
                <FormField as="textarea" label={item.type === 'comment' ? 'Comentário' : 'Recomendação'} name="content" defaultValue={item.content} required maxLength={4000} />
              )}
              <Actions>
                <Button type="submit" size="small" disabled={busy}><Save size={14} /> Salvar alterações</Button>
              </Actions>
            </EditForm>
          )}
        </Row>
      ))}
    </List>
  )
}
