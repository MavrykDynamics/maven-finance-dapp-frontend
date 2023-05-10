import React, { useLayoutEffect, useRef, useState, useCallback } from 'react'

// utils
import { validateInput } from 'app/App.utils/input'

// hooks
import { useInputValidator } from 'app/App.hooks/useInputValidator'

import {
  TextAreaStyled,
  TextAreaStatus,
  TextAreaIcon,
  TextAreaErrorMessage,
  TextAreaCounter,
  TextareaStyled,
} from './TextArea.style'
import { NewInputLabel } from '../Input/Input.style'

export type TextAreaStatusType = 'success' | 'error' | '' | undefined
type TextAreaProps = {
  icon?: string
  placeholder?: string
  name?: string
  className?: string
  value: string | number
  textAreaMaxLimit?: number
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  inputStatus?: TextAreaStatusType
  errorMessage?: string
  label?: string
  disabled?: boolean
  required?: boolean
}

export const TextArea = ({
  icon,
  placeholder = '',
  name,
  className,
  value,
  onChange,
  onBlur,
  inputStatus,
  errorMessage: errorMessageFromProps,
  disabled,
  required,
  label,
  textAreaMaxLimit = 1000,
}: TextAreaProps) => {
  const [errorMsg, setErrorMsg] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const { finalErrorMessage, finalStatus } = useInputValidator({
    originalErrorMessage: errorMessageFromProps,
    internalErrorMessage: errorMsg,
    status: inputStatus,
  })

  useLayoutEffect(() => {
    if (textareaRef && textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = Math.max(scrollHeight, 85) + 'px'
    }
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = e.target

      const errorMessage = validateInput(value)
      setErrorMsg(errorMessage)

      onChange(e)
    },
    [errorMsg, onChange],
  )
  return (
    <TextAreaStyled className={className} id={'textAreaContainer'}>
      {label ? <NewInputLabel>{label}</NewInputLabel> : null}
      {icon && (
        <TextAreaIcon>
          <use xlinkHref={`/icons/sprites.svg#${icon}`} />
        </TextAreaIcon>
      )}
      <div className={`textArea-wrapper ${finalStatus} ${disabled ? 'disabled' : ''}`}>
        <TextareaStyled
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={`textarea`}
          name={name}
          onBlur={onBlur}
          autoComplete={name}
          disabled={disabled}
          ref={textareaRef}
          required={required}
        />
      </div>

      <TextAreaCounter className={finalStatus}>
        {String(value).length}/{textAreaMaxLimit}
      </TextAreaCounter>
      <TextAreaStatus className={finalStatus} />
      {finalErrorMessage && <TextAreaErrorMessage>{finalErrorMessage}</TextAreaErrorMessage>}
    </TextAreaStyled>
  )
}
