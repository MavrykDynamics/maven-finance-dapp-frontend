import { useMemo } from 'react'
import { useProposalsContext } from 'providers/ProposalsProvider/proposals.provider'

import TimeRemaining from '../../Governance/components/TimeRemaining/TimeRemaining.controller'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

import { getSeparateSnakeCase } from '../../../utils/parse'

import { CurrentPhaseContainer, PropSubmissionTopBarStyled } from './PropSubmissionTopBar.style'

export type PropSubmissionTopBarProps = {
  valueCallback: (val: number) => void
  activeTab: number
}

export const PropSubmissionTopBar = ({ valueCallback, activeTab }: PropSubmissionTopBarProps) => {
  const {
    config: { governancePhase },
  } = useProposalsContext()

  const topBarItems = useMemo(
    () => [
      { text: 'Step 1', id: 1, active: activeTab === 1 },
      { text: 'Step 2', id: 2, active: activeTab === 2 },
      { text: 'Step 3', id: 3, active: activeTab === 3 },
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
