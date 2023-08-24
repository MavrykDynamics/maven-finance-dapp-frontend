import { InputStatusType, InputKind, ERR_MSG_INPUT } from './Input.constants'
import { InputOneChange } from './Input.controller'

// hooks
import { useInputValidator } from './hooks/useInputValidator'

import {
  InputComponentContainer,
  InputErrorMessage,
  InputIcon,
  InputLabel,
  InputStatus,
  InputStyled,
} from './Input.style'
import { ValidatorFnType } from './newInput.type'
import { validateInput } from 'app/App.utils/input'

type InputViewProps = {
  icon?: string
  inputStatus?: InputStatusType
  errorMessage?: string
  pinnedText?: string
  kind?: InputKind
  className?: string
  validationFns?: ValidatorFnType[]
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
  validationFns = [[validateInput, ERR_MSG_INPUT]],
}: InputViewProps) => {
  const { onChange, value, onBlur } = inputProps
  const { status, errorMessage, handleChange } = useInputValidator({
    originalErrorMessage: errorMessageFromProps,
    status: inputStatus,
    onChange,
    onBlur,
    value,
    validationFns:
      validationFns && validationFns.length > 0 ? [[validateInput, ERR_MSG_INPUT], ...validationFns] : validationFns,
    allowInputAfterError: true,
  })

  return (
    <InputStyled className={className} id={'inputStyled'}>
      {icon && (
        <InputIcon>
          <use xlinkHref={`/icons/sprites.svg#${icon}`} />
        </InputIcon>
      )}
      <InputComponentContainer>
        <input {...inputProps} onChange={handleChange} className={status} autoComplete={inputProps.name} />
        <InputStatus className={`${status} ${pinnedText ? 'with-text' : ''}`} />
        {pinnedText && <InputLabel className={`${status} pinned-text`}>{pinnedText}</InputLabel>}
      </InputComponentContainer>
      {errorMessage && <InputErrorMessage>{errorMessage}</InputErrorMessage>}
    </InputStyled>
  )
}
