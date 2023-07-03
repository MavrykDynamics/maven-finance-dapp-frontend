import { useState, useMemo } from 'react'
import { Redirect, useHistory, useLocation } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import QueryString from 'qs'

// types
import { State } from 'reducers'
import { ProposalsListType } from './helpers/governanceTypes'
import { GovPhases, ProposalRecordType, ProposalStatus } from 'utils/TypesAndInterfaces/Governance'

// providers

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
import { generateCyclesDdOptions, NONE_CYCLE_SELECTED_OPTION } from './helpers/governanceView.helpers'

// styles
import { Page } from 'styles'
import { GovernanceStyled, GovernanceLeftContainer } from './Governance.style'
import { EmptyContainer } from 'app/App.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { VoterListItem } from './components/Proposals/Proposals.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { STATUS_FLAG_DOWN, STATUS_FLAG_UP } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { SATELLITE_VOTES_MAPPER } from 'providers/SatellitesProvider/satellites.const'

export const Governance = ({ isHistory = false }: { isHistory?: boolean }) => {
  const dispatch = useDispatch()
  const { search } = useLocation()
  const history = useHistory()

  const {
    isLoaded: isGovernanceLoaded,
    config: { governancePhase, cycle },
    pastProposalsIds,
    currentRoundProposalsIds,
    waitingProposalsIdsToBeExecuted,
    waitingProposalsIdsToBePaid,
    proposalsMapper,
  } = useSelector((state: State) => state.governance)
  const { isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)

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

  // handle saving proposal id in query params
  const parsedQp = QueryString.parse(search, { ignoreQueryPrefix: true }) as { proposalId: string }

  // parse proposal id from url
  const rightSideContentId = parsedQp.proposalId ? Number(parsedQp.proposalId) : null
  // as this page used for history and non history proposals we need to specify array of id where we will validate selected proposalId whether it exists
  const listOfProposalsToUseForRedirect = isHistory
    ? pastProposalsIds
    : currentRoundProposalsIds.concat(waitingProposalsIdsToBeExecuted, waitingProposalsIdsToBePaid)
  const proposalPage = isHistory ? 'proposal-history' : 'governance'

  // crete redirect, it we don't have proposal id, or we have but it's invalid, set first proposalId that we have to selected, or if we don't have proposals at all, don't show it
  const redirect =
    (!rightSideContentId && listOfProposalsToUseForRedirect.length) ||
    (rightSideContentId && !listOfProposalsToUseForRedirect.includes(rightSideContentId)) ? (
      <Redirect
        to={`/${proposalPage}${
          listOfProposalsToUseForRedirect.length
            ? `?${QueryString.stringify({
                proposalId: listOfProposalsToUseForRedirect[0],
              })}`
            : ''
        }`}
      />
    ) : null

  // Show details of the proposal
  // const [rightSideContentId, setRightSideContentId] = useState<number | undefined>(undefined)
  const handleItemSelect = (chosenProposal: ProposalRecordType) =>
    history.replace(`/${proposalPage}?${QueryString.stringify({ proposalId: chosenProposal.id })}`)

  // filters handlers TODO: add all cycles option
  const dropDownOptions = useMemo<Array<DropDownItemType>>(() => generateCyclesDdOptions(cycle), [cycle])
  const [showActive, setShowActive] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState<undefined | DropDownItemType>(NONE_CYCLE_SELECTED_OPTION)

  // Creating lists of proposals to show
  const proposalsListsToShow = useMemo<ProposalsListType>(() => {
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
              title: 'Waiting for payment to be processed',
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
              title: governancePhase === GovPhases.PROPOSAL ? 'Poll for Next round' : 'Ongoing proposal',
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

  const selectedProposalVoters = useMemo(
    () => (rightSideContentId ? proposalsMapper[rightSideContentId]?.votes ?? [] : []),
    [proposalsMapper, rightSideContentId],
  )

  const paginatedVotersList = useMemo(() => {
    const [from, to] = calculateSlicePositions(
      getPageNumber(search, GOVERNANCE_VOTERS_LIST_NAME),
      GOVERNANCE_VOTERS_LIST_NAME,
    )
    return selectedProposalVoters.slice(from, to)
  }, [search, selectedProposalVoters])

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
        redirect ?? (
          <GovernanceStyled>
            <GovernanceLeftContainer className={!proposalsListsToShow.length ? 'full-width' : ''}>
              {isHistory && proposalsListsToShow.length ? (
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

              {proposalsListsToShow.length ? (
                proposalsListsToShow.map(({ title, proposalsIds, listName, type }) => {
                  return (
                    <>
                      <Proposals
                        proposalsList={proposalsIds}
                        handleItemSelect={handleItemSelect}
                        selectedProposalId={rightSideContentId}
                        title={title}
                        type={type}
                        listName={listName}
                        key={listName}
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
              {!isHistory && governancePhase !== GovPhases.PROPOSAL && selectedProposalVoters.length ? (
                <div className="voters-list">
                  <H2Title>Satellite Voting History</H2Title>
                  {paginatedVotersList.map(({ vote, address, name, avatar, round }) => {
                    // if vote for proposal round, don't show it
                    if (round === 0) return null
                    return (
                      <VoterListItem key={address}>
                        <div className="left">
                          <ImageWithPlug imageLink={avatar} alt={`${name} avatar`} />
                          <div className="info">
                            <span>{name}</span>
                            <TzAddress tzAddress={address} />
                          </div>
                        </div>
                        <StatusFlag
                          status={vote === 1 ? STATUS_FLAG_UP : STATUS_FLAG_DOWN}
                          text={SATELLITE_VOTES_MAPPER[vote]}
                        />
                      </VoterListItem>
                    )
                  })}
                  <Pagination itemsCount={selectedProposalVoters.length} listName={GOVERNANCE_VOTERS_LIST_NAME} />
                </div>
              ) : null}
            </GovernanceLeftContainer>

            {/* Selected proposal */}
            {rightSideContentId && rightSideContentId !== 0 ? (
              <ProposalDetails proposal={proposalsMapper[rightSideContentId]} />
            ) : null}
          </GovernanceStyled>
        )
      )}
    </Page>
  )
}
