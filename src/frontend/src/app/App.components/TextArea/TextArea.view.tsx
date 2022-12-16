import {
  TextAreaStyled,
  TextAreaStatus,
  TextAreaIcon,
  TextAreaErrorMessage,
  TextAreaCounter,
  TextareaStyled,
} from './TextArea.style'
import { TextAreaStatusType } from './TextArea.controller'
import React, { useEffect, useRef, useState } from 'react'

type TextAreaViewProps = {
  icon?: string
  placeholder: string
  name?: string
  className?: string
  value: string | number
  textAreaMaxLimit: number
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  textAreaStatus?: TextAreaStatusType
  errorMessage?: string
  disabled?: boolean
  required?: boolean
}

export const TextAreaView = ({
  icon,
  placeholder,
  className,
  name,
  value,
  onChange,
  onBlur,
  textAreaStatus,
  errorMessage,
  disabled,
  required,
  textAreaMaxLimit,
}: TextAreaViewProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = Math.max(scrollHeight, 85) + 'px'
    }
  }, [value])

  let status = textAreaStatus !== undefined ? textAreaStatus : 'none'
  return (
    <TextAreaStyled className={className} id={'textAreaContainer'}>
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
      <TextAreaStatus className={status} />
      {errorMessage && <TextAreaErrorMessage>{errorMessage}</TextAreaErrorMessage>}
    </TextAreaStyled>
  )
}
