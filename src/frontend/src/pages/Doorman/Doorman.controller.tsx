import { useState } from 'react'
import { useDispatch } from 'react-redux'

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

export const Doorman = () => {
  const dispatch = useDispatch()
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
          <ExitFeeModal show={amount !== null} data={{ amount: Number(amount) }} closePopup={closeExitFeePopup} />
          <StakeUnstakeView stakeCallback={stakeCallback} unstakeCallback={unstakeCallback} />
          <DoormanInfoStyled>
            <DoormanChart />
            <DoormanStats />
          </DoormanInfoStyled>
        </>
      )}
    </Page>
  )
}
