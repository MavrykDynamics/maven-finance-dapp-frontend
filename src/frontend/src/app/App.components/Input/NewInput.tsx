import { ACTION_SIMPLE } from '../Button/Button.constants'
import NewButton from '../Button/NewButton.controller'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { InputStatusType } from './Input.constants'
import { InputOneChange } from './Input.controller'
import { InputPinnedChild, InputStyledStatus, InputWrapper, StyledInput } from './Input.style'

type InputViewProps = {
  children?: React.ReactNode
  className?: string
  settings: {
    balance?: number
    balanceAsset?: string
    useMaxHandler?: () => void
    errorMessage?: string
    inputStatus: InputStatusType
    convertedValue?: number
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
  settings: { balance, balanceAsset, useMaxHandler, convertedValue, errorMessage, inputStatus },
}: InputViewProps) => {
  return (
    <InputWrapper className={className} id={'inputStyled'}>
      <StyledInput {...inputProps} className={inputStatus} autoComplete={inputProps.name} />
      {/* <InputStyledStatus className={`${inputStatus} ${children ? 'hasChild' : ''}`} /> */}

      {balance && balanceAsset ? (
        <CommaNumber value={balance} beginningText="Balance:" endingText={balanceAsset} className={'input-balance'} />
      ) : null}

      {useMaxHandler ? (
        <NewButton onClick={useMaxHandler} kind={ACTION_SIMPLE} className="use-max-btn">
          Use Max
        </NewButton>
      ) : null}

      {convertedValue !== undefined ? (
        <CommaNumber value={convertedValue} beginningText={'= '} endingText="$" className={'input-converted-amount'} />
      ) : null}

      {children && <InputPinnedChild className="pinned-child">{children}</InputPinnedChild>}
    </InputWrapper>
  )
}
