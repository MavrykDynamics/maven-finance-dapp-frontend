import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

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
import { useStakeContext } from 'providers/StakeProvider/stake.provider'

// actions
import { State } from 'reducers'
import { SMVK_TOKEN_ADDRESS, MVK_TOKEN_SYMBOL } from 'utils/constants'
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import {
  MVK_BALANCE_SUB,
  MVK_TOTAL_SUB,
  SMVK_HISTORY_SUB,
  DEFAULT_STAKING_ACTIVE_SUBS,
} from 'providers/StakeProvider/helpers/stake.consts'

export const DEFAULT_STAKE_UNSTAKE_INPUT: { amount: string; validation: InputStatusType; errorMessage: string } = {
  amount: '0',
  validation: '',
  errorMessage: '',
}

export const Doorman = () => {
  const { tokensPrices } = useTokensContext()
  const { userTokensBalances, userAddress } = useUserContext()
  const {
    totalStakedMvk,
    maximumTotalSupply,
    totalSupply,
    isLoading: isDoormanLoading,
    changeStakingSubscriptionsList,
  } = useStakeContext()

  useEffect(() => {
    changeStakingSubscriptionsList({
      [MVK_BALANCE_SUB]: true,
      [MVK_TOTAL_SUB]: true,
      [SMVK_HISTORY_SUB]: true,
    })

    return () => changeStakingSubscriptionsList(DEFAULT_STAKING_ACTIVE_SUBS)
  }, [])

  const { doormanAddress, mvkTokenAddress } = useSelector((state: State) => state.contractAddresses)

  const mvkExchangeRate = tokensPrices[MVK_TOKEN_SYMBOL] ?? 0
  const mySMvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS }),
    myMvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress.address })

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
              doormanAddress={doormanAddress.address}
              mvkTokenAddress={mvkTokenAddress.address}
            />
          </DoormanInfoStyled>
        </>
      )}
    </Page>
  )
}
