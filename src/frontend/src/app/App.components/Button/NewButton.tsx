import React, { useCallback, useState } from 'react'
import { AppDispatch } from 'app/App.controller'
import { SimpleCircleSpinnerLoader } from '../Loader/Loader.view'

import {
  ButtonForm,
  BUTTON,
  ButtonKind,
  ButtonTypes,
  ButtonAnimation,
  ButtonSize,
  BUTTON_REGULAR,
} from './Button.constants'
import { ButtonStyled } from './NewButton.style'
import classNames from 'classnames'

export type ButtonProps = {
  onClick?: AppDispatch | ((e: React.MouseEvent<HTMLElement>) => Promise<unknown> | void)
  kind: ButtonKind
  form?: ButtonForm
  type?: ButtonTypes
  size?: ButtonSize
  selected?: boolean
  animation?: ButtonAnimation | null
  disabled?: boolean
  isThin?: boolean
  children?: React.ReactNode
}

/**
 * To style button positioning or certain pixesl size do it via parent layout styling and @BUTTON_WIDE form prop
 *
 * By default button will take width of the content and padding 20px 0, or use @BUTTON_WIDE it will take 100% of the parent width
 *
 * If you need to style appearance add this styling via creating new kind and assign new styles to it
 *
 * Button shoun't contain id | classes cuz it should be only responsible for appearance, not positioning & size
 */
const Button = ({
  onClick,
  kind,
  children,
  form,
  animation,
  disabled = false,
  selected = false,
  isThin = false,
  size = BUTTON_REGULAR,
  type = BUTTON,
}: ButtonProps) => {
  const [isLoading, setLoading] = useState(false)
  const isDisabled = disabled || isLoading

  const loadingWrappedClickHandler = useCallback(
    async (e: React.MouseEvent<HTMLElement>) => {
      try {
        if (onClick) {
          const callResult = onClick(e)
          if (callResult && typeof callResult.then === 'function') {
            setLoading(true)
            await callResult
            setLoading(false)
          }
        }
      } catch (e) {
        setLoading(false)
      }
    },
    [onClick],
  )

  const buttonClasses = classNames(kind, form, animation, size, {
    disabled: isDisabled,
    isThin,
    selected,
    isLoading,
  })

  return (
    <ButtonStyled className={buttonClasses} onClick={loadingWrappedClickHandler} type={type} disabled={isDisabled}>
      {isLoading ? (
        <div className="circle-spinner">
          <SimpleCircleSpinnerLoader />
        </div>
      ) : null}
      <div className="child">{children}</div>
    </ButtonStyled>
  )
}

export default Button
