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
import { getDoormanStorage, getMvkTokenStorage, stake } from './Doorman.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { State } from 'reducers'

export const Doorman = () => {
  const dispatch = useDispatch()
  const {
    exchangeRate,
    mvkTokenStorage: { maximumTotalSupply },
  } = useSelector((state: State) => state.mvkToken)
  const { doormanAddress, mvkTokenAddress } = useSelector((state: State) => state.contractAddresses)
  const {
    accountPkh,
    user: { mySMvkTokenBalance, myMvkTokenBalance },
  } = useSelector((state: State) => state.wallet)
  const { totalStakedMvk = 0, smvkHistoryData, mvkMintHistoryData } = useSelector((state: State) => state.doorman)

  const [amount, setAmount] = useState<null | number>(null)

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all([dispatch(getMvkTokenStorage()), dispatch(getDoormanStorage())])
    } catch (e) {
      //TODO: handle fetch error
    }
  }, [])

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
          <ExitFeeModal
            show={amount !== null}
            data={{
              amount: Number(amount),
              maximumTotalSupply,
              mySMvkTokenBalance,
              myMvkTokenBalance,
              totalStakedMvk,
              accountPkh,
            }}
            closePopup={closeExitFeePopup}
          />
          <StakeUnstakeView
            MVK_exchangeRate={exchangeRate}
            stakeCallback={stakeCallback}
            unstakeCallback={unstakeCallback}
          />
          <DoormanInfoStyled>
            <DoormanChart smvkHistoryData={smvkHistoryData} mvkMintHistoryData={mvkMintHistoryData} />
            <DoormanStats
              MVK_exchangeRate={exchangeRate}
              maximumTotalSupply={maximumTotalSupply}
              totalStakedMvk={totalStakedMvk}
              doormanAddress={doormanAddress.address}
              mvkTokenAddress={mvkTokenAddress.address}
            />
          </DoormanInfoStyled>
        </>
      )}
    </Page>
  )
}
