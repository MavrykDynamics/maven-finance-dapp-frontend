import { useState } from 'react'
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
import { useStakeUpdater } from 'providers/StakeProvider/hooks/useStakeUpdater'

// actions
import { State } from 'reducers'
import { SMVK_TOKEN_SYMBOL, MVK_TOKEN_SYMBOL } from 'utils/constants'

export const Doorman = () => {
  const { totalStakedMvk, maximumTotalSupply, totalSupply } = useStakeContext()

  const { doormanAddress, mvkTokenAddress } = useSelector((state: State) => state.contractAddresses)
  const {
    accountPkh,
    user: { userTokens },
  } = useSelector((state: State) => state.wallet)
  const { mvk: mvkExchangeRate = 0 } = useSelector((state: State) => state.tokens.tokensPrices)

  const mySMvkTokenBalance = userTokens[SMVK_TOKEN_SYMBOL].balance,
    myMvkTokenBalance = userTokens[MVK_TOKEN_SYMBOL].balance
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

  const { isIntialLoading: isDoormanLoading } = useStakeUpdater()

  const unstakeCallback = (amount: number) => setAmount(amount)
  const closeExitFeePopup = () => setAmount(null)

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
          <ExitFeeModal show={amount !== null} data={exitFeeModal} closePopup={closeExitFeePopup} />
          <StakeUnstakeView MVK_exchangeRate={mvkExchangeRate} unstakeCallback={unstakeCallback} />
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
