import Icon from '../Icon/Icon.view'
import { infoType } from './info.constants'
import { InfoBlock } from './info.style'

type Props = {
  text: string
  type: infoType
  children?: React.ReactNode
}

export const Info = ({ children, text, type }: Props) => {
  return (
    <InfoBlock className={type}>
      <div className="content">
        <Icon id="info" className='info-icon' />
        <p>{text}</p>
        <div className="child">{children}</div>
      </div>
    </InfoBlock>
  )
}
