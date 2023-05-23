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
import { GovPhases, ProposalRecordType } from '../../../../utils/TypesAndInterfaces/Governance'
import { ProposalListContainer, ProposalListItem, ProposalItemLeftSide } from './Proposals.style'

type ProposalsProps = {
  proposalsList: Array<number>
  handleItemSelect: (proposalListItem: ProposalRecordType) => void
  selectedProposalId: number | undefined
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

          return (
            <ProposalListItem
              key={proposal.id}
              onClick={() => handleItemSelect(proposal)}
              selected={selectedProposalId === proposal.id}
            >
              <ProposalItemLeftSide>
                <span>{index + 1 + (Number(currentPage) - 1) * LIST_NAMES_MAPPER[listName]}</span>
                <h4>{proposal.title}</h4>
              </ProposalItemLeftSide>
              <CommaNumber
                className="proposal-voted-mvk"
                value={proposal.quorumMvkTotal}
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
