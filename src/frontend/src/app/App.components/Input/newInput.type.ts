import { ERR_MSG_INPUT, ERR_MSG_NONE, ERR_MSG_TOAST, InputSizeType, InputStatusType } from './Input.constants'
import { InputOneChange } from './Input.controller'

export type ErrorMessagePosition = typeof ERR_MSG_TOAST | typeof ERR_MSG_INPUT | typeof ERR_MSG_NONE

export type ValidatorFnType<T = any> = [
  (v: string, ...args: T[]) => readonly [boolean, string | null],
  ErrorMessagePosition,
  T[]?,
]

export type InputSettings = {
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
  errorMessage?: string
  showErrorMessage?: boolean
  allowInputAfterError?: boolean
  validationFns?: ValidatorFnType[]
  updateInputStatus?: (newInputStatus: InputStatusType) => void
}

export type InputProps = {
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

export type InputViewProps = {
  children?: React.ReactNode
  className?: string
  settings: InputSettings
  inputProps: InputProps
}
