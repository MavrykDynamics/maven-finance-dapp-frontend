import { useUserContext } from 'providers/UserProvider/user.provider'

import { BUTTON_PRIMARY, BUTTON_WIDE } from '../Button/Button.constants'

import Button from '../Button/NewButton'
import Icon from '../Icon/Icon.view'
import { ConnectWalletBtnWrap } from './ConnectWallet.style'

const ConnectWalletBtn = () => {
  const { connect } = useUserContext()

  return (
    <ConnectWalletBtnWrap>
      <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} ignoreLoading onClick={connect}>
        <Icon id="wallet" /> Connect Wallet
      </Button>
    </ConnectWalletBtnWrap>
  )
}

export default ConnectWalletBtn
