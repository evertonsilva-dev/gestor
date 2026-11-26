import { useState, type FormEvent } from 'react'
import { buildPeriodItemUpdate } from '../../services/periodEntry'
import type { PeriodItem, PeriodItemUpdate } from '@/hooks/usePeriodItems/types'

interface UsePeriodItemListProps {
  onUpdate: (item: PeriodItem, changes: PeriodItemUpdate) => Promise<void>
  onDelete: (item: PeriodItem) => Promise<void>
  allowDelete: boolean
}

export function usePeriodItemList({ onUpdate, onDelete, allowDelete }: UsePeriodItemListProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function toggleEditing(itemId: string) {
    setActionError(null)
    setEditingItemId((current) => current === itemId ? null : itemId)
  }

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
    if (!allowDelete || !window.confirm('Remover este registro do período em processamento?')) return
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

  return {
    editingItemId,
    actionError,
    busy,
    toggleEditing,
    submitEdit,
    removeItem,
  }
}
