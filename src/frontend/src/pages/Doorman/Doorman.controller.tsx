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
import { SMVK_TOKEN_SYMBOL, MVK_TOKEN_SYMBOL } from 'utils/constants'
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { SUB_SUBSCRIBE } from 'utils/api/apollo.consts'

export const DEFAULT_STAKE_UNSTAKE_INPUT: { amount: string; validation: InputStatusType; errorMessage: string } = {
  amount: '0',
  validation: '',
  errorMessage: '',
}

export const Doorman = () => {
  const {
    totalStakedMvk,
    maximumTotalSupply,
    totalSupply,
    changeStakingSubscriptionType,
    isLoading: isDoormanLoading,
  } = useStakeContext()

  const { doormanAddress, mvkTokenAddress } = useSelector((state: State) => state.contractAddresses)
  const {
    accountPkh,
    user: { userTokens },
  } = useSelector((state: State) => state.wallet)
  const { mvk: mvkExchangeRate = 0 } = useSelector((state: State) => state.tokens.tokensPrices)

  const mySMvkTokenBalance = userTokens[SMVK_TOKEN_SYMBOL].balance,
    myMvkTokenBalance = userTokens[MVK_TOKEN_SYMBOL].balance

  const [unstakePopupActive, setUnstakePopupActive] = useState(false)

  const [stakeUnstakeInput, setStakeUnstakeInput] = useState(DEFAULT_STAKE_UNSTAKE_INPUT)

  // useEffect(() => {
  //   changeStakingSubscriptionType({
  //     skipAddressBalance: SUB_SUBSCRIBE,
  //     skipMvkTokenTotal: SUB_SUBSCRIBE,
  //     skipStakeHistory: SUB_SUBSCRIBE,
  //     skipUserBalance: SUB_SUBSCRIBE,
  //   })
  // }, [])

  const closeExitFeePopup = () => setUnstakePopupActive(false)
  const openExitFeePopup = () => setUnstakePopupActive(true)

  const exitFeeModal = {
    mvkExchangeRate,
    totalMVKSupply: totalSupply,
    mySMvkTokenBalance,
    myMvkTokenBalance,
    totalStakedMvk,
    accountPkh,
  }

  useEffect(() => {
    setStakeUnstakeInput({
      amount: '0',
      validation: '',
      errorMessage: '',
    })
  }, [accountPkh])

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
