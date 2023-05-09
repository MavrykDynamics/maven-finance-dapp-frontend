import React, { useState, useCallback } from 'react'
import { BUTTON_SIMPLE } from '../Button/Button.constants'
import NewButton from '../Button/NewButton'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'

// consts
import { INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'
import { INPUT_ASCII_TEXT, INPUT_WHITE_SPACE_TEXT } from 'app/App.utils/input/input.consts'

// utils
import { containsCharacterOnTheSides, validateAsciiInput } from 'app/App.utils/input'

// types
import { InputViewProps } from './newInput.type'

// styles
import {
  InputPinnedChild,
  InputStyledStatus,
  InputWrapper,
  NewInputLabel,
  StyledInput,
  InputErrorMessage,
  InputMainContainer,
} from './Input.style'

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
    errorMessage: errorMessageFromProps,
  },
}: InputViewProps) => {
  const [errorMsg, setErrorMsg] = useState('')

  const internalInputStatus = errorMsg ? INPUT_STATUS_ERROR : inputStatus
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
    <InputMainContainer>
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
      {internalErrorMsg && <InputErrorMessage>{internalErrorMsg}</InputErrorMessage>}
    </InputMainContainer>
  )
}
