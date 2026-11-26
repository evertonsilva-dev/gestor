import { useState } from 'react'
import type { DashboardData } from '@/types/domain'

export function useDashboardReport(data: DashboardData) {
  const [exportError, setExportError] = useState<string | null>(null)

  async function exportFile(kind: 'pdf' | 'excel') {
    setExportError(null)
    try {
      const { downloadExcelReport, downloadPdfReport } = await import('../../services/exportReport')
      if (kind === 'pdf') downloadPdfReport(data)
      else await downloadExcelReport(data)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Não foi possível gerar o arquivo.')
    }
  }

  return { exportError, exportFile }
}
