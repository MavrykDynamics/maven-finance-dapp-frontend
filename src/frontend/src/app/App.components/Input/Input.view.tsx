import { useCallback, useState } from 'react'
import { InputStatusType, InputKind, INPUT_STATUS_ERROR } from './Input.constants'
import { InputOneChange } from './Input.controller'

// utils
import { validateAsciiInput, trimSpaces, recreateEventWithUpdatedTargetValue } from 'app/App.utils/input'

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
  const [hasError, setHasError] = useState(false)
  const classNames = `${kind ?? ''} ${hasError ? INPUT_STATUS_ERROR : inputStatus !== undefined ? inputStatus : 'none'}`

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target

      const trimmedValue = trimSpaces(value)

      if (validateAsciiInput(trimmedValue)) {
        if (hasError) setHasError(false)
      } else {
        if (!hasError) setHasError(true)
      }

      const _event = recreateEventWithUpdatedTargetValue(e, trimmedValue)

      inputProps.onChange(_event)
    },
    [hasError, inputProps.onChange],
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
      {errorMessage && <InputErrorMessage>{errorMessage}</InputErrorMessage>}
    </InputStyled>
  )
}
