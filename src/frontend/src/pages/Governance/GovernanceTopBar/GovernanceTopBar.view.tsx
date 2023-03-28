// components
import TimeRemaining from '../TimeRemaining/TimeRemaining.controller'
import { GovernancePhase } from '../../../reducers/governance'

// hooks

import { GovernanceTopBarStyled, GovTopBarPhaseText, GovTopBarSidewaysArrowIcon } from './GovernanceTopBar.style'

export type GovernanceTopBarViewProps = {
  governancePhase: GovernancePhase
}
export const GovernanceTopBarView = ({ governancePhase }: GovernanceTopBarViewProps) => {
  const isInExecution = governancePhase === 'PROPOSAL' //&& Boolean(watingProposals?.length)

  return (
    <GovernanceTopBarStyled id="governanceTopBar">
      <GovTopBarPhaseText className="first" isCorrectPhase={governancePhase === 'PROPOSAL' && !isInExecution}>
        Proposal
      </GovTopBarPhaseText>
      <GovTopBarSidewaysArrowIcon>
        <use xlinkHref="/icons/sprites.svg#greater-than" />
      </GovTopBarSidewaysArrowIcon>
      <GovTopBarPhaseText isCorrectPhase={governancePhase === 'VOTING'}>Voting</GovTopBarPhaseText>
      <GovTopBarSidewaysArrowIcon>
        <use xlinkHref="/icons/sprites.svg#greater-than" />
      </GovTopBarSidewaysArrowIcon>
      <GovTopBarPhaseText isCorrectPhase={governancePhase === 'TIME_LOCK'}>Time Lock</GovTopBarPhaseText>
      <GovTopBarSidewaysArrowIcon>
        <use xlinkHref="/icons/sprites.svg#greater-than" />
      </GovTopBarSidewaysArrowIcon>
      <GovTopBarPhaseText isCorrectPhase={isInExecution}>Execution</GovTopBarPhaseText>
      <TimeRemaining />
    </GovernanceTopBarStyled>
  )
}
