import { useSelector } from 'react-redux'

// state
import { State } from '../../../reducers'

// view
import ConnectWalletBtn from './ConnectWalletBtn'
import { Info } from '../Info/Info.view'
import { INFO_DEFAULT } from '../Info/info.constants'

const ConnectWalletBanner = () => {
  const { accountPkh } = useSelector((state: State) => state.wallet)

  return accountPkh ? null : (
    <Info
      showIcon={false}
      isLarge
      text="Connect your wallet to see your personal up-to-date data and be able to make transactions. If you don’t have a wallet, please click on the button on the right and install it."
      type={INFO_DEFAULT}
    >
      <ConnectWalletBtn />
    </Info>
  )
}

export default ConnectWalletBanner
