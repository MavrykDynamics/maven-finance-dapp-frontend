import React, { useLayoutEffect, useRef, useState, useCallback } from 'react'

// utils
import { validateAsciiInput, trimSpaces, recreateEventWithUpdatedTargetValue } from 'app/App.utils/input'

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
  errorMessage,
  disabled,
  required,
  label,
  textAreaMaxLimit = 1000,
}: TextAreaProps) => {
  const [hasError, setHasError] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useLayoutEffect(() => {
    if (textareaRef && textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = Math.max(scrollHeight, 85) + 'px'
    }
  }, [value])

  let status = hasError ? 'error' : inputStatus !== undefined ? inputStatus : 'none'

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = e.target

      const trimmedValue = trimSpaces(value)

      if (validateAsciiInput(trimmedValue, true)) {
        if (hasError) setHasError(false)
      } else {
        if (!hasError) setHasError(true)
      }

      const _event = recreateEventWithUpdatedTargetValue(e, trimmedValue)

      onChange(_event)
    },
    [hasError, onChange],
  )
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
          onBlur={onBlur}
          autoComplete={name}
          disabled={disabled}
          ref={textareaRef}
          required={required}
        />
      </div>

      <TextAreaCounter className={status}>
        {String(value).length}/{textAreaMaxLimit}
      </TextAreaCounter>
      <TextAreaStatus className={status} />
      {errorMessage && <TextAreaErrorMessage>{errorMessage}</TextAreaErrorMessage>}
    </TextAreaStyled>
  )
}
