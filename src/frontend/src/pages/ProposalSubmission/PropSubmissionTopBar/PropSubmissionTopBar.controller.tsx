import { useSelector } from 'react-redux'
import { State } from '../../../reducers'

import TimeRemaining from '../../Governance/components/TimeRemaining/TimeRemaining.controller'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

import { getSeparateSnakeCase } from '../../../utils/parse'

import { CurrentPhaseContainer, PropSubmissionTopBarStyled } from './PropSubmissionTopBar.style'
import { useMemo } from 'react'

export type PropSubmissionTopBarProps = {
  valueCallback: (val: number) => void
  activeTab: number
}

export const PropSubmissionTopBar = ({ valueCallback, activeTab }: PropSubmissionTopBarProps) => {
  const { governancePhase } = useSelector((state: State) => state.governance.config)

  const topBarItems = useMemo(
    () => [
      { text: 'Stage 1', id: 1, active: activeTab === 1 },
      { text: 'Stage 2', id: 2, active: activeTab === 2 },
      { text: 'Stage 3', id: 3, active: activeTab === 3 },
    ],
    [activeTab],
  )

  return (
    <PropSubmissionTopBarStyled>
      <div className="left-side">
        <div className="title">Submission Process:</div>
        <SlidingTabButtons tabItems={topBarItems} onClick={valueCallback} />
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
