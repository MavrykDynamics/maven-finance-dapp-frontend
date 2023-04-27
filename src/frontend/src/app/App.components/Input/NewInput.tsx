import { BUTTON_SIMPLE } from '../Button/Button.constants'
import NewButton from '../Button/NewButton'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { InputSizeType, InputStatusType } from './Input.constants'
import { InputOneChange } from './Input.controller'
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
  return (
    <InputWrapper className={`${className} ${inputStatus} ${inputSize}`} id={'inputStyled'}>
      {label ? (
        <NewInputLabel>
          {label}

          <>{tooltip}</>
        </NewInputLabel>
      ) : null}

      <StyledInput
        {...inputProps}
        className={`${inputStatus} ${children ? 'remove-right-border-radius' : ''}`}
        autoComplete={'off'}
      />
      {Boolean(children) ? null : <InputStyledStatus className={`${inputStatus} ${inputSize}`} />}

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
