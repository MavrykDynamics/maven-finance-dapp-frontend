import Icon from '../Icon/Icon.view'
import { getIconForInfoTyType, infoType } from './info.constants'
import { InfoBlock } from './info.style'

type Props = {
  text: string | JSX.Element
  type: infoType
  children?: React.ReactNode
}

export const Info = ({ children, text, type }: Props) => {
  const iconToUse = getIconForInfoTyType(type)

  return (
    <InfoBlock className={type}>
      <div className="content">
        <Icon id={iconToUse} className="info-icon" />
        <p>{text}</p>
        <div className="child">{children}</div>
      </div>
    </InfoBlock>
  )
}
