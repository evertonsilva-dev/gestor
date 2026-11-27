import type { Sentiment } from '@/services/admin/bulkImport'

export type BulkImportType = 'news' | 'comment'
export const bulkImportPageSize = 50

export interface CommentDraft {
  content: string
  sentiment: Sentiment | ''
}
