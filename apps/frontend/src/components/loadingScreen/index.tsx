import type { LoadingScreenProps } from './types'
import { Loading } from './styles'

export function LoadingScreen({ label }: LoadingScreenProps) {
  return <Loading role="status">{label}...</Loading>
}
