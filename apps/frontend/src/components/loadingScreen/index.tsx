import type { LoadingScreenProps } from '@/components/LoadingScreen/types'
import { Loading } from '@/components/LoadingScreen/styles'

export function LoadingScreen({ label }: LoadingScreenProps) {
  return <Loading role="status">{label}...</Loading>
}
