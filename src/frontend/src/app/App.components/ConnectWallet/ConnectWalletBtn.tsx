import { useDispatch } from 'react-redux'
import { BUTTON_PRIMARY, BUTTON_WIDE } from '../Button/Button.constants'
import Button from '../Button/NewButton'
import Icon from '../Icon/Icon.view'
import { connect } from './ConnectWallet.actions'
import { ConnectWalletBtnWrap } from './ConnectWallet.style'
import { useUserContext } from 'providers/UserProvider/user.provider'

const ConnectWalletBtn = () => {
  const dispatch = useDispatch()

  const { connect: connectContextUser } = useUserContext()
  const connectWalletHandler = async () => {
    await dispatch(connect())
    connectContextUser()
  }

  return (
    <ConnectWalletBtnWrap>
      <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} ignoreLoading onClick={connectWalletHandler}>
        <Icon id="wallet" /> Connect Wallet
      </Button>
    </ConnectWalletBtnWrap>
  )
}

export default ConnectWalletBtn
