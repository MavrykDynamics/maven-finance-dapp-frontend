import Icon from 'app/App.components/Icon/Icon.view'

import TimeRemaining from '../TimeRemaining/TimeRemaining.controller'
import { GovernanceTopBarStyled, GovTopBarPhaseText } from './GovernanceTopBar.style'

import { GovPhases } from 'providers/ProposalsProvider/helpers/proposals.const'

import { GovernancePhaseType } from 'providers/ProposalsProvider/helpers/proposals.types'

export type GovernanceTopBarProps = {
  governancePhase: GovernancePhaseType
  isWaitingToExecute: boolean
}
export const GovernanceTopBar = ({ governancePhase, isWaitingToExecute }: GovernanceTopBarProps) => {
  return (
    <GovernanceTopBarStyled>
      <GovTopBarPhaseText isCorrectPhase={governancePhase === GovPhases.PROPOSAL && !isWaitingToExecute}>
        Proposal
      </GovTopBarPhaseText>

      <Icon id="greater-than" />
      <GovTopBarPhaseText isCorrectPhase={governancePhase === GovPhases.VOTING}>Voting</GovTopBarPhaseText>

      <Icon id="greater-than" />
      <GovTopBarPhaseText isCorrectPhase={governancePhase === GovPhases.TIMELOCK}>Time Lock</GovTopBarPhaseText>

      <Icon id="greater-than" />
      <GovTopBarPhaseText isCorrectPhase={governancePhase === GovPhases.PROPOSAL && isWaitingToExecute}>
        Execution
      </GovTopBarPhaseText>

      <div className="action">
        <TimeRemaining />
      </div>
    </GovernanceTopBarStyled>
  )
}
