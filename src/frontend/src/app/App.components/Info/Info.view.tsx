import Icon from '../Icon/Icon.view'
import { getIconForInfoTyType, infoType } from './info.constants'
import { InfoBlock } from './info.style'

type Props = {
  text: string | JSX.Element
  type: infoType
  children?: React.ReactNode
}

/**
 *
 * @props
 * {
 * text: simple string or JSX.Element (you should use JSX when there is a need to add some colored text, timer etc.
 * NOTE: no images, buttons and other similar stuff, only text)
 *
 * type: 'info' | 'error'
 * child: React.ReactNode - element that is displayed on the right side of the banner (f.e. timer, button)
 * }
 * @returns
 */
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
