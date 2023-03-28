import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { State } from '../../../../reducers'
import { GovPhases, ProposalRecordType } from '../../../../utils/TypesAndInterfaces/Governance'
import { ProposalsView } from './Proposals.view'

type ProposalsProps = {
  proposalsList: ProposalRecordType[]
  handleItemSelect: (proposalListItem: ProposalRecordType | undefined) => void
  selectedProposal: ProposalRecordType | undefined
  title?: string
  type: string
  listName: string
}
export const Proposals = ({
  proposalsList,
  handleItemSelect,
  selectedProposal,
  title = '',
  type,
  listName,
}: ProposalsProps) => {
  const { governancePhase } = useSelector((state: State) => state.governanceConfig)
  let proposalListTitle = ''
  switch (governancePhase) {
    case GovPhases.VOTING:
      proposalListTitle = 'Ongoing Proposals'
      break
    case GovPhases.TIMELOCK:
      proposalListTitle = 'Proposals on Timelock'
      break
    case GovPhases.PROPOSAL:
      proposalListTitle = 'Poll for next proposals'
      break
    default:
      proposalListTitle = 'Past Proposals'
      break
  }

  if (type === 'history') {
    proposalListTitle = 'Past Proposals'
  }

  return (
    <ProposalsView
      listTitle={title || proposalListTitle}
      proposalsList={proposalsList}
      handleItemSelect={handleItemSelect}
      selectedProposal={selectedProposal}
      isHistoryPage={type === 'history'}
      listName={listName}
      showVotersList={
        (governancePhase === GovPhases.TIMELOCK || governancePhase === GovPhases.VOTING) && type !== 'history'
      }
    />
  )
}
