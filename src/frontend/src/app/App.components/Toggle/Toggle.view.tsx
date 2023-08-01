import classNames from 'classnames'
import { ToggleStyle } from './Toggle.style'
import { PRIMARY_TOGGLE, ToggleType } from './Toggle.consts'

type Props = {
  onChange: () => void
  className?: string
  sufix?: string
  prefix?: string
  disabled?: boolean
  checked: boolean
  kind?: ToggleType
}

export default function Toggle({
  onChange,
  className,
  sufix,
  prefix,
  disabled = false,
  checked,
  kind = PRIMARY_TOGGLE,
}: Props) {
  return (
    <ToggleStyle className={classNames(className, kind, { disabled: disabled }, { checked: checked })}>
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
