import React from 'react'

import { BUTTON, ButtonStyle, ButtonTypes, PRIMARY } from './Button.constants'
import { ButtonStyled } from './NewButton.style'

export type ButtonProps = {
  className?: string
  kind?: ButtonStyle
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  type?: ButtonTypes
  disabled?: boolean
  children?: JSX.Element
}

const NewButton = ({
  onClick,
  disabled = false,
  kind = PRIMARY,
  type = BUTTON,
  className = '',
  children,
}: ButtonProps) => {
  const buttonClasses = `${kind} ${disabled ? 'disabled' : ''} ${className}`

  return (
    <ButtonStyled className={buttonClasses} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </ButtonStyled>
  )
}

export default NewButton
