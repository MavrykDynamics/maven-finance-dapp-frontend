import classNames from 'classnames'

// view
import Icon from '../Icon/Icon.view'
import { CheckboxStyled } from './Checkbox.style'
import { useHover } from 'react-use'

type Props = {
  id: string
  checked: boolean
  disabled?: boolean
  onChangeHandler: () => void
  children?: React.ReactNode
}

export default function Checkbox({ id, checked, onChangeHandler, children, disabled }: Props) {
  const checkboxLabelText = (
    <label htmlFor={id} className="checkbox-text">
      {children}
    </label>
  )

  const [hoverableLabelText, isLabelTextHovered] = useHover(checkboxLabelText)
  return (
    <CheckboxStyled className={classNames({ disabled })}>
      <input type="checkbox" id={id} onChange={onChangeHandler} checked={checked} disabled={disabled} />
      <label
        htmlFor={id}
        id="checkbox-icon"
        className={classNames({ isLabelTextHovered: isLabelTextHovered && !disabled && !checked })}
      >
        <Icon id="check-fill" />
      </label>
      {hoverableLabelText}
    </CheckboxStyled>
  )
}
