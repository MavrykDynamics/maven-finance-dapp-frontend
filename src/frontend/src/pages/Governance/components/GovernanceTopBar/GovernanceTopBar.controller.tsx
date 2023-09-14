import Icon from 'app/App.components/Icon/Icon.view'
import { GovernancePhaseType, GovPhases } from 'utils/TypesAndInterfaces/Governance'

import TimeRemaining from '../TimeRemaining/TimeRemaining.controller'
import { GovernanceTopBarStyled, GovTopBarPhaseText } from './GovernanceTopBar.style'

export type GovernanceTopBarProps = {
  governancePhase: GovernancePhaseType
  isWaitingToExecute: boolean
}
export const GovernanceTopBar = ({ governancePhase, isWaitingToExecute }: GovernanceTopBarProps) => {
  return (
    <GovernanceTopBarStyled>
      <GovTopBarPhaseText isActivePhase={governancePhase === GovPhases.PROPOSAL && !isWaitingToExecute}>
        Proposal
      </GovTopBarPhaseText>

      <Icon id="greater-than" />
      <GovTopBarPhaseText isActivePhase={governancePhase === GovPhases.VOTING}>Voting</GovTopBarPhaseText>

      <Icon id="greater-than" />
      <GovTopBarPhaseText isActivePhase={governancePhase === GovPhases.TIMELOCK}>Time Lock</GovTopBarPhaseText>

      <Icon id="greater-than" />
      <GovTopBarPhaseText isActivePhase={governancePhase === GovPhases.PROPOSAL && isWaitingToExecute}>
        Execution
      </GovTopBarPhaseText>

      <div className="action">
        <TimeRemaining />
      </div>
    </GovernanceTopBarStyled>
  )
}
