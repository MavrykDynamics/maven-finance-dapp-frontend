// view
import Icon from '../Icon/Icon.view'

// style
import { CheckboxStyled } from './Checkbox.style'

type Props = {
  id: string
  className?: string
  checked: boolean
  disabled?: boolean
  onChangeHandler: () => void
  children?: JSX.Element
}

export default function Checkbox({ id, className = '', checked, onChangeHandler, children, disabled }: Props) {
  return (
    <CheckboxStyled className={`${className} ${disabled ? 'disabled' : ''}`}>
      <input type="checkbox" id={id} onChange={onChangeHandler} checked={Boolean(checked)} disabled={disabled} />
      <label htmlFor={id}>
        <Icon id="check-fill" />
      </label>
      {children ? <div className="children">{children}</div> : null}
    </CheckboxStyled>
  )
}
