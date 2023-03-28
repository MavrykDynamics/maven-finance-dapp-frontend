import { GovernancePhase } from '../../../reducers/governanceProposals'
import { GovernanceTopBarView } from './GovernanceTopBar.view'

export type GovernanceTopBarProps = {
  governancePhase: GovernancePhase
}
export const GovernanceTopBar = ({ governancePhase }: GovernanceTopBarProps) => {
  return <GovernanceTopBarView governancePhase={governancePhase} />
}
