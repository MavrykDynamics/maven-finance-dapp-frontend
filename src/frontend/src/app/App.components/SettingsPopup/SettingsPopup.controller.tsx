import { PopupChangeNodeView } from './SettingsPopup.view'

import { PopupContainer } from './SettingsPopup.style'
import { useLockBodyScroll } from 'react-use'

export const PopupChangeNode = ({ isModalOpened, closeModal }: { isModalOpened: boolean; closeModal: () => void }) => {
  useLockBodyScroll(isModalOpened)

  return (
    <PopupContainer onClick={closeModal} show={isModalOpened}>
      <PopupChangeNodeView closeModal={closeModal} />
    </PopupContainer>
  )
}
