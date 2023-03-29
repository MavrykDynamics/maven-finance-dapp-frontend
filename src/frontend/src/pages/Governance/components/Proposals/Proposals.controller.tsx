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
  const {
    config: { governancePhase, cycle, timelockProposalId, cycleHighestVotedProposalId, cycleCounter },
    proposalsMapper,
  } = useSelector((state: State) => state.governance)
  const { satelliteMapper } = useSelector((state: State) => state.satellites)

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

  const dropDownOptions = useMemo(
    () => Array.from({ length: cycle - 1 }, (_, idx) => String(cycle - (idx + 1))),
    [cycle],
  )

  const [showWithDroppped, setShowWithDroppped] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState<undefined | string>()
  const [ddIsOpen, setDdIsOpen] = useState(false)

  const isHistoryPage = false
  const { search } = useLocation()
  const currentPage = getPageNumber(search, listName)

  const filteredProposals = useMemo(() => {
    return proposalsList.filter((proposalId) => {
      const { status, cycle } = proposalsMapper[proposalId]
      if (showWithDroppped && selectedCycle) {
        return status === 0 && cycle === Number(selectedCycle)
      }

      if (showWithDroppped) {
        return status === 0
      }
      if (selectedCycle) {
        return cycle === Number(selectedCycle)
      }

      return true
    })
  }, [showWithDroppped, proposalsList, selectedCycle])

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return filteredProposals.slice(from, to)
  }, [currentPage, filteredProposals, listName])

  const votersList = useMemo(
    () =>
      selectedProposal?.votes?.reduce<
        Array<{
          vote: number
          name: string
          avatar: string
          address: string
        }>
      >((acc, { voter_id, round, vote }) => {
        const satelliteData = satelliteMapper[voter_id]

        if (satelliteData && round === 1) {
          acc.push({
            vote,
            name: satelliteData.name,
            avatar: satelliteData.image,
            address: voter_id,
          })
        }

        return acc
      }, []),
    [satelliteMapper, selectedProposal],
  )

  return (
    <ProposalListContainer>
      <GovRightContainerTitleArea>
        <h1>{proposalListTitle}</h1>
      </GovRightContainerTitleArea>
      {isHistoryPage ? (
        <Checkbox
          id={'show_dropped'}
          onChangeHandler={() => {
            setShowWithDroppped(!showWithDroppped)
          }}
          checked={showWithDroppped}
          className={'proposal-history-checkbox'}
        >
          <span>Hide dropped proposals</span>
        </Checkbox>
      ) : null}
      {isHistoryPage ? (
        <DropDown
          className="cycle-dropdown"
          placeholder={'Choose cycle number'}
          items={dropDownOptions}
          clickOnItem={(value: string) => {
            setSelectedCycle(value)
            setDdIsOpen(false)
          }}
          isOpen={ddIsOpen}
          setIsOpen={setDdIsOpen}
          itemSelected={selectedCycle}
        />
      ) : null}
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
      {true && votersList?.length ? (
        <div className="voters-list">
          <GovRightContainerTitleArea>
            <h1>Satellite Voting History</h1>
          </GovRightContainerTitleArea>
          {votersList.map(({ vote, address, name, avatar }) => {
            const status = vote === 1 ? ProposalStatus.EXECUTED : vote === 2 ? ProposalStatus.DEFEATED : undefined
            return (
              <VoterListItem>
                <div className="left">
                  <div className="avatar">
                    <img src={avatar} alt={`${name} avatar`} />
                  </div>
                  <div className="info">
                    <span>{name}</span>
                    <TzAddress tzAddress={address} />
                  </div>
                </div>
                <ProposalStatusFlag status={status}>{getVoteText(vote)}</ProposalStatusFlag>
              </VoterListItem>
            )
          })}
          <Pagination itemsCount={votersList.length} listName={GOVERNANCE_VOTERS_LIST_NAME} />
        </div>
      ) : null}
    </ProposalListContainer>
  )
}
