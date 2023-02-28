import React, { useLayoutEffect, useRef } from 'react'

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useLayoutEffect(() => {
    if (textareaRef && textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = Math.max(scrollHeight, 85) + 'px'
    }
  }, [value])

  let status = inputStatus !== undefined ? inputStatus : 'none'
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
          onChange={onChange}
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
      {/* <TextAreaStatus className={status} /> */}
      {errorMessage && <TextAreaErrorMessage>{errorMessage}</TextAreaErrorMessage>}
    </TextAreaStyled>
  )
}
