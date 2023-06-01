import { InputStatusType, InputKind } from './Input.constants'
import { InputOneChange } from './Input.controller'

// hooks
import { useInputValidator } from 'app/App.hooks/useInputValidator'

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
  errorMessage: errorMessageFromProps,
  pinnedText,
  kind,
  className,
  inputProps,
}: InputViewProps) => {
  const { status, errorMessage, handleChange } = useInputValidator({
    originalErrorMessage: errorMessageFromProps,
    status: inputStatus,
    onChange: inputProps.onChange,
  })

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.persist()
    const trimmedValue = e.target.value.trim()
    e.target.value = trimmedValue
    inputProps?.onBlur?.(e)
  }

  return (
    <InputStyled className={className} id={'inputStyled'}>
      {icon && (
        <InputIcon>
          <use xlinkHref={`/icons/sprites.svg#${icon}`} />
        </InputIcon>
      )}
      <InputComponentContainer>
        <input
          {...inputProps}
          onBlur={handleBlur}
          onChange={handleChange}
          className={status}
          autoComplete={inputProps.name}
        />
        <InputStatus className={`${status} ${pinnedText ? 'with-text' : ''}`} />
        {pinnedText && <InputLabel className={`${status} pinned-text`}>{pinnedText}</InputLabel>}
      </InputComponentContainer>
      {errorMessage && <InputErrorMessage>{errorMessage}</InputErrorMessage>}
    </InputStyled>
  )
}
