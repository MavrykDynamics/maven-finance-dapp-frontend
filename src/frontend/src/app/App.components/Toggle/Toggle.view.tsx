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
    <ToggleStyle className={`${className} ${disabled ? 'disabled' : ''}`}>
      {prefix ? <span className="prefix">{prefix}</span> : null}
      <div className="toggler">
        <label className={checked ? 'checked' : ''}>
          <input type="checkbox" checked={checked} onChange={onChange} />
          <span className="slider" />
        </label>
      </div>
      {sufix ? <span className="sufix">{sufix}</span> : null}
    </ToggleStyle>
  )
}
