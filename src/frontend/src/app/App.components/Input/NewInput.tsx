import { useState, useCallback } from 'react'
import { BUTTON_SIMPLE } from '../Button/Button.constants'
import NewButton from '../Button/NewButton'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { InputSizeType, InputStatusType } from './Input.constants'
import { InputOneChange } from './Input.controller'

// consts
import { INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'

// helpers
import { validateAsciiInput } from './helpers/validateAsciiInput'

// styles
import { InputPinnedChild, InputStyledStatus, InputWrapper, NewInputLabel, StyledInput } from './Input.style'

type InputViewProps = {
  children?: React.ReactNode
  className?: string
  settings: {
    balance?: number
    balanceAsset?: string
    balanceName?: string
    useMaxHandler?: () => void
    balanceHandler?: () => void
    label?: string
    tooltip?: React.ReactNode
    inputStatus: InputStatusType
    convertedValue?: number
    inputSize?: InputSizeType
  }
  inputProps: {
    disabled?: boolean
    value: string | number
    type?: 'text' | 'number'
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
      if (validateAsciiInput(value)) {
        if (hasError) sethasError(false)
      } else {
        if (!hasError) sethasError(true)
      }

      inputProps.onChange(e)
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
