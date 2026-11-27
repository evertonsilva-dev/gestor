import type { NoticeProps } from '@/components/Notice/types'
import { Box } from '@/components/Notice/styles'

export function Notice({ children, tone = 'info' }: NoticeProps) {
  return <Box role={tone === 'error' ? 'alert' : 'status'} $tone={tone}>{children}</Box>
}
