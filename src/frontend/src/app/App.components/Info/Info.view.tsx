import classNames from 'classnames'
import Icon from '../Icon/Icon.view'
import { getIconForInfoTyType, infoType } from './info.constants'
import { InfoBlock } from './info.style'

type Props = {
  text: string
  type: infoType
  showIcon?: boolean
  isLarge?: boolean
  children?: React.ReactNode
}

// TODO: add close banner btn and store it's id in sessionStorage that it's closed
export const Info = ({ children, text, type, showIcon = true, isLarge = false }: Props) => {
  const iconToUse = getIconForInfoTyType(type)

  const bannerClasses = classNames(type, {
    isLarge,
    hasBorder: showIcon,
    hasChild: Boolean(children),
  })

  return (
    <InfoBlock className={bannerClasses}>
      {showIcon ? <Icon id={iconToUse} className="info-icon" /> : null}
      <p>{text}</p>
      {children ? <div className="child">{children}</div> : null}
    </InfoBlock>
  )
}
