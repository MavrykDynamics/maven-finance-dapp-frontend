import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { getDoormanStorage, getMvkTokenStorage } from '../Doorman.actions'
import { DoormanStatsView } from './DoormanStats.view'

export const DoormanStats = () => {
  const dispatch = useDispatch()
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { doormanStorage, totalStakedMvk } = useSelector((state: State) => state.doorman)

  useEffect(() => {
    dispatch(getMvkTokenStorage())
    dispatch(getDoormanStorage())
  }, [dispatch, totalStakedMvk])

  return <DoormanStatsView mvkTotalSupply={mvkTokenStorage?.totalSupply} totalStakedMvkSupply={totalStakedMvk} />
}
