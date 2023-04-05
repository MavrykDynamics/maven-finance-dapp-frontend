import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

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

// actions
import { getDoormanStorage, stake } from './Doorman.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { State } from 'reducers'

export const Doorman = () => {
  const dispatch = useDispatch()

  const { doormanAddress, mvkTokenAddress } = useSelector((state: State) => state.contractAddresses)
  const {
    accountPkh,
    user: { mySMvkTokenBalance, myMvkTokenBalance },
  } = useSelector((state: State) => state.wallet)
  const {
    totalStakedMvk,
    maximumTotalSupply,
    totalSupply,
    isLoaded: isDoormanLoaded,
  } = useSelector((state: State) => state.doorman)
  const { mvk: mvkExchangeRate = 0 } = useSelector((state: State) => state.tokens.tokensPrices)

  const [amount, setAmount] = useState<null | number>(null)
  const exitFeeModal = {
    amount: Number(amount),
    mvkExchangeRate,
    totalMVKSupply: totalSupply,
    mySMvkTokenBalance,
    myMvkTokenBalance,
    totalStakedMvk,
    accountPkh,
  }

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        if (!isDoormanLoaded || isDepsChanged) {
          await dispatch(getDoormanStorage())
        }
      } catch (e) {}
    },
    [accountPkh],
  )

  const stakeCallback = (amount: number) => dispatch(stake(amount))
  const unstakeCallback = (amount: number) => setAmount(amount)
  const closeExitFeePopup = () => setAmount(null)

  return (
    <Page>
      <PageHeader page={'doorman'} />

      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading doorman data</div>
        </DataLoaderWrapper>
      ) : (
        <>
          <ExitFeeModal show={amount !== null} data={exitFeeModal} closePopup={closeExitFeePopup} />
          <StakeUnstakeView
            MVK_exchangeRate={mvkExchangeRate}
            stakeCallback={stakeCallback}
            unstakeCallback={unstakeCallback}
          />
          <DoormanInfoStyled>
            <DoormanChart />
            <DoormanStats
              MVK_exchangeRate={mvkExchangeRate}
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
