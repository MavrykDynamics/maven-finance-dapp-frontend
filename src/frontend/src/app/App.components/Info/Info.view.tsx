// components
import Icon from '../Icon/Icon.view'
import { infoType } from './info.constants'

// style
import { InfoBlock } from './info.style'

type Props = {
  text: string
  type: infoType
  className?: string
  children?: React.ReactNode
}
export const Info = ({ children, text, type, className = '' }: Props) => {
  return (
    <InfoBlock className={`${type} ${className}`}>
      <div className="content">
        {type === 'warning' ? <Icon className='infoIcon' id="info" /> : null}
        <p>{text}</p>
      </div>
      {type === 'error' ? <Icon className='infoIcon' id="error" /> : null}
      {children}
    </InfoBlock>
  )
}
