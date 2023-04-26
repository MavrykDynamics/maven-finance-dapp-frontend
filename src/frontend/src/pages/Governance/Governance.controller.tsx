import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'

// types
import { State } from 'reducers'
import { ProposalVotersType, ProposalsListType } from './helpers/governanceTypes'
import { GovPhases, ProposalRecordType, ProposalStatus } from 'utils/TypesAndInterfaces/Governance'

// actions & cs hooks
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getGovernanceStorage } from './actions/GovernanseData.actions'
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { GovernanceTopBar } from './components/GovernanceTopBar/GovernanceTopBar.controller'
import { ProposalDetails } from './components/ProposalDetails/ProposalDetails'
import { Proposals } from './components/Proposals/Proposals.controller'
import { DropDownItemType, DropDown, DDItemId } from 'app/App.components/DropDown/NewDropdown'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// actions, helpers, consts
import {
  calculateSlicePositions,
  getPageNumber,
  GOVERNANCE_VOTERS_LIST_NAME,
  HISTORY_PROPOSALS_LIST_NAME,
  ONGOING_PROPOSALS_LIST_NAME,
  WAITING_EXECUTED_PROPOSALS_LIST_NAME,
  WAITING_PAYMENT_PROPOSALS_LIST_NAME,
} from 'app/App.components/Pagination/pagination.consts'
import { getVoteText } from 'pages/Satellites/helpers/Satellites.consts'
import { generateCyclesDdOptions, NONE_CYCLE_SELECTED_OPTION } from './helpers/governanceView.helpers'

// styles
import { Page } from 'styles'
import { GovernanceStyled, GovernanceLeftContainer } from './Governance.style'
import { EmptyContainer } from 'app/App.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { TzAddress } from 'pages/Treasury/Treasury.style'
import { VoterListItem, ProposalStatusFlag } from './components/Proposals/Proposals.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

export const Governance = ({ isHistory = false }: { isHistory?: boolean }) => {
  const dispatch = useDispatch()
  const { search } = useLocation()

  const {
    isLoaded: isGovernanceLoaded,
    config: { governancePhase, cycle },
    currentRoundProposalsIds,
    pastProposalsIds,
    waitingProposalsIdsToBeExecuted,
    waitingProposalsIdsToBePaid,
    proposalsMapper,
  } = useSelector((state: State) => state.governance)
  const { isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)
  const { satelliteMapper } = useSelector((state: State) => state.satellites)

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      await Promise.all(
        [
          (!isGovernanceLoaded || isDepsChanged) && dispatch(getGovernanceStorage()),
          (!isEgovLoaded || isDepsChanged) && dispatch(getEmergencyGovernanceStorage()),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [])

  // Show details of the proposal
  const [rightSideContentId, setRightSideContentId] = useState<number | undefined>(undefined)
  const handleItemSelect = (chosenProposal: ProposalRecordType) => setRightSideContentId(chosenProposal.id)

  // filters handlers TODO: add all cycles option
  const dropDownOptions = useMemo<Array<DropDownItemType>>(() => generateCyclesDdOptions(cycle), [cycle])
  const [showActive, setShowActive] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState<undefined | DropDownItemType>(NONE_CYCLE_SELECTED_OPTION)

  // Creating lists of proposals to show
  const prpoposalsListsToShow = useMemo<ProposalsListType>(() => {
    // If history page show only history proposals & apply filters to them
    if (isHistory)
      return [
        ...(pastProposalsIds.length
          ? [
              {
                title: 'Past Proposals',
                type: 'history',
                listName: HISTORY_PROPOSALS_LIST_NAME,
                proposalsIds: pastProposalsIds.filter((proposalId) => {
                  const { status, cycle } = proposalsMapper[proposalId]

                  if (showActive && selectedCycle && selectedCycle?.id !== NONE_CYCLE_SELECTED_OPTION.id)
                    return status !== ProposalStatus.DROPPED && cycle === Number(selectedCycle.id)

                  if (showActive) return status !== ProposalStatus.DROPPED

                  if (selectedCycle && selectedCycle?.id !== NONE_CYCLE_SELECTED_OPTION.id)
                    return cycle === Number(selectedCycle.id)

                  return true
                }),
              },
            ]
          : []),
      ]

    return [
      // if we have waiting to be paid show them on proposals page
      ...(waitingProposalsIdsToBePaid?.length
        ? [
            {
              title: 'Waiting to be paid',
              type: 'waitingPaid',
              listName: WAITING_PAYMENT_PROPOSALS_LIST_NAME,
              proposalsIds: waitingProposalsIdsToBePaid,
            },
          ]
        : []),

      // if we have waiting to be executed show them on proposals page
      ...(waitingProposalsIdsToBeExecuted?.length
        ? [
            {
              title: 'Waiting to be executed',
              type: 'waitingExecuted',
              listName: WAITING_EXECUTED_PROPOSALS_LIST_NAME,
              proposalsIds: waitingProposalsIdsToBeExecuted,
            },
          ]
        : []),

      // show current round proposals on proposals page
      ...(currentRoundProposalsIds.length
        ? [
            {
              title: governancePhase === GovPhases.PROPOSAL ? 'Pool for Next round' : 'Ongoing proposal',
              type: 'ongoing',
              proposalsIds: currentRoundProposalsIds,
              listName: ONGOING_PROPOSALS_LIST_NAME,
            },
          ]
        : []),
    ]
  }, [
    isHistory,
    pastProposalsIds,
    waitingProposalsIdsToBePaid,
    waitingProposalsIdsToBeExecuted,
    currentRoundProposalsIds,
    governancePhase,
    proposalsMapper,
    showActive,
    selectedCycle,
  ])

  useEffect(() => {
    const firstProposalId = prpoposalsListsToShow?.[0]?.proposalsIds?.[0]
    setRightSideContentId(firstProposalId ? proposalsMapper[firstProposalId]?.id : undefined)
  }, [proposalsMapper, prpoposalsListsToShow])

  // Generate proposal voters and paginate them
  const votersList = useMemo(() => {
    const selectedProposalVotes = rightSideContentId ? proposalsMapper[rightSideContentId].votes : []
    return (
      selectedProposalVotes?.reduce<ProposalVotersType>((acc, { voter_id, round, vote }) => {
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
      }, []) ?? []
    )
  }, [satelliteMapper, proposalsMapper, rightSideContentId])

  const paginatedVotersList = useMemo(() => {
    const [from, to] = calculateSlicePositions(
      getPageNumber(search, GOVERNANCE_VOTERS_LIST_NAME),
      GOVERNANCE_VOTERS_LIST_NAME,
    )
    return votersList.slice(from, to)
  }, [search, votersList])

  return (
    <Page>
      <PageHeader page={'governance'} />
      <GovernanceTopBar
        governancePhase={governancePhase}
        isWaitingToExecute={Boolean(waitingProposalsIdsToBeExecuted.length)}
      />

      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading proposals</div>
        </DataLoaderWrapper>
      ) : (
        <GovernanceStyled>
          <GovernanceLeftContainer className={!prpoposalsListsToShow.length ? 'full-width' : ''}>
            {isHistory && prpoposalsListsToShow.length ? (
              <>
                <Checkbox
                  id="dropped-proposals"
                  onChangeHandler={() => setShowActive(!showActive)}
                  checked={showActive}
                  className={'proposal-history-checkbox'}
                >
                  <span>Hide dropped proposals</span>
                </Checkbox>

                <DropDown
                  className="cycle-dropdown"
                  placeholder={'Choose cycle number'}
                  items={dropDownOptions}
                  clickItem={(ddId: DDItemId) => setSelectedCycle(dropDownOptions.find(({ id }) => id === ddId))}
                  activeItem={selectedCycle}
                />
              </>
            ) : null}

            {prpoposalsListsToShow.length ? (
              prpoposalsListsToShow.map(({ title, proposalsIds, listName, type }) => {
                return (
                  <>
                    <Proposals
                      proposalsList={proposalsIds}
                      handleItemSelect={handleItemSelect}
                      selectedProposalId={rightSideContentId}
                      title={title}
                      type={type}
                      listName={listName}
                      key={`${proposalsIds.length}-${title}`}
                    />

                    {/* Show this plug when we use cycle dd filter and some of the cycles don't have proposals in it */}
                    {isHistory && selectedCycle?.id !== NONE_CYCLE_SELECTED_OPTION.id && proposalsIds.length === 0 ? (
                      <EmptyContainer className="empty">
                        <img src="/images/not-found.svg" alt=" No proposals to show" />
                        <figcaption>{`There is no propoposals on the cycle ${selectedCycle?.id}`}</figcaption>
                      </EmptyContainer>
                    ) : null}
                  </>
                )
              })
            ) : (
              <EmptyContainer className="empty">
                <img src="/images/not-found.svg" alt=" No proposals to show" />
                <figcaption>There are no{isHistory ? ' history' : ''} proposals</figcaption>
              </EmptyContainer>
            )}

            {/* Satellites who has voted for selected proposal */}
            {!isHistory && governancePhase !== GovPhases.PROPOSAL && votersList?.length ? (
              <div className="voters-list">
                <H2Title>Satellite Voting History</H2Title>
                {paginatedVotersList.map(({ vote, address, name, avatar }) => {
                  const status = vote === 1 ? ProposalStatus.EXECUTED : vote === 2 ? ProposalStatus.DEFEATED : undefined
                  return (
                    <VoterListItem>
                      <div className="left">
                        <ImageWithPlug imageLink={avatar} alt={`${name} avatar`} />
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
          </GovernanceLeftContainer>

          {/* Selected proposal */}
          {rightSideContentId && rightSideContentId !== 0 ? (
            <ProposalDetails proposal={proposalsMapper[rightSideContentId]} />
          ) : null}
        </GovernanceStyled>
      )}
    </Page>
  )
}
