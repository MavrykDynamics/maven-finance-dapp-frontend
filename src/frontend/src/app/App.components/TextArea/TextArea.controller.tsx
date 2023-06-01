import React, { useRef, useLayoutEffect } from 'react'

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
  textAreaMaxLimit,
}: TextAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useLayoutEffect(() => {
    if (textareaRef && textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = Math.max(scrollHeight, 85) + 'px'
    }
  }, [value])

  const { status, errorMessage, handleChange } = useInputValidator({
    originalErrorMessage: errorMessageFromProps,
    status: inputStatus,
    onChange,
  })

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.persist()
    const trimmedValue = e.target.value.trim()
    e.target.value = trimmedValue
    onBlur?.(e)
  }

  return (
    <TextAreaStyled className={className} id={'textAreaContainer'}>
      {label ? <NewInputLabel>{label}</NewInputLabel> : null}
      {icon && (
        <TextAreaIcon>
          <use xlinkHref={`/icons/sprites.svg#${icon}`} />
        </TextAreaIcon>
      )}
      <div className={`textArea-wrapper ${status} ${disabled ? 'disabled' : ''}`}>
        <TextareaStyled
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={`textarea`}
          name={name}
          onBlur={handleBlur}
          autoComplete={name}
          disabled={disabled}
          ref={textareaRef}
          required={required}
        />
      </div>
      <div className="info-error">
        {errorMessage && <TextAreaErrorMessage>{errorMessage}</TextAreaErrorMessage>}
        {textAreaMaxLimit ? (
          <TextAreaCounter className={status}>
            {String(value).length}/{textAreaMaxLimit}
          </TextAreaCounter>
        ) : null}
      </div>
      <TextAreaStatus className={status} />
    </TextAreaStyled>
  )
}
