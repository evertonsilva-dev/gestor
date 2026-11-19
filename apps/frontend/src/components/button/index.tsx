import type { ButtonProps } from './types'
import { StyledButton } from './styles'

export function Button({
  variant = 'primary',
  size = 'normal',
  type = 'button',
  ...props
}: ButtonProps) {
  return <StyledButton type={type} $variant={variant} $size={size} {...props} />
}
