import type { CardProps } from '@/components/Card/types'
import { CardHeading, Surface } from '@/components/Card/styles'

export function Card({ title, subtitle, action, children, ...props }: CardProps) {
  return (
    <Surface {...props}>
      {title && (
        <CardHeading>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </CardHeading>
      )}
      {children}
    </Surface>
  )
}
