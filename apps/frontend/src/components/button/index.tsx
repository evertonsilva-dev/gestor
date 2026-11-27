import type { ButtonProps } from '@/components/Button/types'
import { StyledButton } from '@/components/Button/styles'

export function Button({
  variant = 'primary',
  size = 'normal',
  type = 'button',
  ...props
}: ButtonProps) {
  return <StyledButton type={type} $variant={variant} $size={size} {...props} />
}
