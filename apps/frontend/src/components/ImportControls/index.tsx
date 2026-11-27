import type { ChangeEventHandler } from 'react'
import { Download, FileUp } from 'lucide-react'
import { Button } from '@/components/Button'
import { FormField } from '@/components/FormField'
import type { Channel, SourcePage } from '@/hooks/useAdminMonitoring/types'
import type { NewsPeriodItem } from '@/hooks/usePeriodItems/types'
import type { BulkImportType } from '@/components/BulkPeriodImport/types'
import { FilePicker, ImportActions } from '@/components/BulkPeriodImport/styles'

interface ImportControlsProps {
  type: BulkImportType
  text: string
  channelId: string
  sourcePageId: string
  newsItemId: string
  channels: Channel[]
  sourcePages: SourcePage[]
  newsItems: NewsPeriodItem[]
  draftsCount: number
  busy: boolean
  onTypeChange: (value: string) => void
  onChannelChange: (value: string) => void
  onSourcePageChange: (value: string) => void
  onNewsItemChange: (value: string) => void
  onTextChange: ChangeEventHandler<HTMLTextAreaElement>
  onFileChange: ChangeEventHandler<HTMLInputElement>
  onDownloadTemplate: () => void
  onBuildPreview: () => void
  onSaveBatch: () => void
}

export function ImportControls({
  type,
  text,
  channelId,
  sourcePageId,
  newsItemId,
  channels,
  sourcePages,
  newsItems,
  draftsCount,
  busy,
  onTypeChange,
  onChannelChange,
  onSourcePageChange,
  onNewsItemChange,
  onTextChange,
  onFileChange,
  onDownloadTemplate,
  onBuildPreview,
  onSaveBatch,
}: ImportControlsProps) {
  return (
    <>
      <FormField
        as="select"
        label="Tipo de conteúdo"
        value={type}
        onChange={onTypeChange}
        options={[
          { value: 'comment', label: 'Comentários (texto ou CSV)' },
          { value: 'news', label: 'Notícias (CSV ou tabela colada)' },
        ]}
      />
      {type === 'comment' && (
        <FormField
          as="select"
          label="Publicação da página"
          required
          value={newsItemId}
          onChange={onNewsItemChange}
          options={[
            {
              value: '',
              label: newsItems.some((news) => news.sourcePageId)
                ? 'Selecione uma publicação'
                : 'Cadastre uma publicação vinculada a uma página',
            },
            ...newsItems.filter((news) => news.sourcePageId).map((news) => ({
              value: news.id,
              label: `${news.sourcePageName ?? 'Página'} · ${news.title}`,
            })),
          ]}
        />
      )}
      {type === 'news' && (
        <>
          <FormField
            as="select"
            label="Canal"
            value={channelId}
            onChange={onChannelChange}
            options={[
              { value: '', label: 'Selecione um canal' },
              ...channels.filter((channel) => channel.active).map((channel) => ({
                value: channel.id,
                label: channel.name,
              })),
            ]}
          />
          <FormField
            as="select"
            label="Página / fonte (opcional)"
            value={sourcePageId}
            onChange={onSourcePageChange}
            options={[
              { value: '', label: 'Nenhuma página selecionada' },
              ...sourcePages
                .filter((page) => page.channelId === channelId && page.active)
                .map((page) => ({ value: page.id, label: page.name })),
            ]}
          />
        </>
      )}
      <ImportActions>
        <Button type="button" size="small" variant="secondary" onClick={onDownloadTemplate}>
          <Download size={15} /> Baixar modelo CSV
        </Button>
        <FilePicker>
          <FileUp size={15} /> Selecionar CSV
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            aria-label={type === 'news' ? 'Selecionar CSV de notícias' : 'Selecionar CSV de comentários'}
            onChange={onFileChange}
          />
        </FilePicker>
      </ImportActions>
      <FormField
        as="textarea"
        label={type === 'news' ? 'Conteúdo CSV ou tabela com cabeçalho' : 'Comentários ou CSV para revisão'}
        value={text}
        onChange={onTextChange}
        rows={8}
        placeholder={type === 'news'
          ? 'title,sourceUrl,sentiment,notes'
          : 'Cole os comentários ou informe um CSV com a coluna content; selecione uma publicação para vinculá-los.'}
      />
      <ImportActions>
        <Button type="button" variant="secondary" onClick={onBuildPreview} disabled={busy || !text.trim()}>
          Gerar prévia
        </Button>
        {draftsCount > 0 && (
          <Button type="button" onClick={onSaveBatch} disabled={busy}>
            {busy ? 'Importando...' : `Importar ${draftsCount} registro(s)`}
          </Button>
        )}
      </ImportActions>
    </>
  )
}
