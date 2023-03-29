import { useDispatch, useSelector } from 'react-redux'
import { Page } from 'styles'
import { State } from 'reducers'

// actions
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { GovernanceView } from './Governance.view'
import { GovernanceTopBar } from './components/GovernanceTopBar/GovernanceTopBar.controller'

// hooks
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { executeProposal } from './actions/GovernanceInteraction.actions'
import { getGovernance } from './actions/GovernanseData.actions'
import {
  GOVERNANCE_VOTERS_LIST_NAME,
  ONGOING_PROPOSALS_LIST_NAME,
  WAITING_PROPOSALS_LIST_NAME,
} from 'app/App.components/Pagination/pagination.consts'
import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router'
import { GovPhases, ProposalRecordType, ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { ProposalDetails } from './components/ProposalDetails/ProposalDetails'
import { Proposals } from './components/Proposals/Proposals.controller'
import { GovernanceStyled, GovernanceLeftContainer, GovRightContainerTitleArea } from './Governance.style'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { getVoteText } from 'pages/Satellites/helpers/Satellites.consts'
import { TzAddress } from 'pages/Treasury/Treasury.style'
import { VoterListItem, ProposalStatusFlag } from './components/Proposals/Proposals.style'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'

export type VoteStatistics = {
  passVotesMVKTotal: number
  forVotesMVKTotal: number
  againstVotesMVKTotal: number
  abstainVotesMVKTotal: number
  unusedVotesMVKTotal: number
}
export const Governance = ({ isHistory = false }: { isHistory?: boolean }) => {
  const dispatch = useDispatch()

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

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all(
        [
          !isEgovLoaded && dispatch(getEmergencyGovernanceStorage()),
          !isGovernanceLoaded && dispatch(getGovernance()),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [])

  const [rightSideContent, setRightSideContent] = useState<ProposalRecordType | undefined>(undefined)

  const handleItemSelect = (chosenProposal: ProposalRecordType) => setRightSideContent(chosenProposal)

  // filters handlers TODO: add all cycles optionz
  const dropDownOptions = useMemo(
    () => Array.from({ length: cycle - 1 }, (_, idx) => String(cycle - (idx + 1))),
    [cycle],
  )

  const [showActive, setShowActive] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState<undefined | string>()
  const [ddIsOpen, setDdIsOpen] = useState(false)

  const prpoposalsListsToShow = useMemo<
    Array<{
      title: string
      proposalsIds: Array<number>
    }>
  >(() => {
    // If history page show only history proposals
    if (isHistory)
      return [
        {
          title: 'History Proposals',
          proposalsIds: pastProposalsIds.filter((proposalId) => {
            const { status, cycle } = proposalsMapper[proposalId]

            if (showActive && selectedCycle) return status === 0 && cycle === Number(selectedCycle)

            if (showActive) return status === 0

            if (selectedCycle) return cycle === Number(selectedCycle)

            return true
          }),
        },
      ]

    return [
      // if we have waiting to be paid show them on proposals page
      ...(waitingProposalsIdsToBePaid?.length
        ? [
            {
              title: 'Waiting to be paid',
              proposalsIds: waitingProposalsIdsToBePaid,
            },
          ]
        : []),

      // if we have waiting to be executed show them on proposals page
      ...(waitingProposalsIdsToBeExecuted?.length
        ? [
            {
              title: 'Waiting to be executed',
              proposalsIds: waitingProposalsIdsToBeExecuted,
            },
          ]
        : []),

      // if we have current round proposals show them on proposals page
      ...(currentRoundProposalsIds?.length
        ? [
            {
              title: governancePhase === GovPhases.PROPOSAL ? 'Pool for Next round' : 'Ongoing proposal',
              proposalsIds: currentRoundProposalsIds,
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
    setRightSideContent(firstProposalId ? proposalsMapper[firstProposalId] : undefined)
  }, [proposalsMapper, prpoposalsListsToShow])

  // TODO: add pagination to this list
  const votersList = useMemo(
    () =>
      rightSideContent?.votes?.reduce<
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
    [satelliteMapper, rightSideContent],
  )

  return (
    <Page>
      <PageHeader page={'governance'} />
      <GovernanceTopBar governancePhase={governancePhase} />

      {isLoading ? null : (
        <GovernanceStyled>
          <GovernanceLeftContainer>
            {isHistory ? (
              <>
                <Checkbox
                  id={'show_dropped'}
                  onChangeHandler={() => setShowActive(!showActive)}
                  checked={showActive}
                  className={'proposal-history-checkbox'}
                >
                  <span>Hide dropped proposals</span>
                </Checkbox>
                {/* TODO: use new dd */}
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
              </>
            ) : null}
            {prpoposalsListsToShow.length
              ? prpoposalsListsToShow.map(({ title, proposalsIds }) => {
                  return (
                    <Proposals
                      proposalsList={proposalsIds}
                      handleItemSelect={handleItemSelect}
                      selectedProposal={rightSideContent}
                      title={title}
                      type="wating"
                      listName={WAITING_PROPOSALS_LIST_NAME}
                      key={`${proposalsIds.length}-${title}`}
                    />
                  )
                })
              : 'no items'}

            {governancePhase === GovPhases.VOTING && votersList?.length ? (
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
          </GovernanceLeftContainer>

          {rightSideContent && rightSideContent.id !== 0 ? <ProposalDetails proposal={rightSideContent} /> : null}
        </GovernanceStyled>
      )}
    </Page>
  )
}
