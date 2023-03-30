import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import {
  getPageNumber,
  calculateSlicePositions,
  LIST_NAMES_MAPPER,
} from 'app/App.components/Pagination/pagination.consts'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { getProposalStatusInfo } from 'pages/Governance/Governance.helpers'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { State } from '../../../../reducers'
import { ProposalRecordType } from '../../../../utils/TypesAndInterfaces/Governance'
import { ProposalListContainer, ProposalListItem, ProposalItemLeftSide } from './Proposals.style'

type ProposalsProps = {
  proposalsList: Array<number>
  handleItemSelect: (proposalListItem: ProposalRecordType) => void
  selectedProposal: ProposalRecordType | undefined
  title: string
  type: string
  listName: string
}

export const Proposals = ({
  proposalsList,
  handleItemSelect,
  selectedProposal,
  title,
  listName,
  type,
}: ProposalsProps) => {
  const {
    config: { governancePhase, timelockProposalId, cycleHighestVotedProposalId, cycleCounter },
    proposalsMapper,
  } = useSelector((state: State) => state.governance)

  const isHistoryPage = false
  const { search } = useLocation()
  const currentPage = getPageNumber(search, listName)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return proposalsList.slice(from, to)
  }, [currentPage, proposalsList, listName])

  return (
    <ProposalListContainer className={type}>
      <H2Title>{title}</H2Title>

      <div className="proposals-list-wrapper">
        {paginatedItemsList.map((proposalId, index) => {
          const proposal = proposalsMapper[proposalId]
          const { statusFlag } = getProposalStatusInfo(
            governancePhase,
            proposal,
            timelockProposalId,
            !isHistoryPage,
            cycleHighestVotedProposalId,
            cycleCounter,
          )

          const votedMVK = Math.floor(
            (proposal.abstainMvkTotal ?? 0) +
              (proposal.downvoteMvkTotal ?? 0) +
              (proposal.upvoteMvkTotal ?? 0) +
              (proposal?.passVoteMvkTotal ?? 0),
          )

          return (
            <ProposalListItem
              key={proposal.id}
              onClick={() => handleItemSelect(proposal)}
              selected={selectedProposal ? selectedProposal.id === proposal.id : proposal.id === 1}
            >
              <ProposalItemLeftSide>
                <span>{index + 1 + (Number(currentPage) - 1) * LIST_NAMES_MAPPER[listName]}</span>
                <h4>{proposal.title}</h4>
              </ProposalItemLeftSide>
              <CommaNumber
                className="proposal-voted-mvk"
                value={votedMVK}
                endingText={'voted MVK'}
                showDecimal={false}
              />
              <StatusFlag text={statusFlag} status={statusFlag} />
            </ProposalListItem>
          )
        })}
      </div>

      <Pagination itemsCount={proposalsList.length} listName={listName} />
    </ProposalListContainer>
  )
}
