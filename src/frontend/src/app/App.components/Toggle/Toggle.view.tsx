import classNames from 'classnames'
import { ToggleStyle } from './Toggle.style'

type Props = {
  onChange: () => void
  className?: string
  sufix?: string
  prefix?: string
  disabled?: boolean
  checked: boolean
}

export default function Toggle({ onChange, className, sufix, prefix, disabled = false, checked }: Props) {
  return (
    <ToggleStyle className={classNames(className, { disabled: disabled }, { checked: checked })}>
      {prefix ? <span className="prefix">{prefix}</span> : null}
      <div className="toggler">
        <label>
          <input type="checkbox" checked={checked} onChange={onChange} />
          <span className="slider" />
        </label>
      </div>
      {sufix ? <span className="sufix">{sufix}</span> : null}
    </ToggleStyle>
  )
}
