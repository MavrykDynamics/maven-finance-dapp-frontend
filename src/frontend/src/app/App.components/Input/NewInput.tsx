import React, { useState, useCallback } from 'react'
import { BUTTON_SIMPLE } from '../Button/Button.constants'
import NewButton from '../Button/NewButton'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'

// utils
import { validateInput } from 'app/App.utils/input'

// hooks
import { useInputValidator } from 'app/App.hooks/useInputValidator'

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
    <InputMainContainer>
      <InputWrapper className={`${className} ${finalStatus} ${inputSize}`} id={'inputStyled'}>
        {label ? (
          <NewInputLabel>
            {label}

            <>{tooltip}</>
          </NewInputLabel>
        ) : null}

        <StyledInput
          {...inputProps}
          onChange={onChange}
          className={`${finalStatus} ${children ? 'remove-right-border-radius' : ''}`}
          autoComplete={'off'}
        />
        {Boolean(children) ? null : <InputStyledStatus className={`${finalStatus} ${inputSize}`} />}

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
      {finalErrorMessage && <InputErrorMessage>{finalErrorMessage}</InputErrorMessage>}
    </InputMainContainer>
  )
}
