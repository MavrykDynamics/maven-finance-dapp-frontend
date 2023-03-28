import { useLockBodyScroll } from 'react-use'
import { PopupContainer, PopupContainerWrapper } from '../../SettingsPopup/SettingsPopup.style'
import { WertIo } from '../ConnectWallet.style'

const WertIoPopup = ({ closePopup, isOpened }: { closePopup: () => void; isOpened: boolean }) => {
  useLockBodyScroll(isOpened)

  return (
    <PopupContainer onClick={closePopup} show={isOpened}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="wert-io-wrapper">
        <button onClick={closePopup} className="close-modal" />
        <WertIo id="wert-io-popup-wrapper" />
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

export default WertIoPopup
