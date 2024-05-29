import { useLockBodyScroll } from 'react-use'

import { PopupContainer } from '../popup/PopupMain.style'
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
    <PopupContainer $show={isModalOpened}>
      <PolicyPopupContent proccedPolicy={proccedPolicy} />
    </PopupContainer>
  )
}
