import { useCallback, useState } from 'react'
import { InputStatusType, InputKind } from './Input.constants'
import { InputOneChange } from './Input.controller'

// utils
import { validateInput } from 'app/App.utils/input'

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
  const [errorMsg, setErrorMsg] = useState('')

  const { finalStatus, finalErrorMessage } = useInputValidator({
    originalErrorMessage: errorMessageFromProps,
    internalErrorMessage: errorMsg,
    status: inputStatus,
  })

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target

      const errorMessage = validateInput(value)
      setErrorMsg(errorMessage)

      inputProps.onChange(e)
    },
    [errorMsg, inputProps.onChange],
  )

  return (
    <InputStyled className={className} id={'inputStyled'}>
      {icon && (
        <InputIcon>
          <use xlinkHref={`/icons/sprites.svg#${icon}`} />
        </InputIcon>
      )}
      <InputComponentContainer>
        <input {...inputProps} onChange={onChange} className={finalStatus} autoComplete={inputProps.name} />
        <InputStatus className={`${finalStatus} ${pinnedText ? 'with-text' : ''}`} />
        {pinnedText && <InputLabel className={`${finalStatus} pinned-text`}>{pinnedText}</InputLabel>}
      </InputComponentContainer>
      {finalErrorMessage && <InputErrorMessage>{finalErrorMessage}</InputErrorMessage>}
    </InputStyled>
  )
}
