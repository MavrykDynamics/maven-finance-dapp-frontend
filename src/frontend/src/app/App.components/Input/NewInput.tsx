import React, { useState, useCallback } from 'react'
import { BUTTON_SIMPLE } from '../Button/Button.constants'
import NewButton from '../Button/NewButton'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'

// consts
import { INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'

// utils
import { validateAsciiInput, trimSpaces, recreateEventWithUpdatedTargetValue } from 'app/App.utils/input'

// types
import { InputViewProps } from './newInput.type'

// styles
import { InputPinnedChild, InputStyledStatus, InputWrapper, NewInputLabel, StyledInput } from './Input.style'

export const Input = ({
  children,
  className,
  inputProps,
  settings: {
    balance,
    balanceAsset,
    useMaxHandler,
    balanceHandler,
    convertedValue,
    label,
    tooltip,
    balanceName = 'Balance',
    inputStatus,
    inputSize,
  },
}: InputViewProps) => {
  const [hasError, sethasError] = useState(false)

  const internalInputStatus = hasError ? INPUT_STATUS_ERROR : inputStatus

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target

      const trimmedValue = trimSpaces(value)

      if (validateAsciiInput(trimmedValue)) {
        if (hasError) sethasError(false)
      } else {
        if (!hasError) sethasError(true)
      }

      const _event = recreateEventWithUpdatedTargetValue(e, trimmedValue)

      inputProps.onChange(_event)
    },
    [hasError, inputProps.onChange],
  )

  return (
    <InputWrapper className={`${className} ${internalInputStatus} ${inputSize}`} id={'inputStyled'}>
      {label ? (
        <NewInputLabel>
          {label}

          <>{tooltip}</>
        </NewInputLabel>
      ) : null}

      <StyledInput
        {...inputProps}
        onChange={onChange}
        className={`${internalInputStatus} ${children ? 'remove-right-border-radius' : ''}`}
        autoComplete={'off'}
      />
      {Boolean(children) ? null : <InputStyledStatus className={`${internalInputStatus} ${inputSize}`} />}

      {balance !== undefined && balanceAsset ? (
        <div onClick={balanceHandler}>
          <CommaNumber
            value={balance}
            beginningText={`${balanceName}: `}
            endingText={balanceAsset}
            className={`input-balance ${balanceHandler ? 'pointer' : ''}`}
          />
        </div>
      ) : null}

      {useMaxHandler ? (
        <div className="useMax-btn">
          <NewButton onClick={useMaxHandler} kind={BUTTON_SIMPLE}>
            Use Max
          </NewButton>
        </div>
      ) : null}

      {convertedValue !== undefined ? (
        <CommaNumber value={convertedValue} beginningText={'= $'} className={'input-converted-amount'} />
      ) : null}

      {children && <InputPinnedChild className="pinned-child">{children}</InputPinnedChild>}
    </InputWrapper>
  )
}
