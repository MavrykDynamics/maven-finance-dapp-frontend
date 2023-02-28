import { AppDispatch } from 'app/App.controller'
import React, { useCallback, useState } from 'react'
import { SimpleCircleSpinnerLoader } from '../Loader/Loader.view'

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
  onClick?: AppDispatch | ((e: React.MouseEvent<HTMLElement>) => Promise<unknown> | void)
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

  const [isLoadingFromHandler, setLoading] = useState(false)
  const isDisabled = disabled || isLoadingFromHandler

  const loadingWrappedClickHandler = useCallback(
    async (e: React.MouseEvent<HTMLElement>) => {
      if (onClick) {
        const callResult = onClick(e)
        if (callResult && typeof callResult.then === 'function') {
          setLoading(true)
          await callResult
          setLoading(false)
        }
      }
    },
    [onClick],
  )

  return (
    <ButtonStyled
      className={buttonClasses}
      onClick={loadingWrappedClickHandler}
      type={type}
      disabled={isDisabled}
      style={style}
    >
      {isLoadingFromHandler ? <SimpleCircleSpinnerLoader /> : children}
    </ButtonStyled>
  )
}

export default Button
