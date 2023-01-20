import { InputStatusType, InputKind } from './Input.constants'
import { InputView } from './Input.view'

export type InputOneChange = React.ChangeEventHandler<HTMLInputElement>
type InputProps = {
  id?: string
  icon?: string
  placeholder?: string
  name?: string
  value: string | number
  onChange: InputOneChange
  onBlur?: InputOneChange
  onFocus?: InputOneChange
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  inputStatus?: InputStatusType
  type?: string
  errorMessage?: string
  disabled?: boolean
  required?: boolean
  pinnedText?: string
  kind?: InputKind
  className?: string
}

export const Input = ({
  id = '',
  onChange,
  value,
  onBlur,
  onFocus,
  onKeyDown,
  placeholder,
  name,
  type,
  disabled,
  required,
  ...restIputProps
}: InputProps) => {
  return (
    <InputView
      {...restIputProps}
      inputProps={{ id, onChange, value, onBlur, onFocus, onKeyDown, placeholder, name, type, disabled, required }}
    />
  )
}
