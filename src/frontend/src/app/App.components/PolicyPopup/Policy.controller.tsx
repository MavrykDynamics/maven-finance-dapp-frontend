import { CSSTransition } from 'react-transition-group'
import { useLockBodyScroll } from 'react-use'

import { PopupContainer } from '../SettingsPopup/SettingsPopup.style'
import { PolicyPopupContent } from './PolicyPopupContent.controller'

export const PolicyPopup = ({
  isModalOpened,
  proccedPolicy,
}: {
  isModalOpened: boolean
  proccedPolicy: () => void
}) => {
  useLockBodyScroll(isModalOpened)

  return (
    <CSSTransition in={isModalOpened} timeout={200} unmountOnExit>
      <PopupContainer show={isModalOpened}>
        <PolicyPopupContent proccedPolicy={proccedPolicy} />
      </PopupContainer>
    </CSSTransition>
  )
}
