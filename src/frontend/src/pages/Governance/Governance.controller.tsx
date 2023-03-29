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
import { ONGOING_PROPOSALS_LIST_NAME } from 'app/App.components/Pagination/pagination.consts'
import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router'
import { ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'
import { ProposalDetails } from './components/ProposalDetails/ProposalDetails'
import { Proposals } from './components/Proposals/Proposals.controller'
import { GovernanceStyled, GovernanceLeftContainer } from './Governance.style'

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
    config: { governancePhase },
    currentRoundProposalsIds,
  } = useSelector((state: State) => state.governance)
  const { isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)

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

  const handleExecuteProposal = (id: number) => dispatch(executeProposal(id))

  const { pathname } = useLocation()

  // const { governanceStorage, currentRoundProposals } = useSelector((state: State) => state.governance)

  const [rightSideContent, setRightSideContent] = useState<ProposalRecordType | undefined>(undefined)

  const onProposalHistoryPage = useMemo(() => pathname === '/proposal-history', [pathname])

  const _handleItemSelect = (chosenProposal: ProposalRecordType | undefined) => {
    setRightSideContent(chosenProposal)
  }

  // const isVisibleOngoingVoting =
  //   !onProposalHistoryPage && Boolean(ongoingProposals?.length) && governancePhase === GovPhases.VOTING
  // const isVisibleOngoingTimeLock =
  //   !onProposalHistoryPage && Boolean(ongoingProposals?.length) && governancePhase === GovPhases.TIMELOCK
  // const isVisibleNextProposal =
  //   !onProposalHistoryPage && Boolean(nextProposals?.length) && governancePhase === GovPhases.PROPOSAL
  // const isVisibleHistoryProposal = onProposalHistoryPage && Boolean(pastProposals?.length)

  const [visibleLists, setVisibleLists] = useState<Record<string, boolean>>({
    wating: false,
    ongoingVoiting: false,
    ongoingTimeLock: false,
    next: false,
    history: false,
  })

  // const isVisibleWating = !onProposalHistoryPage && Boolean(watingProposals?.length)
  // const isVisibleWatingPayment = !onProposalHistoryPage && Boolean(waitingForPaymentToBeProcessed?.length)

  const someVisible = Object.values(visibleLists).some((item) => item)

  // useEffect(() => {
  //   const visibleTypes: Record<string, boolean> = {
  //     wating: isVisibleWating,
  //     ongoingVoiting: isVisibleOngoingVoting,
  //     ongoingTimeLock: isVisibleOngoingTimeLock,
  //     next: isVisibleNextProposal,
  //     history: isVisibleHistoryProposal,
  //   }
  //   setVisibleLists(visibleTypes)

  //   const defaultProposalSelectedListName = Object.keys(visibleTypes).find((key: string) =>
  //     Boolean(visibleTypes[key]),
  //   ) as 'wating' | 'ongoingVoiting' | 'ongoingTimeLock' | 'next' | 'history' | undefined

  //   switch (defaultProposalSelectedListName) {
  //     case 'wating':
  //       setRightSideContent(watingProposals[0])
  //       break
  //     case 'ongoingVoiting':
  //       setRightSideContent(ongoingProposals[0])
  //       break
  //     case 'ongoingTimeLock':
  //       setRightSideContent(ongoingProposals[0])
  //       break
  //     case 'next':
  //       setRightSideContent(nextProposals[0])
  //       break
  //     case 'history':
  //       setRightSideContent(pastProposals[0])
  //       break
  //   }
  // }, [
  //   isVisibleWating,
  //   isVisibleOngoingVoting,
  //   isVisibleOngoingTimeLock,
  //   isVisibleNextProposal,
  //   isVisibleHistoryProposal,
  //   watingProposals,
  //   ongoingProposals,
  //   nextProposals,
  //   pastProposals,
  // ])

  useEffect(() => {
    if (!someVisible) {
      setRightSideContent(undefined)
    }
  }, [someVisible])

  return (
    <Page>
      <PageHeader page={'governance'} />
      <GovernanceTopBar governancePhase={governancePhase} />

      {isLoading ? null : (
        <GovernanceStyled>
          {/* {someVisible ? ( */}
          <GovernanceLeftContainer>
            {/* {isVisibleWating && (
        <Proposals
          proposalsList={watingProposals}
          handleItemSelect={_handleItemSelect}
          selectedProposal={rightSideContent}
          title="Waiting for Execution"
          type="wating"
          listName={WAITING_PROPOSALS_LIST_NAME}
        />
      )}
      {isVisibleWatingPayment && (
        <Proposals
          proposalsList={waitingForPaymentToBeProcessed}
          handleItemSelect={_handleItemSelect}
          selectedProposal={rightSideContent}
          title="Waiting For Payment To Be Processed"
          type="wating"
          listName={WAITING_FOR_PAYMENT_PROPOSALS_LIST_NAME}
        />
      )}
      {isVisibleOngoingVoting && (
        <Proposals
          proposalsList={ongoingProposals}
          handleItemSelect={_handleItemSelect}
          selectedProposal={rightSideContent}
          type="ongoingVoiting"
          listName={ONGOING_VOTING_PROPOSALS_LIST_NAME}
        />
      )}
      {isVisibleOngoingTimeLock && (
        <Proposals
          proposalsList={ongoingProposals}
          handleItemSelect={_handleItemSelect}
          selectedProposal={rightSideContent}
          type="ongoingTimeLock"
          listName={ONGOING_PROPOSALS_LIST_NAME}
        />
      )}
      {isVisibleNextProposal && (
        <Proposals
          proposalsList={nextProposals}
          handleItemSelect={_handleItemSelect}
          selectedProposal={rightSideContent}
          type="next"
          listName={NEXT_PROPOSALS_LIST_NAME}
        />
      )}
      {isVisibleHistoryProposal && (
        <Proposals
          proposalsList={pastProposals}
          handleItemSelect={_handleItemSelect}
          selectedProposal={rightSideContent}
          type="history"
          listName={HISTORY_PROPOSALS_LIST_NAME}
        />
      )} */}
            <Proposals
              proposalsList={currentProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="ongoingTimeLock"
              listName={ONGOING_PROPOSALS_LIST_NAME}
            />
          </GovernanceLeftContainer>
          {/*  ) : (
    emptyContainer
   )} */}
          {rightSideContent && rightSideContent.id !== 0 ? <ProposalDetails proposal={rightSideContent} /> : null}
        </GovernanceStyled>
      )}
    </Page>
  )
}
