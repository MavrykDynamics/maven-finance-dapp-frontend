import { InputStatusType, InputKind } from './Input.constants'
import { InputOneChange } from './Input.controller'
import {
  InputComponentContainer,
  InputErrorMessage,
  InputIcon,
  InputLabel,
  InputStatus,
  InputStyled,
} from './Input.style'

type InputViewProps = {
  icon?: string
  inputStatus?: InputStatusType
  errorMessage?: string
  pinnedText?: string
  kind?: InputKind
  className?: string
  inputProps: {
    disabled?: boolean
    value: string | number
    type?: string
    placeholder?: string
    name?: string
    id?: string
    onChange: InputOneChange
    onBlur?: InputOneChange
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
    onFocus?: InputOneChange
    required?: boolean
  }
}

export const InputView = ({
  icon,
  inputStatus,
  errorMessage,
  pinnedText,
  kind,
  className,
  inputProps,
}: InputViewProps) => {
  const classNames = `${kind ?? ''} ${inputStatus !== undefined ? inputStatus : 'none'}`

  return (
    <InputStyled className={className} id={'inputStyled'}>
      {icon && (
        <InputIcon>
          <use xlinkHref={`/icons/sprites.svg#${icon}`} />
        </InputIcon>
      )}
      <InputComponentContainer>
        <input {...inputProps} className={classNames} autoComplete={inputProps.name} />
        <InputStatus className={`${classNames} ${pinnedText ? 'with-text' : ''}`} />
        {pinnedText && <InputLabel className={`${classNames} pinned-text`}>{pinnedText}</InputLabel>}
      </InputComponentContainer>
      {errorMessage && <InputErrorMessage>{errorMessage}</InputErrorMessage>}
    </InputStyled>
  )
}
