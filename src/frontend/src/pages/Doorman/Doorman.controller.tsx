import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// style
import { Page } from 'styles'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DoormanInfoStyled } from './Doorman.style'
import { DoormanChart } from './DoormanChart/DoormanChart.controller'

// actions
import { getDoormanStorage, getMvkTokenStorage, stake } from './Doorman.actions'
import { DoormanStatsView } from './DoormanStats/DoormanStats.view'
import { showExitFeeModal } from './ExitFeeModal/ExitFeeModal.actions'
import { ExitFeeModal } from './ExitFeeModal/ExitFeeModal.controller'
import { StakeUnstakeView } from './StakeUnstake/StakeUnstake.view'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

export const Doorman = () => {
  const dispatch = useDispatch()

  const { totalSupply = 0 } = useSelector((state: State) => state.mvkToken.mvkTokenStorage)
  const { totalStakedMvk } = useSelector((state: State) => state.doorman)

  const { isLoading: isMVKTokenStorageLoading } = useDataLoader(async () => await dispatch(getMvkTokenStorage()), [])
  const { isLoading: isDormanStorageLoading } = useDataLoader(async () => await dispatch(getDoormanStorage()), [])

  const stakeCallback = (amount: number) => {
    dispatch(stake(amount))
  }

  const unstakeCallback = (amount: number) => {
    dispatch(showExitFeeModal(amount))
  }

  console.log('isMVKTokenStorageLoading', isMVKTokenStorageLoading)
  console.log('isDormanStorageLoading', isDormanStorageLoading)

  return (
    <Page>
      {isDormanStorageLoading || isMVKTokenStorageLoading ? (
        '... loading dorman data'
      ) : (
        <>
          <ExitFeeModal />
          <PageHeader page={'doorman'} />
          <StakeUnstakeView stakeCallback={stakeCallback} unstakeCallback={unstakeCallback} />
          <DoormanInfoStyled>
            <DoormanChart />
            <DoormanStatsView mvkTotalSupply={totalSupply} totalStakedMvkSupply={totalStakedMvk} />
          </DoormanInfoStyled>
        </>
      )}
    </Page>
  )
}
