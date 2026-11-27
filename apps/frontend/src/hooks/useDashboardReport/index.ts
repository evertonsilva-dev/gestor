import { useMemo, useState } from 'react'
import {
  buildNewsSentimentTimeline,
  rankChannelSentiment,
  summarizeNewsSentiment,
} from '@/services/dashboard/reportAnalytics'
import type { DashboardData } from '@/types/domain'

export function useDashboardReport(data: DashboardData) {
  const [exportError, setExportError] = useState<string | null>(null)
  const newsSentiment = useMemo(
    () => summarizeNewsSentiment(data.sentimentByChannel),
    [data.sentimentByChannel],
  )
  const newsSentimentTimeline = useMemo(
    () => buildNewsSentimentTimeline(data.news, data.selectedPeriod),
    [data.news, data.selectedPeriod],
  )
  const channelSentimentBalance = useMemo(
    () => rankChannelSentiment(data.sentimentByChannel),
    [data.sentimentByChannel],
  )

  async function exportFile(kind: 'pdf' | 'excel') {
    setExportError(null)
    try {
      const { downloadExcelReport, downloadPdfReport } = await import('@/services/dashboard/exportReport')
      if (kind === 'pdf') downloadPdfReport(data)
      else await downloadExcelReport(data)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Não foi possível gerar o arquivo.')
    }
  }

  return { exportError, exportFile, newsSentiment, newsSentimentTimeline, channelSentimentBalance }
}
