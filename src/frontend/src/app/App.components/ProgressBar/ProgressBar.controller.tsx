import { useSelector } from 'react-redux'
import { State } from 'reducers'

import { ProgressBarStatus } from './ProgressBar.constants'
import { ProgressBarStyled } from './ProgressBar.style'

//TODO add progress bar on initial data or data loading if needed
export const ProgressBar = () => {
  return null
  // const { isLoading } = useSelector((state: State) => state.loading)

  // return <ProgressBarStyled status={isLoading ? ProgressBarStatus.MOVING : ProgressBarStatus.NO_DISPLAY} />
}
