import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}
