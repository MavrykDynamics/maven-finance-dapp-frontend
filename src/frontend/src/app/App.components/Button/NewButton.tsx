import React from 'react'

import {
  ButtomForm,
  ButtomSize,
  BUTTON,
  ButtonKind,
  ButtonTypes,
  BUTTON_MEDIUM,
  BUTTON_NORMAL,
} from './Button.constants'
import { ButtonStyled } from './NewButton.style'

export type ButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  className?: string
  kind: ButtonKind
  size?: ButtomSize
  form?: ButtomForm
  type?: ButtonTypes
  disabled?: boolean
  children?: React.ReactNode
  style?: React.CSSProperties
}

const Button = ({
  onClick,
  kind,
  children,
  disabled = false,
  style = {},
  className = '',
  type = BUTTON,
  size = BUTTON_MEDIUM,
  form = BUTTON_NORMAL,
}: ButtonProps) => {
  const buttonClasses = `${kind} ${size} ${form} ${disabled ? 'disabled' : ''} ${className}`

  return (
    <ButtonStyled className={buttonClasses} onClick={onClick} type={type} disabled={disabled} style={style}>
      {children}
    </ButtonStyled>
  )
}

export default Button
