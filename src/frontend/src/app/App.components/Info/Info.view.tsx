import classNames from 'classnames'
import Icon from '../Icon/Icon.view'
import { getIconForInfoTyType, infoType } from './info.constants'
import { InfoBlock } from './info.style'

type Props = {
  text: string | JSX.Element
  type: infoType
  showIcon?: boolean
  isLarge?: boolean
  children?: React.ReactNode
}

// TODO: add close banner btn and store it's id in sessionStorage that it's closed

/**
 *
 * @props
 * {
 * text: simple string or JSX.Element (you should use JSX when there is a need to add some colored text, timer etc.
 * NOTE: no images, buttons and other similar stuff, only text)
 * type: 'info' | 'error'
 * isLarge: boolean value to take large className for banner
 * showIcon: boolean value to show left banner icon
 * children: React.ReactNode - element that is displayed on the right side of the banner (f.e. timer, button)
 * }
 * @returns
 */
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
