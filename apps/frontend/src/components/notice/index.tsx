import type { NoticeProps } from './types'
import { Box } from './styles'

export function Notice({ children, tone = 'info' }: NoticeProps) {
  return <Box role={tone === 'error' ? 'alert' : 'status'} $tone={tone}>{children}</Box>
}
