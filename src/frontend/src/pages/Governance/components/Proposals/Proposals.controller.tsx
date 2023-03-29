import Checkbox from 'app/App.components/Checkbox/Checkbox.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import {
  getPageNumber,
  calculateSlicePositions,
  LIST_NAMES_MAPPER,
  GOVERNANCE_VOTERS_LIST_NAME,
} from 'app/App.components/Pagination/pagination.consts'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { EmptyContainer } from 'app/App.style'
import { getProposalStatusInfo } from 'pages/Governance/Governance.helpers'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { getVoteText } from 'pages/Satellites/helpers/Satellites.consts'
import { TzAddress } from 'pages/Treasury/Treasury.style'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { State } from '../../../../reducers'
import { GovPhases, ProposalRecordType, ProposalStatus } from '../../../../utils/TypesAndInterfaces/Governance'
import {
  ProposalListContainer,
  ProposalListItem,
  ProposalItemLeftSide,
  VoterListItem,
  ProposalStatusFlag,
} from './Proposals.style'
import { ProposalsView } from './Proposals.view'

type ProposalsProps = {
  proposalsList: Array<number>
  handleItemSelect: (proposalListItem: ProposalRecordType) => void
  selectedProposal: ProposalRecordType | undefined
  title: string
  type: string
  listName: string
}

export const Proposals = ({ proposalsList, handleItemSelect, selectedProposal, title, listName }: ProposalsProps) => {
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
  const selectedCycle = 4

  return (
    <ProposalListContainer>
      <GovRightContainerTitleArea>
        <h1>{title}</h1>
      </GovRightContainerTitleArea>

      {paginatedItemsList.length ? (
        paginatedItemsList.map((proposalId, index) => {
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
        })
      ) : (
        <EmptyContainer className="empty">
          <img src="/images/not-found.svg" alt=" No proposals to show" />
          <figcaption>
            {selectedCycle
              ? `There was no propoposals on the cycle ${selectedCycle}`
              : 'There are no history proposals'}
          </figcaption>
        </EmptyContainer>
      )}
      <Pagination itemsCount={proposalsList.length} listName={listName} />
    </ProposalListContainer>
  )
}
