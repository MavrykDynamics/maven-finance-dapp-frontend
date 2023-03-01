import React, { useCallback, useState } from 'react'
import { AppDispatch } from 'app/App.controller'
import { SimpleCircleSpinnerLoader } from '../Loader/Loader.view'

import {
  ButtonForm,
  ButtonSize,
  BUTTON,
  ButtonKind,
  ButtonTypes,
  BUTTON_MEDIUM,
  BUTTON_NORMAL,
  ButtonAnimation,
} from './Button.constants'
import { ButtonStyled } from './NewButton.style'

export type ButtonProps = {
  onClick?: AppDispatch | ((e: React.MouseEvent<HTMLElement>) => Promise<unknown> | void)
  kind: ButtonKind
  size?: ButtonSize
  form?: ButtonForm
  type?: ButtonTypes
  selected?: boolean
  animation?: ButtonAnimation | null
  disabled?: boolean
  children?: React.ReactNode
}

const Button = ({
  onClick,
  kind,
  children,
  disabled = false,
  selected = false,
  type = BUTTON,
  size = BUTTON_MEDIUM,
  form = BUTTON_NORMAL,
  animation,
}: ButtonProps) => {
  const buttonClasses = `${kind} ${size} ${form} ${animation ?? ''} ${disabled ? 'disabled' : ''} ${
    selected ? 'selected' : ''
  }`

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
      id="ButtonStyled"
      onClick={loadingWrappedClickHandler}
      type={type}
      disabled={isDisabled}
    >
      {isLoadingFromHandler ? <SimpleCircleSpinnerLoader /> : children}
    </ButtonStyled>
  )
}

export default Button
