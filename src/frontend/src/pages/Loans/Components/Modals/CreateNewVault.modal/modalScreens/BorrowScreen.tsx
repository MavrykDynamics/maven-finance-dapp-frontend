import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import classNames from 'classnames'
import React, { useMemo, useState } from 'react'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { INPUT_STATUS_DEFAULT, INPUT_STATUS_ERROR, InputStatusType } from 'app/App.components/Input/Input.constants'
import { checkNan } from 'utils/checkNan'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'
import { useCreateVaultContext } from '../helpers/createVaultModalContext'

export const BorrowScreen = () => {
  return (
    <div>
      <div className="tab-text">Select Amount to Borrow</div>
    </div>
  )
}
