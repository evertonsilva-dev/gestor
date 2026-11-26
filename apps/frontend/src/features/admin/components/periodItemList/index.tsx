import { Notice } from '@/components/notice'
import type { PeriodItem } from '@/hooks/usePeriodItems/types'
import type { PeriodItemListProps } from './types'
import { List } from './styles'
import { PeriodItemRow } from './PeriodItemRow'
import { usePeriodItemList } from './usePeriodItemList'

export function PeriodItemList({
  items,
  sourcePages,
  isLoading,
  error,
  onUpdate,
  onDelete,
  allowDelete,
}: PeriodItemListProps) {
  const actions = usePeriodItemList({ onUpdate, onDelete, allowDelete })

  return (
    <List>
      {error && <Notice tone="error">{error}</Notice>}
      {actions.actionError && <Notice tone="error">{actions.actionError}</Notice>}
      {isLoading ? <p>Carregando registros...</p> : items.length === 0 ? (
        <p>Nenhum registro adicionado ao período.</p>
      ) : items.map((item: PeriodItem) => (
        <PeriodItemRow
          key={`${item.type}-${item.id}`}
          item={item}
          items={items}
          sourcePages={sourcePages}
          isEditing={actions.editingItemId === item.id}
          busy={actions.busy}
          allowDelete={allowDelete}
          onToggleEditing={() => actions.toggleEditing(item.id)}
          onSubmitEdit={(event) => void actions.submitEdit(event, item)}
          onDelete={() => void actions.removeItem(item)}
        />
      ))}
    </List>
  )
}
