import classNames from 'classnames'
import Icon from '../Icon/Icon.view'
import { getIconForInfoTyType, infoType, InfoSize } from './info.constants'
import { InfoBlock } from './info.style'

type Props = {
  text: React.ReactNode
  type: infoType
  showIcon?: boolean
  children?: React.ReactNode
  size?: InfoSize
}

// TODO: add close banner btn and store it's id in sessionStorage that it's closed

/**
 *
 * @props
 * {
 * text: simple string or React.ReactNode (you should use JSX when there is a need to add some colored text, timer etc.
 * NOTE: no images, buttons and other similar stuff, only text)
 * type: 'info' | 'error' | 'success
 * showIcon: boolean value to show left banner icon
 * size: 'small' | 'medium' | 'large'
 * children: React.ReactNode - element that is displayed on the right side of the banner (f.e. timer, button)
 * }
 * @returns
 */
export const Info = ({ children, text, type, showIcon = true, size = 'medium' }: Props) => {
  const iconToUse = getIconForInfoTyType(type)

  const bannerClasses = classNames(type, {
    [size]: size,
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
