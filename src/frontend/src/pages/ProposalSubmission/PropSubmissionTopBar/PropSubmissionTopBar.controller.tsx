import { useSelector } from 'react-redux'
import { State } from '../../../reducers'

import TimeRemaining from '../../Governance/components/TimeRemaining/TimeRemaining.controller'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

import { getSeparateSnakeCase } from '../../../utils/parse'

import { CurrentPhaseContainer, PropSubmissionTopBarStyled } from './PropSubmissionTopBar.style'

export type PropSubmissionTopBarProps = {
  valueCallback: (val: number) => void
}

const GOV_PROPOSAL_SUBMISSION_ITEMS = [
  { text: 'Stage 1', id: 1, active: true },
  { text: 'Stage 2', id: 2, active: false },
  { text: 'Stage 3', id: 3, active: false },
]

export const PropSubmissionTopBar = ({ valueCallback }: PropSubmissionTopBarProps) => {
  const { governancePhase } = useSelector((state: State) => state.governance.config)

  return (
    <PropSubmissionTopBarStyled>
      <div className="left-side">
        <div className="title">Submission Process:</div>
        <SlidingTabButtons tabItems={GOV_PROPOSAL_SUBMISSION_ITEMS} onClick={valueCallback} />
      </div>

      <div className="right-side">
        <CurrentPhaseContainer>
          <div className="title">Current Period: </div>
          <div className="phase">{getSeparateSnakeCase(governancePhase)}</div>
        </CurrentPhaseContainer>

        <TimeRemaining />
      </div>
    </PropSubmissionTopBarStyled>
  )
}
