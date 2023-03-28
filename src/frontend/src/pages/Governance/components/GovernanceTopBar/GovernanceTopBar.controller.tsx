import { GovernancePhaseType, GovPhases } from 'utils/TypesAndInterfaces/Governance'

import TimeRemaining from '../TimeRemaining/TimeRemaining.controller'
import { GovernanceTopBarStyled, GovTopBarPhaseText, GovTopBarSidewaysArrowIcon } from './GovernanceTopBar.style'

export type GovernanceTopBarProps = {
  governancePhase: GovernancePhaseType
}
export const GovernanceTopBar = ({ governancePhase }: GovernanceTopBarProps) => {
  // return <GovernanceTopBarView governancePhase={governancePhase} />
  // const isInExecution = governancePhase === GovPhases.PROPOSAL //&& Boolean(watingProposals?.length)

  return (
    <GovernanceTopBarStyled>
      <GovTopBarPhaseText className="first" isCorrectPhase={governancePhase === GovPhases.PROPOSAL}>
        Proposal
      </GovTopBarPhaseText>

      <GovTopBarSidewaysArrowIcon>
        <use xlinkHref="/icons/sprites.svg#greater-than" />
      </GovTopBarSidewaysArrowIcon>
      <GovTopBarPhaseText isCorrectPhase={governancePhase === GovPhases.VOTING}>Voting</GovTopBarPhaseText>

      <GovTopBarSidewaysArrowIcon>
        <use xlinkHref="/icons/sprites.svg#greater-than" />
      </GovTopBarSidewaysArrowIcon>
      <GovTopBarPhaseText isCorrectPhase={governancePhase === GovPhases.TIMELOCK}>Time Lock</GovTopBarPhaseText>
      {/* <GovTopBarSidewaysArrowIcon>
        <use xlinkHref="/icons/sprites.svg#greater-than" />
      </GovTopBarSidewaysArrowIcon>
      <GovTopBarPhaseText isCorrectPhase={governancePhase === GovPhases.PROPOSAL}>Execution</GovTopBarPhaseText> */}
      <TimeRemaining />
    </GovernanceTopBarStyled>
  )
}
