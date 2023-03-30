import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import {
  getPageNumber,
  calculateSlicePositions,
  LIST_NAMES_MAPPER,
} from 'app/App.components/Pagination/pagination.consts'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
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
  const { search } = useLocation()

  const { proposalsMapper } = useSelector((state: State) => state.governance)

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

          console.log('Proposals/Proposals.controller.tsx, proposals votes on small card', { proposal })

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
              <StatusFlag text={proposal.status} status={proposal.status} />
            </ProposalListItem>
          )
        })}
      </div>

      <Pagination itemsCount={proposalsList.length} listName={listName} />
    </ProposalListContainer>
  )
}
