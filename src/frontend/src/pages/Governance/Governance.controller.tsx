import { useDispatch, useSelector } from 'react-redux'
import { Page } from 'styles'
import { State } from 'reducers'

// actions
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'
import { getCurrentRoundProposals, executeProposal, getGovernanceStorage } from './Governance.actions'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { GovernanceView } from './Governance.view'
import { GovernanceTopBar } from './GovernanceTopBar/GovernanceTopBar.controller'

// hooks
import useGovernence from './UseGovernance'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

export type VoteStatistics = {
  passVotesMVKTotal: number
  forVotesMVKTotal: number
  againstVotesMVKTotal: number
  abstainVotesMVKTotal: number
  unusedVotesMVKTotal: number
}
export const Governance = () => {
  const dispatch = useDispatch()
  const { watingProposals, waitingForPaymentToBeProcessed } = useGovernence()

  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)
  const { governanceStorage, governancePhase, currentRoundProposals, pastProposals, isGovernanceStorageLoaded } =
    useSelector((state: State) => state.governance)
  const { isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      await Promise.all(
        [
          (!isEgovLoaded || isDepsChanged) && dispatch(getEmergencyGovernanceStorage()),
          (!isGovernanceStorageLoaded || isDepsChanged) && dispatch(getCurrentRoundProposals()),
          (!isGovernanceStorageLoaded || isDepsChanged) && dispatch(getGovernanceStorage()),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [])

  const isVotingRound = governancePhase === 'VOTING'
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  const ongoingProposals = currentRoundProposals?.filter(
    (item) =>
      (isVotingRound || isTimeLockRound) &&
      Boolean(item.currentRoundProposal) &&
      Boolean(item.id === governanceStorage.cycleHighestVotedProposalId),
  )

  const handleExecuteProposal = (id: number) => {
    dispatch(executeProposal(id))
  }

  return (
    <Page>
      <PageHeader page={'governance'} />
      <GovernanceTopBar governancePhase={governancePhase} />
      <GovernanceView
        handleExecuteProposal={handleExecuteProposal}
        accountPkh={accountPkh}
        userIsSatellite={Boolean(isSatellite)}
        ongoingProposals={ongoingProposals}
        nextProposals={currentRoundProposals}
        watingProposals={watingProposals}
        waitingForPaymentToBeProcessed={waitingForPaymentToBeProcessed}
        pastProposals={pastProposals}
        governancePhase={governancePhase}
      />
    </Page>
  )
}
