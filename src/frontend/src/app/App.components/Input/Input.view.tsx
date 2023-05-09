import { useCallback, useState } from 'react'
import { InputStatusType, InputKind, INPUT_STATUS_ERROR } from './Input.constants'
import { InputOneChange } from './Input.controller'

// utils
import { validateAsciiInput, containsCharacterOnTheSides } from 'app/App.utils/input'

// consts
import { INPUT_ASCII_TEXT, INPUT_WHITE_SPACE_TEXT } from 'app/App.utils/input/input.consts'

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
  const classNames = `${kind ?? ''} ${
    Boolean(errorMsg) ? INPUT_STATUS_ERROR : inputStatus !== undefined ? inputStatus : 'none'
  }`

  const internalErrorMsg = Boolean(errorMsg) ? errorMsg : Boolean(errorMessageFromProps) ? errorMessageFromProps : ''

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target

      if (validateAsciiInput(value)) {
        if (errorMsg) setErrorMsg('')
      } else {
        setErrorMsg(INPUT_ASCII_TEXT)
      }

      if (!containsCharacterOnTheSides(value)) {
        if (errorMsg) setErrorMsg('')
      } else {
        setErrorMsg(INPUT_WHITE_SPACE_TEXT)
      }

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
        <input {...inputProps} onChange={onChange} className={classNames} autoComplete={inputProps.name} />
        <InputStatus className={`${classNames} ${pinnedText ? 'with-text' : ''}`} />
        {pinnedText && <InputLabel className={`${classNames} pinned-text`}>{pinnedText}</InputLabel>}
      </InputComponentContainer>
      {internalErrorMsg && <InputErrorMessage>{internalErrorMsg}</InputErrorMessage>}
    </InputStyled>
  )
}
