import { useDispatch } from 'react-redux'
import { BUTTON_PRIMARY, BUTTON_WIDE } from '../Button/Button.constants'
import Button from '../Button/NewButton'
import Icon from '../Icon/Icon.view'
import { connect } from './ConnectWallet.actions'
import { ConnectWalletBtnWrap } from './ConnectWallet.style'

const ConnectWalletBtn = () => {
  const dispatch = useDispatch()
  const connectWalletHandler = () => dispatch(connect())

  return (
    <ConnectWalletBtnWrap>
      <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={connectWalletHandler}>
        <Icon id="wallet" /> Connect Wallet
      </Button>
    </ConnectWalletBtnWrap>
  )
}

export default ConnectWalletBtn
