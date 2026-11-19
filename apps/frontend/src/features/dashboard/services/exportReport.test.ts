import { afterEach, describe, expect, it, vi } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'
import type { DashboardData } from '@/types/domain'
import { downloadExcelReport } from './exportReport'

const reportData: DashboardData = {
  organization: { id: 'org-1', name: 'Organização de teste' },
  selectedPeriod: {
    id: 'period-1',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    publishedAt: '2026-02-01',
  },
  updateInProgress: false,
  lastPublishedAt: '2026-02-01',
  metrics: { newsCount: 1, commentCount: 1 },
  sentimentByChannel: [{ channelName: 'Canal A', positive: 2, neutral: 1, negative: 1 }],
  audience: [{ profile: 'militante', count: 2, percentage: 100 }],
  news: [{
    id: 'news-1',
    title: 'Título da notícia',
    sourceUrl: 'https://example.com/noticia',
    channelName: 'Canal A',
    sentiment: 'positive',
    publishedAt: '2026-01-10',
  }],
  comments: [{
    id: 'comment-1',
    content: 'Comentário analisado',
    channelName: 'Canal A',
    profile: 'militante',
    sentiment: 'positive',
    commentedAt: '2026-01-11',
  }],
  recommendations: [{ id: 'recommendation-1', category: 'action', content: 'Ação recomendada' }],
  availablePeriods: [],
}

describe('downloadExcelReport', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('exports a formatted workbook with charts and complete report details', async () => {
    let downloadedBlob: Blob | undefined
    const anchor = { href: '', download: '', click: vi.fn(), remove: vi.fn() }
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      downloadedBlob = blob as Blob
      return 'blob:report'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.stubGlobal('document', {
      createElement: vi.fn(() => anchor),
      body: { appendChild: vi.fn() },
    })
    vi.stubGlobal('window', { setTimeout: vi.fn() })

    await downloadExcelReport(reportData)

    expect(anchor.download).toBe('monitoramento-2026-01-31.xlsx')
    expect(anchor.click).toHaveBeenCalledOnce()
    if (!downloadedBlob) throw new Error('A exportação não produziu um arquivo.')
    const files = unzipSync(new Uint8Array(await downloadedBlob.arrayBuffer()))
    const panel = strFromU8(files['xl/worksheets/sheet1.xml'])
    const sentiments = strFromU8(files['xl/worksheets/sheet3.xml'])
    const comments = strFromU8(files['xl/worksheets/sheet6.xml'])

    expect(panel).toContain('<drawing r:id="rId1"/>')
    expect(files['xl/charts/chart1.xml']).toBeDefined()
    expect(strFromU8(files['xl/charts/chart1.xml'])).toContain('Canal A')
    expect(strFromU8(files['xl/charts/chart2.xml'])).toContain('Simpatizante')
    expect(sentiments).toContain('<autoFilter')
    expect(sentiments).toContain('Total')
    expect(strFromU8(files['xl/worksheets/sheet5.xml'])).toContain('https://example.com/noticia')
    expect(comments).toContain('Comentário analisado')
    expect(comments).toContain('Positivo')
    expect(strFromU8(files['xl/worksheets/sheet7.xml'])).toContain('Ação recomendada')
  })

  it('rejects exports without a published period', async () => {
    await expect(downloadExcelReport({ ...reportData, selectedPeriod: null }))
      .rejects.toThrow('Não há período publicado para exportar.')
  })
})
