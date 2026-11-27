import { LoadingScreen } from '@/components/LoadingScreen'
import { Notice } from '@/components/Notice'
import { BulkPeriodImport } from '@/components/BulkPeriodImport'
import { ChannelManagementCard } from '@/components/ChannelManagementCard'
import { OrganizationSelectorCard } from '@/components/OrganizationSelectorCard'
import { PeriodEntryCard } from '@/components/PeriodEntryCard'
import { PeriodManagementSection } from '@/components/PeriodManagementSection'
import { PeriodRecordsCard } from '@/components/PeriodRecordsCard'
import { SourcePageAffinityCard } from '@/components/SourcePageAffinityCard'
import { Stack } from '@/pages/MonitoringPage/styles'
import { useMonitoringPage } from '@/hooks/useMonitoringPage'
import type { NewsPeriodItem } from '@/hooks/usePeriodItems/types'

export function MonitoringPage() {
  const page = useMonitoringPage()

  if (page.organizationsLoading) {
    return <LoadingScreen label="Carregando organizações" />
  }
  if (page.organizationsError) {
    return <Notice tone="error">{page.organizationsError}</Notice>
  }

  return (
    <Stack>
      {page.activeOrganizations.length === 0 ? (
        <Notice>
          Cadastre uma organização ativa antes de configurar o monitoramento.
        </Notice>
      ) : (
        <OrganizationSelectorCard
          organizations={page.activeOrganizations}
          value={page.organizationId}
          onChange={page.selectOrganization}
        />
      )}

      {page.feedback && <Notice tone={page.feedback.tone}>{page.feedback.message}</Notice>}
      {page.monitoring.error && <Notice tone="error">{page.monitoring.error}</Notice>}
      {page.monitoring.isLoading && <LoadingScreen label="Atualizando dados" />}

      {page.organizationId && (
        <>
          <ChannelManagementCard
            channels={page.monitoring.channels}
            sourcePages={page.sourcePages}
            busy={page.busy}
            onSubmit={page.submitChannel}
            onToggle={page.setChannelActive}
            onCreatePage={page.submitSourcePage}
            onTogglePage={page.setSourcePageActive}
          />

          <PeriodManagementSection
            periods={page.monitoring.periods}
            selectedPeriodId={page.selectedPeriodId}
            periodDates={page.periodDates}
            editingPeriodId={page.editingPeriodId}
            editingPeriodDates={page.editingPeriodDates}
            busy={page.busy}
            onPeriodDatesChange={page.setPeriodDates}
            onEditingDatesChange={page.setEditingPeriodDates}
            onCreatePeriod={page.submitPeriod}
            onSubmitEdit={page.submitPeriodEdit}
            onSelectPeriod={page.selectPeriod}
            onEditPeriod={page.editPeriod}
            onPublishPeriod={page.publishPeriod}
          />

          {page.selectedPeriod?.status === 'processing' && (
            <BulkPeriodImport
              periodId={page.selectedPeriod.id}
              channels={page.monitoring.channels}
              sourcePages={page.sourcePages}
              newsItems={page.periodItems.items.filter((item): item is NewsPeriodItem => item.type === 'news')}
              bulkImportItems={page.monitoring.bulkImportItems}
              onImported={page.periodItems.refresh}
            />
          )}

          {page.selectedPeriod?.status === 'processing' && (
            <PeriodEntryCard
              period={page.selectedPeriod}
              channels={page.activeChannels}
              sourcePages={page.sourcePages}
              newsItems={page.relatedNewsItems}
              itemType={page.itemType}
              itemChannelId={page.itemChannelId}
              sourcePageId={page.sourcePageId}
              newsItemId={page.newsItemId}
              busy={page.busy}
              onItemTypeChange={page.setItemType}
              onChannelChange={page.selectItemChannel}
              onSourcePageChange={page.setSourcePageId}
              onNewsItemChange={page.setNewsItemId}
              onSubmit={page.submitItem}
            />
          )}

          {page.selectedPeriod && (
            <PeriodRecordsCard
              period={page.selectedPeriod}
              periodItems={page.periodItems}
              sourcePages={page.sourcePages}
            />
          )}
          {page.selectedPeriod && (
            <SourcePageAffinityCard
              period={page.selectedPeriod}
              state={page.sourcePageAffinity}
            />
          )}
        </>
      )}
    </Stack>
  )
}
