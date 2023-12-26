import { useEffect, useState } from 'react'

// style
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { Page } from 'styles'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DoormanInfoStyled } from './Doorman.style'
import { DoormanChart } from './DoormanChart/DoormanChart.controller'
import { ExitFeeModal } from './ExitFeeModal/ExitFeeModal.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { DoormanStats } from './DoormanStats/DoormanStats.controller'
import { StakeUnstakeView } from './StakeUnstake/StakeUnstake.view'

// providers
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useDoormanContext } from 'providers/DoormanProvider/doorman.provider'

// actions
import { MVN_TOKEN_SYMBOL, SMVN_TOKEN_ADDRESS } from 'utils/constants'
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { DAPP_MVK_SMVK_STATS_SUB, DEFAULT_STAKING_ACTIVE_SUBS } from 'providers/DoormanProvider/helpers/doorman.consts'
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITE_DATA_SUB,
  SATELLITES_DATA_SINGLE_SUB,
} from 'providers/SatellitesProvider/satellites.const'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

export const DEFAULT_STAKE_UNSTAKE_INPUT: { amount: string; validation: InputStatusType; errorMessage: string } = {
  amount: '0',
  validation: '',
  errorMessage: '',
}

export const Doorman = () => {
  const { tokensPrices } = useTokensContext()
  const { userTokensBalances, userAddress } = useUserContext()
  const {
    contractAddresses: { doormanAddress, mvnTokenAddress },
  } = useDappConfigContext()
  const { changeSatellitesSubscriptionsList } = useSatellitesContext()
  const {
    totalStakedMvk,
    maximumTotalSupply,
    totalSupply,
    isLoading: isDoormanLoading,
    changeStakingSubscriptionsList,
  } = useDoormanContext()

  useEffect(() => {
    changeStakingSubscriptionsList({
      [DAPP_MVK_SMVK_STATS_SUB]: true,
    })

    changeSatellitesSubscriptionsList({ [SATELLITE_DATA_SUB]: SATELLITES_DATA_SINGLE_SUB })

    return () => {
      changeStakingSubscriptionsList(DEFAULT_STAKING_ACTIVE_SUBS)
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
    }
  }, [])

  const mvkExchangeRate = tokensPrices[MVN_TOKEN_SYMBOL] ?? 0
  const mySMvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVN_TOKEN_ADDRESS }),
    myMvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvnTokenAddress })

  const [unstakePopupActive, setUnstakePopupActive] = useState(false)

  const [stakeUnstakeInput, setStakeUnstakeInput] = useState(DEFAULT_STAKE_UNSTAKE_INPUT)

  const closeExitFeePopup = () => setUnstakePopupActive(false)
  const openExitFeePopup = () => setUnstakePopupActive(true)

  const exitFeeModal = {
    mvkExchangeRate,
    totalMVKSupply: totalSupply,
    mySMvkTokenBalance,
    myMvkTokenBalance,
    totalStakedMvk,
    userAddress,
  }

  useEffect(() => {
    setStakeUnstakeInput({
      amount: '0',
      validation: '',
      errorMessage: '',
    })
  }, [userAddress])

  return (
    <Page>
      <PageHeader page={'doorman'} />

      {isDoormanLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading doorman data</div>
        </DataLoaderWrapper>
      ) : (
        <>
          <ExitFeeModal
            show={unstakePopupActive}
            data={exitFeeModal}
            inputData={stakeUnstakeInput}
            setInputData={setStakeUnstakeInput}
            closePopup={closeExitFeePopup}
          />
          <StakeUnstakeView
            mvkExchangeRate={mvkExchangeRate}
            openExitFeePopup={openExitFeePopup}
            inputData={stakeUnstakeInput}
            setInputData={setStakeUnstakeInput}
          />
          <DoormanInfoStyled>
            <DoormanChart />
            <DoormanStats
              mvkExchangeRate={mvkExchangeRate}
              maximumTotalSupply={maximumTotalSupply}
              totalStakedMvk={totalStakedMvk}
              totalSupply={totalSupply}
              doormanAddress={doormanAddress}
              mvkTokenAddress={mvnTokenAddress}
            />
          </DoormanInfoStyled>
        </>
      )}
    </Page>
  )
}
