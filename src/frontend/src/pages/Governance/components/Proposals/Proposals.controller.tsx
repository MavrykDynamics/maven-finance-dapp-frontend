import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { useProposalsContext } from 'providers/ProposalsProvider/proposals.provider'

// view
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { ProposalItemLeftSide, ProposalListContainer, ProposalListItem } from './Proposals.style'

// helpers
import {
  calculateSlicePositions,
  getPageNumber,
  HISTORY_PROPOSALS_LIST_NAME,
  LIST_NAMES_MAPPER,
} from 'app/App.components/Pagination/pagination.consts'

// consts
import { GovPhases } from 'providers/ProposalsProvider/helpers/proposals.const'

// types
import { ProposalRecordType } from 'providers/ProposalsProvider/helpers/proposals.types'

type ProposalsProps = {
  proposalsList: Array<number>
  handleItemSelect: (proposalListItem: ProposalRecordType) => void
  selectedProposalId: number | null
  title: string
  type: string
  listName: string
}

export const Proposals = ({
  proposalsList,
  handleItemSelect,
  selectedProposalId,
  title,
  listName,
  type,
}: ProposalsProps) => {
  const { search } = useLocation()

  const {
    proposalsMapper,
    config: { governancePhase },
  } = useProposalsContext()

  const currentPage = getPageNumber(search, listName)
  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return proposalsList.slice(from, to)
  }, [currentPage, listName, proposalsList])

  return (
    <ProposalListContainer className={type}>
      <H2Title>{title}</H2Title>

      <div className="proposals-list-wrapper">
        {paginatedItemsList.map((proposalId, index) => {
          const proposal = proposalsMapper[proposalId]
          const proposalVotedMvn =
            // if proposal is history show voting round or if it's 0 show proposal round votes
            listName === HISTORY_PROPOSALS_LIST_NAME
              ? proposal.quorumMvnTotal || proposal.proposalUpVotesMvnTotal
              : // if it's alive round proposal and phase is Proposal show proposals round votes
              governancePhase === GovPhases.PROPOSAL || governancePhase === GovPhases.EXECUTION
              ? proposal.proposalUpVotesMvnTotal
              : // if round is more than proposal show voting round votes
                proposal.quorumMvnTotal

          return (
            <ProposalListItem
              key={proposal.id}
              onClick={() => handleItemSelect(proposal)}
              $selected={selectedProposalId === proposal.id}
            >
              <ProposalItemLeftSide>
                <span>{index + 1 + (Number(currentPage) - 1) * LIST_NAMES_MAPPER[listName]}</span>
                <h4>{proposal.title}</h4>
              </ProposalItemLeftSide>
              <CommaNumber
                className="proposal-voted-mvn"
                value={proposalVotedMvn}
                endingText={'voted MVN'}
                showDecimal={false}
              />
              <StatusFlag text={proposal.status} status={proposal.status} />
            </ProposalListItem>
          )
        })}
      </div>

      <Pagination itemsCount={proposalsList.length} listName={listName} />
    </ProposalListContainer>
  )
}
