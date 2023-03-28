import { useLockBodyScroll } from 'react-use'
import { PopupContainer } from '../../SettingsPopup/SettingsPopup.style'
import { WertIo } from '../ConnectWallet.style'

const WertIoPopup = ({ closePopup, isOpened }: { closePopup: () => void; isOpened: boolean }) => {
  useLockBodyScroll(isOpened)

  return (
    <PopupContainer onClick={closePopup} show={isOpened}>
      <div className="wert-io-wrapper">
        <div onClick={closePopup} className="close-modal">
          ×
        </div>
        <WertIo id="wert-io-popup-wrapper" />
      </div>
    </PopupContainer>
  )
}

export default WertIoPopup
