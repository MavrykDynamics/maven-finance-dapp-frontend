import { TextAreaStyled, TextAreaStatus, TextAreaIcon, TextAreaErrorMessage, TextAreaCounter } from './TextArea.style'
import { TextAreaStatusType } from './TextArea.controller'
import { TextareaAutosize } from '@mui/material'

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
  let status = textAreaStatus !== undefined ? textAreaStatus : 'none'
  return (
    <TextAreaStyled className={className} id={'textAreaContainer'}>
      {icon && (
        <TextAreaIcon>
          <use xlinkHref={`/icons/sprites.svg#${icon}`} />
        </TextAreaIcon>
      )}
      <div className={`textArea-wrapper ${status} ${disabled ? 'disabled' : ''}`}>
        <TextareaAutosize
          minRows={4}
          aria-label="textArea"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`textarea`}
          name={name}
          onBlur={onBlur}
          autoComplete={name}
          disabled={disabled}
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
