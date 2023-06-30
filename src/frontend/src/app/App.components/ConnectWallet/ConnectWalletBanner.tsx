import { useUserContext } from 'providers/UserProvider/user.provider'

import ConnectWalletBtn from './ConnectWalletBtn'
import { Info } from '../Info/Info.view'

import { INFO_DEFAULT, INFO_LARGE } from '../Info/info.constants'

const ConnectWalletBanner = () => {
  const { userAddress } = useUserContext()

  return userAddress ? null : (
    <Info
      showIcon={false}
      size={INFO_LARGE}
      text="Connect your wallet to see your personal up-to-date data and be able to make transactions. If you don’t have a wallet, please click on the button on the right and install it."
      type={INFO_DEFAULT}
    >
      <ConnectWalletBtn />
    </Info>
  )
}

export default ConnectWalletBanner
