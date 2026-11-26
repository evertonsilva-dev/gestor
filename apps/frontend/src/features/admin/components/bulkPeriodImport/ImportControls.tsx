import type { ChangeEventHandler } from 'react'
import { Download, FileUp } from 'lucide-react'
import { Button } from '@/components/button'
import { FormField } from '@/components/formField'
import type { Channel, SourcePage } from '@/hooks/useAdminMonitoring/types'
import type { NewsPeriodItem } from '@/hooks/usePeriodItems/types'
import type { BulkImportType } from './types'
import { FilePicker, ImportActions } from './styles'

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
          { value: 'comment', label: 'Bloco de comentários' },
          { value: 'news', label: 'Notícias (CSV ou tabela colada)' },
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
      {type === 'comment' && (
        <FormField
          as="select"
          label="Notícia relacionada (opcional)"
          value={newsItemId}
          onChange={onNewsItemChange}
          options={[
            { value: '', label: 'Nenhuma notícia selecionada' },
            ...newsItems.filter((news) => news.channelId === channelId).map((news) => ({
              value: news.id,
              label: news.title,
            })),
          ]}
        />
      )}
      {type === 'news' && (
        <ImportActions>
          <Button type="button" size="small" variant="secondary" onClick={onDownloadTemplate}>
            <Download size={15} /> Baixar modelo CSV
          </Button>
          <FilePicker>
            <FileUp size={15} /> Selecionar CSV
            <input
              type="file"
              accept=".csv,text/csv,text/plain"
              aria-label="Selecionar arquivo CSV"
              onChange={onFileChange}
            />
          </FilePicker>
        </ImportActions>
      )}
      <FormField
        as="textarea"
        label={type === 'news' ? 'Conteúdo CSV ou tabela com cabeçalho' : 'Comentários para revisão'}
        value={text}
        onChange={onTextChange}
        rows={8}
        placeholder={type === 'news'
          ? 'title,sourceUrl,sentiment,notes'
          : 'Cole os comentários; use uma linha por comentário ou uma linha em branco entre blocos.'}
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
