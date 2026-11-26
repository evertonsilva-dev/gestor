import { Card } from '@/components/card'
import { Notice } from '@/components/notice'
import { FileUp } from 'lucide-react'
import type { Channel, SourcePage } from '@/hooks/useAdminMonitoring/types'
import type { NewsPeriodItem } from '@/hooks/usePeriodItems/types'
import { ImportControls } from './ImportControls'
import { ImportPreview } from './ImportPreview'
import { ImportDisclosure, ImportForm, ImportHelp, ImportStatus } from './styles'
import { useBulkPeriodImport } from './useBulkPeriodImport'

interface BulkPeriodImportProps {
  periodId: string
  channels: Channel[]
  sourcePages: SourcePage[]
  newsItems: NewsPeriodItem[]
  bulkImportItems: Parameters<typeof useBulkPeriodImport>[0]['bulkImportItems']
  onImported: () => Promise<void>
}

export function BulkPeriodImport({
  periodId,
  channels,
  sourcePages,
  newsItems,
  bulkImportItems,
  onImported,
}: BulkPeriodImportProps) {
  const importState = useBulkPeriodImport({ periodId, bulkImportItems, onImported })
  const hasPreview = importState.draftsCount > 0

  return (
    <Card
      title="Importar em massa"
      subtitle="Deixe o sentimento vazio para classificar automaticamente ao importar; escolhas manuais serão preservadas."
      action={
        <ImportStatus $tone={hasPreview ? 'ready' : 'pending'}>
          {hasPreview ? `${importState.draftsCount} registros na prévia` : 'Aguardando prévia'}
        </ImportStatus>
      }
    >
      <ImportForm>
        <ImportDisclosure>
          <summary><FileUp size={15} /> Configurar importação</summary>
          <ImportHelp>
            Escolha o tipo e o canal, cole os dados ou selecione um CSV e gere uma prévia para revisar antes de salvar.
          </ImportHelp>
          <ImportControls
            type={importState.type}
            text={importState.text}
            channelId={importState.channelId}
            sourcePageId={importState.sourcePageId}
            newsItemId={importState.newsItemId}
            channels={channels}
            sourcePages={sourcePages}
            newsItems={newsItems}
            draftsCount={importState.draftsCount}
            busy={importState.busy}
            onTypeChange={importState.changeType}
            onChannelChange={importState.selectChannel}
            onSourcePageChange={importState.setSourcePageId}
            onNewsItemChange={importState.setNewsItemId}
            onTextChange={(event) => importState.setText(event.currentTarget.value)}
            onFileChange={(event) => void importState.loadFile(event)}
            onDownloadTemplate={importState.downloadTemplate}
            onBuildPreview={importState.buildPreview}
            onSaveBatch={() => void importState.saveBatch()}
          />
        </ImportDisclosure>
        {importState.feedback && <Notice tone="success">{importState.feedback}</Notice>}
        {importState.error && <Notice tone="error">{importState.error}</Notice>}
        {importState.draftsCount > 0 && (
          <ImportPreview
            type={importState.type}
            newsRows={importState.newsRows}
            visibleComments={importState.visibleComments}
            page={importState.page}
            pageCount={importState.pageCount}
            draftsCount={importState.draftsCount}
            invalidNewsCount={importState.invalidNewsCount}
            onCommentUpdate={importState.updateComment}
            onCommentRemove={importState.removeComment}
            onNewsSentimentChange={importState.updateNewsSentiment}
            onPageChange={importState.setPage}
          />
        )}
      </ImportForm>
    </Card>
  )
}
