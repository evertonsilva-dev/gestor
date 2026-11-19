import 'styled-components'
import type { theme } from './index'

type AppTheme = typeof theme

declare module 'styled-components' {
  // Required for styled-components to merge the application theme into DefaultTheme.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}
