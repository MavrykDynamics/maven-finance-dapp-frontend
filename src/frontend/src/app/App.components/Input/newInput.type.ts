import { InputSizeType, InputStatusType } from './Input.constants'
import { InputOneChange } from './Input.controller'

export type Settings = {
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
  settings: Settings
  inputProps: InputProps
}
